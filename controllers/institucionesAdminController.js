const db = require('../models');
const Institucion = db.instituciones_model;

// GET /instituciones-admin
exports.obtenerInstitucionesAdmin = async (req, res) => {
  try {
    const instituciones = await Institucion.findAll({
      attributes: ['id', 'nombre', 'direccion', 'telefono', 'correo', 'estado', 'created_at'],
      order: [['nombre', 'ASC']]
    });

    return res.status(200).json({
      success: true,
      data: { instituciones },
      message: 'Instituciones obtenidas exitosamente'
    });
  } catch (error) {
    console.error('Error en obtenerInstitucionesAdmin:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /instituciones-admin
exports.crearInstitucionAdmin = async (req, res) => {
  try {
    const { nombre, direccion, telefono, correo, estado } = req.body;

    if (!nombre) {
      return res.status(400).json({ success: false, message: 'El nombre es requerido' });
    }

    const nueva = await Institucion.create({
      nombre: nombre.trim(),
      direccion: direccion || null,
      telefono: telefono || null,
      correo: correo || null,
      estado: estado !== undefined ? estado : true
    });

    return res.status(201).json({
      success: true,
      data: nueva,
      message: 'Institución creada exitosamente'
    });
  } catch (error) {
    console.error('Error en crearInstitucionAdmin:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /instituciones-admin/:id
exports.actualizarInstitucionAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, direccion, telefono, correo, estado } = req.body;

    const institucion = await Institucion.findByPk(id);
    if (!institucion) {
      return res.status(404).json({ success: false, message: 'Institución no encontrada' });
    }

    await institucion.update({
      nombre: nombre !== undefined ? nombre.trim() : institucion.nombre,
      direccion: direccion !== undefined ? direccion : institucion.direccion,
      telefono: telefono !== undefined ? telefono : institucion.telefono,
      correo: correo !== undefined ? correo : institucion.correo,
      estado: estado !== undefined ? estado : institucion.estado
    });

    return res.status(200).json({
      success: true,
      data: institucion,
      message: 'Institución actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error en actualizarInstitucionAdmin:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

