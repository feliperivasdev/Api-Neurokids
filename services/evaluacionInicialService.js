const crypto = require('crypto');
const { Op } = require('sequelize');
const db = require('../models');
const { generarLecturaConPreguntas } = require('./iaGeneracionService');
const { getParamsPorEdad, getTemasParaGrupo, esTemaValido } = require('../config/temas');

const GruposEdad            = db.grupos_edad_model;
const ParametrosGeneracion  = db.parametros_generacion_lectura_model;
const LecturasGeneradas     = db.lecturas_generadas_model;
const EvaluacionesIniciales = db.evaluaciones_iniciales_model;
const PreguntasEvaluacion   = db.preguntas_evaluacion_model;
const OpcionesRespuesta     = db.opciones_respuesta_model;
const ResultadosEvaluacion  = db.resultados_evaluacion_model;
const RespuestasEstudiante  = db.respuestas_estudiante_model;
const Estudiantes           = db.estudiantes_model;

async function getTemasDisponibles(grupoEdadId) {
  const grupo = await GruposEdad.findByPk(grupoEdadId);
  if (!grupo) throw { status: 404, message: 'Grupo de edad no encontrado' };
  return getTemasParaGrupo(grupo.edad_minima);
}

async function setupEvaluacionInicial({ estudiante_id, edad, tema }) {
  // --- Validations OUTSIDE transaction (read-only) ---
  const estudiante = await Estudiantes.findByPk(estudiante_id);
  if (!estudiante) throw { status: 404, message: 'Estudiante no encontrado' };

  const edadNum = parseInt(edad, 10);

  const grupoEdad = await GruposEdad.findOne({
    where: { edad_minima: { [Op.lte]: edadNum }, edad_maxima: { [Op.gte]: edadNum } }
  });
  if (!grupoEdad) throw { status: 404, message: `No existe grupo de edad configurado para ${edadNum} años` };

  if (!esTemaValido(tema, grupoEdad.edad_minima)) {
    throw { status: 400, message: `Tema "${tema}" no válido para este grupo de edad` };
  }

  const evaluacionesDelGrupo = await EvaluacionesIniciales.findAll({
    where: { grupo_edad_id: grupoEdad.id },
    attributes: ['id']
  });
  const evaluacionIds = evaluacionesDelGrupo.map(e => e.id);
  if (evaluacionIds.length > 0) {
    const yaExiste = await ResultadosEvaluacion.findOne({
      where: { estudiante_id, evaluacion_id: evaluacionIds }
    });
    if (yaExiste) throw { status: 409, message: 'El estudiante ya completó la evaluación inicial' };
  }

  const params = getParamsPorEdad(edadNum);

  // --- IA call OUTSIDE transaction (cannot rollback external calls) ---
  let iaResult;
  try {
    iaResult = await generarLecturaConPreguntas({
      edad: edadNum,
      tema,
      minPalabras: params.minPalabras,
      maxPalabras: params.maxPalabras
    });
  } catch (err) {
    console.error('Error en llamada a IA:', err);
    if (err.code === 'ECONNABORTED') throw { status: 504, message: 'Timeout: la IA tardó demasiado' };
    if (err.response?.status === 401) throw { status: 401, message: 'Error de autenticación con la IA. Verifica tu API key.' };
    if (err.response?.status === 429) throw { status: 429, message: 'Límite de rate limit alcanzado. Intenta más tarde.' };
    if (err.response) throw { status: 502, message: 'Error al comunicarse con la IA', detalle: err.message };
    throw { status: 502, message: 'Error al procesar respuesta de la IA', detalle: err.message };
  }

  // Validar que iaResult tiene la estructura esperada
  if (!iaResult || !iaResult.data) {
    throw { status: 502, message: 'Respuesta inválida de la IA: estructura incompleta' };
  }

  const iaData = iaResult.data;
  const providerModel = process.env.IA_MODEL || (
    process.env.IA_PROVIDER === 'openai' ? 'gpt-4o-mini' :
    process.env.IA_PROVIDER === 'gemini' ? 'gemini-1.5-flash' : 'claude-opus-4-5'
  );

  // --- ALL DB writes inside a Sequelize transaction ---
  try {
    return await db.sequelize.transaction(async (t) => {
      const base = crypto.randomInt(1e13, 9e13);

      const parametro = await ParametrosGeneracion.create({
        id: base,
        nombre: `Param-${estudiante_id}-${tema}-${base}`,
        grupo_edad_id: grupoEdad.id,
        nivel_lectura: params.nivelLectura,
        temas_preferidos: [tema],
        longitud_palabras: params.longitudPalabras,
        tipo_narrativa: 'cuento',
        dificultad_vocabulario: 'simple',
        estado: true
      }, { transaction: t });

      const lectura = await LecturasGeneradas.create({
        id: base + 1,
        titulo: iaData.titulo,
        contenido: iaData.contenido,
        resumen: iaData.resumen,
        parametro_generacion_id: parametro.id,
        estudiante_id,
        grupo_edad_id: grupoEdad.id,
        nivel_lectura: params.nivelLectura,
        temas_abordados: [tema],
        numero_palabras: iaData.numero_palabras,
        tiempo_lectura_estimado: iaData.tiempo_lectura_estimado,
        modelo_ia_usado: providerModel,
        prompt_generacion: iaResult.prompt,
        estado: 'generando'
      }, { transaction: t });

      const evaluacion = await EvaluacionesIniciales.create({
        id: base + 2,
        nombre: `Actividad de lectura - ${tema}`,
        grupo_edad_id: grupoEdad.id,
        numero_preguntas: 5,
        puntuacion_maxima: 5,
        puntuacion_minima: 0,
        estado: true,
        orden_presentacion: 1
      }, { transaction: t });

      const preguntasCreadas = [];
      for (const pIA of iaData.preguntas) {
        const pregunta = await PreguntasEvaluacion.create({
          id: base + 10 + pIA.orden_pregunta,
          evaluacion_id: evaluacion.id,
          pregunta: pIA.pregunta,
          tipo_pregunta: 'multiple_choice',
          puntuacion: 1,
          orden_pregunta: pIA.orden_pregunta,
          estado: true
        }, { transaction: t });

        const opcionesCreadas = [];
        for (const oIA of pIA.opciones) {
          const opcion = await OpcionesRespuesta.create({
            id: base + 100 + pIA.orden_pregunta * 10 + oIA.orden_opcion,
            pregunta_id: pregunta.id,
            texto_opcion: oIA.texto_opcion,
            es_correcta: oIA.es_correcta,
            orden_opcion: oIA.orden_opcion
          }, { transaction: t });
          opcionesCreadas.push({
            id: opcion.id,
            texto_opcion: opcion.texto_opcion,
            orden_opcion: opcion.orden_opcion
          });
        }

        preguntasCreadas.push({
          id: pregunta.id,
          pregunta: pregunta.pregunta,
          orden_pregunta: pregunta.orden_pregunta,
          opciones: opcionesCreadas
        });
      }

      const resultado = await ResultadosEvaluacion.create({
        id: base + 200,
        estudiante_id,
        evaluacion_id: evaluacion.id,
        puntuacion_total: 0,
        puntuacion_maxima: 5,
        completado: false
      }, { transaction: t });

      return {
        evaluacion_inicial_id: evaluacion.id,
        resultado_evaluacion_id: resultado.id,
        lectura: {
          id: lectura.id,
          titulo: lectura.titulo,
          contenido: lectura.contenido,
          resumen: lectura.resumen,
          tiempo_lectura_estimado: lectura.tiempo_lectura_estimado
        },
        preguntas: preguntasCreadas
      };
    });
  } catch (err) {
    console.error('Error en transacción de evaluación:', err.message);
    console.error('Stack:', err.stack);
    throw { status: 500, message: 'Error al guardar evaluación en BD', detalle: err.message };
  }
}

