const db = require('../models');
const Insignias = db.insignias_model;

// Obtener una insignia específica por ID
exports.getInsigniaById = async (req, res) => {
    try {
        const { id } = req.params;
        const insignia = await Insignias.findByPk(id);

        if (!insignia) {
            return res.status(404).json({
                success: false,
                message: 'Insignia no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: insignia
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Obtener todas las insignias activas
exports.getAllInsignias = async (req, res) => {
    try {
        const insignias = await Insignias.findAll({
            where: { estado: true },
            order: [['orden_presentacion', 'ASC']]
        });

        res.status(200).json({
            success: true,
            data: insignias
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};