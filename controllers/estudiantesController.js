const db = require('../models');
const Estudiantes = db.estudiantes_model;
const LogrosEstudiante = db.logros_estudiante_model;

exports.getPerfilCompleto = async (req, res) => {
    try {
        const { id } = req.params;
        const estudiante = await Estudiantes.findByPk(id, {
            include: [{
                model: LogrosEstudiante,
                as: 'logros'
            }]
        });
        
        if (!estudiante) return res.status(404).json({ message: "No encontrado" });
        
        res.status(200).json({ success: true, data: estudiante });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};