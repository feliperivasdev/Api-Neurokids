const {
  setupEvaluacionInicial,
  responderEvaluacion,
  getTemasDisponibles,
  verificarEvaluacionInicial
} = require('../services/evaluacionInicialService');

exports.getTemas = async (req, res) => {
  try {
    const { grupo_edad_id } = req.params;
    const id = parseInt(grupo_edad_id, 10);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ success: false, message: 'grupo_edad_id inválido' });
    }
    const temas = await getTemasDisponibles(id);
    return res.status(200).json({ success: true, grupo_edad_id: id, temas });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ success: false, message: err.message || 'Error interno' });
  }
};

exports.verificarEvaluacion = async (req, res) => {
  try {
    const { estudiante_id } = req.params;
    const id = parseInt(estudiante_id, 10);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ success: false, message: 'estudiante_id inválido' });
    }
    const resultado = await verificarEvaluacionInicial(id);
    return res.status(200).json({ success: true, ...resultado });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ success: false, message: err.message || 'Error interno' });
  }
};

exports.setup = async (req, res) => {
  try {
    const { estudiante_id, edad, tema } = req.body;

    if (!estudiante_id || !edad || !tema) {
      return res.status(400).json({ success: false, message: 'estudiante_id, edad y tema son requeridos' });
    }

    const edadNum = parseInt(edad, 10);
    if (!Number.isFinite(edadNum) || edadNum < 3 || edadNum > 18) {
      return res.status(400).json({ success: false, message: 'edad debe ser un número entre 3 y 18' });
    }

    if (typeof tema !== 'string' || tema.trim() === '') {
      return res.status(400).json({ success: false, message: 'tema inválido' });
    }

    const resultado = await setupEvaluacionInicial({
      estudiante_id: parseInt(estudiante_id, 10),
      edad: edadNum,
      tema: tema.trim().toLowerCase()
    });

    return res.status(201).json({ success: true, ...resultado });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ success: false, message: err.message || 'Error interno', detalle: err.detalle });
  }
};

exports.responder = async (req, res) => {
  try {
    const { resultado_evaluacion_id, respuestas } = req.body;

    if (!resultado_evaluacion_id || !Array.isArray(respuestas) || respuestas.length === 0) {
      return res.status(400).json({ success: false, message: 'resultado_evaluacion_id y respuestas[] son requeridos' });
    }

    for (const r of respuestas) {
      if (!r.pregunta_id || !r.opcion_seleccionada_id) {
        return res.status(400).json({ success: false, message: 'Cada respuesta requiere pregunta_id y opcion_seleccionada_id' });
      }
    }

    const resultado = await responderEvaluacion({
      resultado_evaluacion_id: parseInt(resultado_evaluacion_id, 10),
      respuestas,
      estudiante_id: req.usuario.id  // from JWT token
    });

    return res.status(200).json({ success: true, ...resultado });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ success: false, message: err.message || 'Error interno' });
  }
};
