const db = require('../models');
const Actividades = db.actividades_model;

// GET /actividades
// Lista actividades para que el front pueda mapear rutas -> actividad_id
exports.listarActividades = async (req, res) => {
  try {
    const { grupo_edad_id, tipo_actividad_id, nivel } = req.query;
    const where = {};
    if (grupo_edad_id) where.grupo_edad_id = grupo_edad_id;
    if (tipo_actividad_id) where.tipo_actividad_id = tipo_actividad_id;
    if (nivel) where.nivel = nivel;

    const actividades = await Actividades.findAll({
      where,
      attributes: [
        'id',
        'nombre',
        'descripcion',
        'tipo_actividad_id',
        'grupo_edad_id',
        'nivel',
        'puntuacion_maxima',
        'ruta_recurso',
        'estado',
        'orden_presentacion'
      ],
      order: [['grupo_edad_id', 'ASC'], ['tipo_actividad_id', 'ASC'], ['orden_presentacion', 'ASC']]
    });

    return res.status(200).json({
      success: true,
      data: { actividades },
      message: 'Actividades obtenidas exitosamente'
    });
  } catch (error) {
    console.error('Error en listarActividades:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