async function responderEvaluacion({ resultado_evaluacion_id, respuestas, estudiante_id }) {
  const resultado = await ResultadosEvaluacion.findByPk(resultado_evaluacion_id);
  if (!resultado) throw { status: 404, message: 'Resultado de evaluación no encontrado' };
  if (resultado.completado) throw { status: 409, message: 'Esta evaluación ya fue completada' };
  if (String(resultado.estudiante_id) !== String(estudiante_id)) {
    throw { status: 403, message: 'No autorizado para responder esta evaluación' };
  }

  // Fetch evaluacion to get the real numero_preguntas (Fix 6)
  const evaluacionInfo = await EvaluacionesIniciales.findByPk(resultado.evaluacion_id);
  const totalPreguntas = evaluacionInfo ? evaluacionInfo.numero_preguntas : 5;

  let correctas = 0;
  const base = crypto.randomInt(1e13, 9e13);

  for (let i = 0; i < respuestas.length; i++) {
    const r = respuestas[i];
    const opcion = await OpcionesRespuesta.findByPk(r.opcion_seleccionada_id);
    const esCorrecta = opcion ? opcion.es_correcta === true : false;
    if (esCorrecta) correctas++;

    // Insert directo para evitar problema con campo virtual 'estudiante_id'
    await db.sequelize.query(
      `INSERT INTO respuestas_estudiante 
       (id, resultado_evaluacion_id, pregunta_id, opcion_seleccionada_id, es_correcta, tiempo_respuesta, intentos, created_at, updated_at) 
       VALUES (:id, :resultado_evaluacion_id, :pregunta_id, :opcion_seleccionada_id, :es_correcta, :tiempo_respuesta, :intentos, now(), now())`,
      {
        replacements: {
          id: base + i,
          resultado_evaluacion_id,
          pregunta_id: r.pregunta_id,
          opcion_seleccionada_id: r.opcion_seleccionada_id,
          es_correcta: esCorrecta,
          tiempo_respuesta: r.tiempo_respuesta || null,
          intentos: 1
        }
      }
    );
  }

  const porcentaje = parseFloat(((correctas / totalPreguntas) * 100).toFixed(2));

  await resultado.update({
    puntuacion_total: correctas,
    puntuacion_maxima: totalPreguntas,
    porcentaje_aciertos: porcentaje,
    completado: true,
    completado_at: new Date()
  });

  return {
    completado: true,
    puntuacion_total: correctas,
    puntuacion_maxima: totalPreguntas,
    porcentaje_aciertos: porcentaje
  };
}

async function verificarEvaluacionInicial(estudiante_id) {
  const estudiante = await Estudiantes.findByPk(estudiante_id);
  if (!estudiante) throw { status: 404, message: 'Estudiante no encontrado' };

  const edadEstudiante = parseInt(estudiante.edad || 0, 10);
  const grupoEdad = await GruposEdad.findOne({
    where: { edad_minima: { [Op.lte]: edadEstudiante }, edad_maxima: { [Op.gte]: edadEstudiante } }
  });

  if (!grupoEdad) return { tiene_evaluacion: false };

  const evaluaciones = await EvaluacionesIniciales.findAll({
    where: { grupo_edad_id: grupoEdad.id },
    attributes: ['id']
  });

  if (!evaluaciones.length) return { tiene_evaluacion: false };

  const resultado = await ResultadosEvaluacion.findOne({
    where: {
      estudiante_id,
      evaluacion_id: evaluaciones.map(e => e.id)
    }
  });

  return { tiene_evaluacion: !!resultado };
}

module.exports = { setupEvaluacionInicial, responderEvaluacion, getTemasDisponibles, verificarEvaluacionInicial };
