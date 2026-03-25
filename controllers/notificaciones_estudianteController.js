const db = require('../models');
const NotificacionesEstudiante = db.notificaciones_estudiante_model;
const Insignias = db.insignias_model;

// Obtener notificaciones pendientes de un estudiante
exports.getNotificacionesPendientes = async (req, res) => {
    try {
        const { estudiante_id } = req.params;
        const estudianteIdNum = parseInt(estudiante_id, 10);
        if (!Number.isFinite(estudianteIdNum)) {
            return res.status(400).json({ success: false, message: 'estudiante_id inválido' });
        }

        const notificaciones = await NotificacionesEstudiante.findAll({
            where: {
                estudiante_id: estudianteIdNum,
                leida: false
            },
            include: [
                {
                    model: Insignias,
                    as: 'insignia',
                    attributes: [
                        'id',
                        'nombre',
                        'descripcion',
                        'icono',
                        'color_hex',
                        'categoria',
                        'rareza',
                        'puntos_otorgados',
                        'estado'
                    ],
                    required: false
                }
            ],
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
        const estudianteIdNum = parseInt(estudiante_id, 10);
        if (!Number.isFinite(estudianteIdNum)) {
            return res.status(400).json({ success: false, message: 'estudiante_id inválido' });
        }

        const [updatedRows] = await NotificacionesEstudiante.update(
            {
                leida: true,
                updated_at: new Date()
            },
            {
                where: {
                    estudiante_id: estudianteIdNum,
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
        const estudianteIdNum = parseInt(estudiante_id, 10);
        if (!Number.isFinite(estudianteIdNum)) {
            return res.status(400).json({ success: false, message: 'estudiante_id inválido' });
        }

        await NotificacionesEstudiante.update(
            { leida: true, updated_at: new Date() },
            {
                where: {
                    estudiante_id: estudianteIdNum,
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

/** Marca una notificación concreta como leída (cualquier tipo). */
exports.marcarUnaComoLeida = async (req, res) => {
    try {
        const { estudiante_id, notificacion_id } = req.params;
        const estudianteIdNum = parseInt(estudiante_id, 10);
        const notifId = parseInt(notificacion_id, 10);
        if (!Number.isFinite(estudianteIdNum) || !Number.isFinite(notifId)) {
            return res.status(400).json({ success: false, message: 'Parámetros inválidos' });
        }

        const [n] = await NotificacionesEstudiante.update(
            { leida: true, updated_at: new Date() },
            {
                where: {
                    id: notifId,
                    estudiante_id: estudianteIdNum,
                    leida: false
                }
            }
        );

        return res.status(200).json({
            success: true,
            message: n ? 'Notificación marcada como leída' : 'No se encontró la notificación'
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};