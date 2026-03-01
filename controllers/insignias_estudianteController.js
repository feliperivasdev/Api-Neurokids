const db = require('../models');
const InsigniasEstudiante = db.insignias_estudiante_model;
const Insignias = db.insignias_model;

exports.getInsigniasPorEstudiante = async (req, res) => {
    try {
        const { estudiante_id } = req.params;
        const insignias = await InsigniasEstudiante.findAll({
            where: { estudiante_id },
            include: [{
                model: Insignias,
                as: 'insignia' // Verifica que este alias coincida en tu modelo insignias_estudiante.js
            }]
        });
        res.status(200).json({ success: true, data: insignias });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};