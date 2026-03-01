const db = require('../models');
const NotificacionesEstudiante = db.notificaciones_estudiante_model;

// Obtener notificaciones pendientes de un estudiante
exports.getNotificacionesPendientes = async (req, res) => {
    try {
        const { estudiante_id } = req.params;
        
        const notificaciones = await NotificacionesEstudiante.findAll({
            where: {
                estudiante_id: estudiante_id,
                leida: false
            },
            order: [['created_at', 'DESC']]
        });

        res.status(200).json({
            success: true,
            data: notificaciones,
            total: notificaciones.length
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Opción A: Marcar TODAS las pendientes de un estudiante como leídas
exports.marcarTodasComoLeidas = async (req, res) => {
    try {
        const { estudiante_id } = req.params;
        
        const [updatedRows] = await NotificacionesEstudiante.update(
            { 
                leida: true, 
                updated_at: new Date() 
            },
            { 
                where: { 
                    estudiante_id: estudiante_id,
                    leida: false 
                } 
            }
        );

        res.status(200).json({ 
            success: true, 
            message: `${updatedRows} notificaciones marcadas como leídas` 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Opción B: Marcar solo la de "insignia" de bienvenida por estudiante_id
exports.marcarInsigniaBienvenidaLeida = async (req, res) => {
    try {
        const { estudiante_id } = req.params;
        
        await NotificacionesEstudiante.update(
            { leida: true, updated_at: new Date() },
            { 
                where: { 
                    estudiante_id: estudiante_id,
                    tipo_notificacion: 'insignia',
                    insignia_relacionada_id: 14,
                    leida: false
                } 
            }
        );

        res.status(200).json({ success: true, message: 'Insignia de bienvenida marcada como leída' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};