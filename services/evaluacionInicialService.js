const db = require('../models');
const { generarLecturaConPreguntas } = require('./iaGeneracionService');
const { getParamsPorEdad, getTemasParaGrupo, esTemValido } = require('../config/temas');

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
  const estudiante = await Estudiantes.findByPk(estudiante_id);
  if (!estudiante) throw { status: 404, message: 'Estudiante no encontrado' };

  const grupoEdad = await GruposEdad.findOne({
    where: db.sequelize.literal(`edad_minima <= ${parseInt(edad)} AND edad_maxima >= ${parseInt(edad)}`)
  });
  if (!grupoEdad) throw { status: 404, message: `No existe grupo de edad configurado para ${edad} años` };

  if (!esTemValido(tema, grupoEdad.edad_minima)) {
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

  const params = getParamsPorEdad(edad);
  const base = Date.now();

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
  });

  let iaResult;
  try {
    iaResult = await generarLecturaConPreguntas({
      edad,
      tema,
      minPalabras: params.minPalabras,
      maxPalabras: params.maxPalabras
    });
  } catch (err) {
    if (err.code === 'ECONNABORTED') throw { status: 504, message: 'Timeout: la IA tardó demasiado' };
    if (err.response) throw { status: 502, message: 'Error al comunicarse con la IA', detalle: err.message };
    throw { status: 502, message: 'Error al procesar respuesta de la IA', detalle: err.message };
  }

  const iaData = iaResult.data;
  const providerModel = process.env.IA_MODEL || (
    process.env.IA_PROVIDER === 'openai' ? 'gpt-4o-mini' :
    process.env.IA_PROVIDER === 'gemini' ? 'gemini-1.5-flash' : 'claude-opus-4-5'
  );

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
    estado: 'lista'
  });

  const evaluacion = await EvaluacionesIniciales.create({
    id: base + 2,
    nombre: `Actividad de lectura - ${tema}`,
    grupo_edad_id: grupoEdad.id,
    numero_preguntas: 5,
    puntuacion_maxima: 5,
    puntuacion_minima: 0,
    estado: true,
    orden_presentacion: 1
  });

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
    });

    const opcionesCreadas = [];
    for (const oIA of pIA.opciones) {
      const opcion = await OpcionesRespuesta.create({
        id: base + 100 + pIA.orden_pregunta * 10 + oIA.orden_opcion,
        pregunta_id: pregunta.id,
        texto_opcion: oIA.texto_opcion,
        es_correcta: oIA.es_correcta,
        orden_opcion: oIA.orden_opcion
      });
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
  });

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
}

async function responderEvaluacion({ resultado_evaluacion_id, respuestas }) {
  const resultado = await ResultadosEvaluacion.findByPk(resultado_evaluacion_id);
  if (!resultado) throw { status: 404, message: 'Resultado de evaluación no encontrado' };
  if (resultado.completado) throw { status: 409, message: 'Esta evaluación ya fue completada' };

  let correctas = 0;
  const base = Date.now();

  for (let i = 0; i < respuestas.length; i++) {
    const r = respuestas[i];
    const opcion = await OpcionesRespuesta.findByPk(r.opcion_seleccionada_id);
    const esCorrecta = opcion ? opcion.es_correcta === true : false;
    if (esCorrecta) correctas++;

    await RespuestasEstudiante.create({
      id: base + i,
      resultado_evaluacion_id,
      pregunta_id: r.pregunta_id,
      opcion_seleccionada_id: r.opcion_seleccionada_id,
      es_correcta: esCorrecta,
      tiempo_respuesta: r.tiempo_respuesta || null,
      intentos: 1
    });
  }

  const porcentaje = parseFloat(((correctas / 5) * 100).toFixed(2));

  await resultado.update({
    puntuacion_total: correctas,
    porcentaje_aciertos: porcentaje,
    completado: true,
    completado_at: new Date()
  });

  return {
    completado: true,
    puntuacion_total: correctas,
    puntuacion_maxima: 5,
    porcentaje_aciertos: porcentaje
  };
}

async function verificarEvaluacionInicial(estudiante_id) {
  const estudiante = await Estudiantes.findByPk(estudiante_id);
  if (!estudiante) throw { status: 404, message: 'Estudiante no encontrado' };

  const edadEstudiante = parseInt(estudiante.edad || 0);
  const grupoEdad = await GruposEdad.findOne({
    where: db.sequelize.literal(`edad_minima <= ${edadEstudiante} AND edad_maxima >= ${edadEstudiante}`)
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
