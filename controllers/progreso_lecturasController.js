const db = require('../models');
const ProgresoLecturas = db.progreso_lecturas_model;
const LecturasGeneradas = db.lecturas_generadas_model;
const Estudiantes = db.estudiantes_model;

// Guardar o actualizar progreso de una lectura
// POST /progreso-lecturas
exports.guardarProgresoLectura = async (req, res) => {
    try {
        const {
            estudiante_id,
            lectura_id,
            porcentaje_avance,
            completado,
            tiempo_lectura,
            nivel_dificultad_percibido,
            comentario_estudiante,
            palabras_consultadas
        } = req.body;

        if (!estudiante_id || !lectura_id) {
            return res.status(400).json({
                success: false,
                message: 'Estudiante ID y Lectura ID son requeridos'
            });
        }

        const estudiante = await Estudiantes.findByPk(estudiante_id);
        if (!estudiante) {
            return res.status(404).json({
                success: false,
                message: 'Estudiante no encontrado'
            });
        }

        const lectura = await LecturasGeneradas.findByPk(lectura_id);
        if (!lectura) {
            return res.status(404).json({
                success: false,
                message: 'Lectura no encontrada'
            });
        }

        let progreso = await ProgresoLecturas.findOne({
            where: { estudiante_id, lectura_id }
        });

        const ahora = new Date();

        if (progreso) {
            await progreso.update({
                porcentaje_avance: porcentaje_avance ?? progreso.porcentaje_avance,
                completado: completado !== undefined ? completado : progreso.completado,
                tiempo_lectura: tiempo_lectura !== undefined
                    ? (progreso.tiempo_lectura || 0) + tiempo_lectura
                    : progreso.tiempo_lectura,
                nivel_dificultad_percibido: nivel_dificultad_percibido ?? progreso.nivel_dificultad_percibido,
                comentario_estudiante: comentario_estudiante ?? progreso.comentario_estudiante,
                palabras_consultadas: palabras_consultadas ?? progreso.palabras_consultadas,
                updated_at: ahora
            });

            return res.status(200).json({
                success: true,
                message: 'Progreso de lectura actualizado exitosamente',
                data: progreso
            });
        } else {
            const generateManualId = () => Math.floor(Date.now() + Math.random() * 1000);
            progreso = await ProgresoLecturas.create({
                id: generateManualId(),
                estudiante_id,
                lectura_id,
                porcentaje_avance: porcentaje_avance ?? 0,
                completado: completado ?? false,
                tiempo_lectura: tiempo_lectura ?? 0,
                nivel_dificultad_percibido: nivel_dificultad_percibido ?? null,
                comentario_estudiante: comentario_estudiante ?? null,
                palabras_consultadas: palabras_consultadas ?? null,
                created_at: ahora,
                updated_at: ahora
            });

            return res.status(201).json({
                success: true,
                message: 'Progreso de lectura registrado exitosamente',
                data: progreso
            });
        }
    } catch (error) {
        console.error('Error guardando progreso de lectura:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al guardar progreso de lectura',
            error: error.message
        });
    }
};

// Obtener progreso de lecturas de un estudiante
// GET /progreso-lecturas/estudiante/:estudiante_id
exports.getProgresoLecturasEstudiante = async (req, res) => {
    try {
        const { estudiante_id } = req.params;

        const estudiante = await Estudiantes.findByPk(estudiante_id);
        if (!estudiante) {
            return res.status(404).json({
                success: false,
                message: 'Estudiante no encontrado'
            });
        }

        const progresos = await ProgresoLecturas.findAll({
            where: { estudiante_id },
            include: [
                {
                    model: LecturasGeneradas,
                    as: 'lectura',
                    attributes: ['id', 'titulo', 'tema', 'grupo_edad_id']
                }
            ],
            order: [['updated_at', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            data: progresos
        });
    } catch (error) {
        console.error('Error obteniendo progreso de lecturas:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener progreso de lecturas',
            error: error.message
        });
    }
};

// Obtener progreso específico de una lectura
// GET /progreso-lecturas/lectura/:lectura_id/estudiante/:estudiante_id
exports.getProgresoLectura = async (req, res) => {
    try {
        const { lectura_id, estudiante_id } = req.params;

        const progreso = await ProgresoLecturas.findOne({
            where: { lectura_id, estudiante_id },
            include: [
                {
                    model: LecturasGeneradas,
                    as: 'lectura',
                    attributes: ['id', 'titulo', 'tema', 'grupo_edad_id']
                }
            ]
        });

        if (!progreso) {
            return res.status(404).json({
                success: false,
                message: 'Progreso de lectura no encontrado'
            });
        }

        return res.status(200).json({
            success: true,
            data: progreso
        });
    } catch (error) {
        console.error('Error obteniendo progreso de lectura:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener progreso de lectura',
            error: error.message
        });
    }
};

