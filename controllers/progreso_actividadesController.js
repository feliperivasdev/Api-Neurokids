const db = require('../models');
const ProgresoActividades = db.progreso_actividades_model;
const SesionesActividad = db.sesiones_actividad_model;
const Actividades = db.actividades_model;
const Estudiantes = db.estudiantes_model;
const insigniasProgresoService = require('../services/insigniasProgresoService');
const { mergeDetalleNiveles, puntuacionMaximaEsperada } = require('../services/detalleNivelesHelper');

/**
 * Guardar o actualizar progreso de una actividad
 * POST /api/progreso-actividades
 * Acepta: respuestas_correctas, respuestas_incorrectas, uso_audio, nivel (para sesión)
 */
exports.guardarProgreso = async (req, res) => {
    try {
        const {
            estudiante_id,
            actividad_id,
            puntuacion,
            puntuacion_maxima,
            completado,
            completado_at,
            intentos,
            tiempo_total,
            ultima_interaccion,
            respuestas_correctas,
            respuestas_incorrectas,
            uso_audio,
            nivel
        } = req.body;

        const estudianteIdNum = parseInt(estudiante_id, 10);
        const actividadIdNum = parseInt(actividad_id, 10);

        // Validar datos requeridos
        if (!Number.isFinite(estudianteIdNum) || !Number.isFinite(actividadIdNum)) {
            return res.status(400).json({
                success: false,
                message: 'Estudiante ID y Actividad ID son requeridos'
            });
        }

        // Verificar que el estudiante existe
        const estudiante = await Estudiantes.findByPk(estudianteIdNum);
        if (!estudiante) {
            return res.status(404).json({
                success: false,
                message: 'Estudiante no encontrado'
            });
        }

        // Verificar que la actividad existe
        const actividad = await Actividades.findByPk(actividadIdNum);
        if (!actividad) {
            return res.status(404).json({
                success: false,
                message: 'Actividad no encontrada'
            });
        }

        // Buscar si ya existe progreso para esta actividad
        let progreso = await ProgresoActividades.findOne({
            where: {
                estudiante_id: estudianteIdNum,
                actividad_id: actividadIdNum
            }
        });
        const hadExisting = !!progreso;

        const ahora = new Date();

        const addCorrect = respuestas_correctas !== undefined ? respuestas_correctas : 0;
        const addIncorrect = respuestas_incorrectas !== undefined ? respuestas_incorrectas : 0;
        const addAudio = uso_audio !== undefined ? uso_audio : 0;

        const maxPtsCatalogo = puntuacionMaximaEsperada(actividad);
        const { merged, totalScore, activityComplete } = mergeDetalleNiveles(progreso, req.body, actividad);

        let completadoAt = null;
        if (activityComplete) {
            if (progreso && progreso.completado && progreso.completado_at) {
                completadoAt = progreso.completado_at;
            } else {
                completadoAt = ahora;
            }
        }

        const basePayload = {
            puntuacion: totalScore,
            puntuacion_maxima: maxPtsCatalogo,
            completado: activityComplete,
            completado_at: completadoAt,
            detalle_niveles: merged,
            intentos: progreso
                ? intentos !== undefined
                    ? (progreso.intentos || 0) + intentos
                    : progreso.intentos
                : intentos || 1,
            tiempo_total: progreso
                ? tiempo_total !== undefined
                    ? (progreso.tiempo_total || 0) + tiempo_total
                    : progreso.tiempo_total
                : tiempo_total || 0,
            respuestas_correctas: (progreso?.respuestas_correctas || 0) + addCorrect,
            respuestas_incorrectas: (progreso?.respuestas_incorrectas || 0) + addIncorrect,
            uso_audio: (progreso?.uso_audio || 0) + addAudio,
            ultima_interaccion: ultima_interaccion ? new Date(ultima_interaccion) : ahora,
            updated_at: ahora
        };

        const nivelSesion = nivel ?? actividad.nivel ?? 1;
        const sesionCompletado =
            activityComplete ||
            req.body.nivel_completado === true ||
            req.body.nivel_completado === 'true' ||
            completado === true;

        if (progreso) {
            await progreso.update(basePayload);
            await progreso.reload();
        } else {
            const generateManualId = () => Math.floor(Date.now() + Math.random() * 1000);
            progreso = await ProgresoActividades.create({
                id: generateManualId(),
                estudiante_id: estudianteIdNum,
                actividad_id: actividadIdNum,
                ...basePayload,
                respuestas_correctas: addCorrect,
                respuestas_incorrectas: addIncorrect,
                uso_audio: addAudio,
                tiempo_total: tiempo_total || 0,
                intentos: intentos || 1,
                created_at: ahora,
                updated_at: ahora
            });
            await progreso.reload();
        }

        const puntuacionSesion =
            puntuacion !== undefined && puntuacion !== null && Number.isFinite(Number(puntuacion))
                ? Number(puntuacion)
                : (totalScore ?? 0);
        const maxPtsSesion =
            puntuacion_maxima !== undefined && puntuacion_maxima !== null && Number.isFinite(Number(puntuacion_maxima))
                ? Number(puntuacion_maxima)
                : (maxPtsCatalogo || actividad.puntuacion_maxima || 100);

        await SesionesActividad.create({
            estudiante_id: estudianteIdNum,
            actividad_id: actividadIdNum,
            nivel: nivelSesion,
            fecha: ahora,
            duracion_seg: Number(tiempo_total) || 0,
            completado: sesionCompletado,
            respuestas_correctas: addCorrect,
            respuestas_incorrectas: addIncorrect,
            uso_audio: addAudio,
            puntuacion: puntuacionSesion,
            puntuacion_maxima: maxPtsSesion
        });

        let insignias_desbloqueadas = [];
        if (progreso.completado) {
            try {
                insignias_desbloqueadas = await insigniasProgresoService.evaluarInsigniasTrasActividad(
                    estudianteIdNum,
                    actividad,
                    true
                );
            } catch (insErr) {
                console.error('Error evaluando insignias:', insErr);
            }
        }

        return res.status(hadExisting ? 200 : 201).json({
            success: true,
            message: hadExisting ? 'Progreso actualizado exitosamente' : 'Progreso registrado exitosamente',
            data: progreso,
            insignias_desbloqueadas
        });
    } catch (error) {
        console.error('Error guardando progreso:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al guardar progreso',
            error: error.message
        });
    }
};

/**
 * Obtener progreso de un estudiante en todas sus actividades
 * GET /api/progreso/estudiante/:estudiante_id
 */
exports.getProgresoEstudiante = async (req, res) => {
    try {
        const { estudiante_id } = req.params;
        const estudianteIdNum = parseInt(estudiante_id, 10);

        // Verificar que el estudiante existe
        const estudiante = await Estudiantes.findByPk(estudianteIdNum);
        if (!estudiante) {
            return res.status(404).json({
                success: false,
                message: 'Estudiante no encontrado'
            });
        }

        // Obtener progreso del estudiante
        const progreso = await ProgresoActividades.findAll({
            where: { estudiante_id: estudianteIdNum },
            include: [
                {
                    model: Actividades,
                    as: 'actividad',
                    attributes: ['id', 'nombre', 'descripcion', 'tipo_actividad_id', 'grupo_edad_id', 'nivel', 'puntuacion_maxima', 'tiempo_estimado']
                }
            ],
            order: [['ultima_interaccion', 'DESC']]
        });

        // Calcular estadísticas
        const estadisticas = {
            total_actividades: progreso.length,
            completadas: progreso.filter(p => p.completado).length,
            pendientes: progreso.filter(p => !p.completado).length,
            puntuacion_total: progreso.reduce((sum, p) => sum + (p.puntuacion || 0), 0),
            puntuacion_promedio: progreso.length > 0 
                ? Math.round(progreso.reduce((sum, p) => sum + (p.puntuacion || 0), 0) / progreso.length)
                : 0,
            tiempo_total_invertido: progreso.reduce((sum, p) => sum + (p.tiempo_total || 0), 0),
            intentos_totales: progreso.reduce((sum, p) => sum + (p.intentos || 0), 0),
            porcentaje_completado: progreso.length > 0
                ? Math.round((progreso.filter(p => p.completado).length / progreso.length) * 100)
                : 0
        };

        return res.status(200).json({
            success: true,
            data: {
                progreso,
                estadisticas
            }
        });
    } catch (error) {
        console.error('Error obteniendo progreso del estudiante:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener progreso',
            error: error.message
        });
    }
};

/**
 * Obtener progreso específico de una actividad para un estudiante
 * GET /api/progreso/actividad/:actividad_id/estudiante/:estudiante_id
 */
exports.getProgresoActividad = async (req, res) => {
    try {
        const { actividad_id, estudiante_id } = req.params;
        const actividadIdNum = parseInt(actividad_id, 10);
        const estudianteIdNum = parseInt(estudiante_id, 10);

        const progreso = await ProgresoActividades.findOne({
            where: {
                actividad_id: actividadIdNum,
                estudiante_id: estudianteIdNum
            },
            include: [
                {
                    model: Actividades,
                    as: 'actividad',
                    attributes: ['id', 'nombre', 'descripcion', 'tipo_actividad_id', 'grupo_edad_id', 'nivel', 'puntuacion_maxima', 'tiempo_estimado']
                }
            ]
        });

        if (!progreso) {
            return res.status(404).json({
                success: false,
                message: 'Progreso no encontrado'
            });
        }

        return res.status(200).json({
            success: true,
            data: progreso
        });
    } catch (error) {
        console.error('Error obteniendo progreso de actividad:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener progreso',
            error: error.message
        });
    }
};

/**
 * Obtener resumen de progreso del estudiante (dashboard)
 * GET /api/progreso/resumen/:estudiante_id
 */
exports.getResumenProgreso = async (req, res) => {
    try {
        const { estudiante_id } = req.params;
        const estudianteIdNum = parseInt(estudiante_id, 10);

        // Verificar que el estudiante existe
        const estudiante = await Estudiantes.findByPk(estudianteIdNum);
        if (!estudiante) {
            return res.status(404).json({
                success: false,
                message: 'Estudiante no encontrado'
            });
        }

        // Obtener progreso del estudiante
        const progreso = await ProgresoActividades.findAll({
            where: { estudiante_id: estudianteIdNum },
            include: [
                {
                    model: Actividades,
                    as: 'actividad',
                    attributes: ['id', 'nombre', 'grupo_edad_id', 'tipo_actividad_id', 'nivel', 'puntuacion_maxima']
                }
            ]
        });

        // Agrupar por grupo de edad
        const resumenPorEdad = {};
        progreso.forEach(p => {
            const grupoEdad = p.actividad?.grupo_edad_id || 'sin_clasificar';
            if (!resumenPorEdad[grupoEdad]) {
                resumenPorEdad[grupoEdad] = {
                    total: 0,
                    completadas: 0,
                    puntuacion_total: 0,
                    tiempo_invertido: 0
                };
            }
            resumenPorEdad[grupoEdad].total++;
            if (p.completado) resumenPorEdad[grupoEdad].completadas++;
            resumenPorEdad[grupoEdad].puntuacion_total += p.puntuacion || 0;
            resumenPorEdad[grupoEdad].tiempo_invertido += p.tiempo_total || 0;
        });

        // Agrupar por tipo de actividad
        const resumenPorTipo = {};
        progreso.forEach(p => {
            const tipoActividad = p.actividad?.tipo_actividad_id || 'sin_clasificar';
            if (!resumenPorTipo[tipoActividad]) {
                resumenPorTipo[tipoActividad] = {
                    total: 0,
                    completadas: 0,
                    puntuacion_total: 0
                };
            }
            resumenPorTipo[tipoActividad].total++;
            if (p.completado) resumenPorTipo[tipoActividad].completadas++;
            resumenPorTipo[tipoActividad].puntuacion_total += p.puntuacion || 0;
        });

        const resumen = {
            estudiante_id: estudianteIdNum,
            total_actividades: progreso.length,
            completadas: progreso.filter(p => p.completado).length,
            pendientes: progreso.filter(p => !p.completado).length,
            porcentaje_completado: progreso.length > 0
                ? Math.round((progreso.filter(p => p.completado).length / progreso.length) * 100)
                : 0,
            puntuacion_total: progreso.reduce((sum, p) => sum + (p.puntuacion || 0), 0),
            puntuacion_promedio: progreso.length > 0
                ? Math.round(progreso.reduce((sum, p) => sum + (p.puntuacion || 0), 0) / progreso.length)
                : 0,
            tiempo_total_invertido: progreso.reduce((sum, p) => sum + (p.tiempo_total || 0), 0),
            intentos_totales: progreso.reduce((sum, p) => sum + (p.intentos || 0), 0),
            resumen_por_edad: resumenPorEdad,
            resumen_por_tipo: resumenPorTipo,
            ultima_actividad: progreso[0]?.ultima_interaccion || null
        };

        return res.status(200).json({
            success: true,
            data: resumen
        });
    } catch (error) {
        console.error('Error obteniendo resumen de progreso:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener resumen',
            error: error.message
        });
    }
};

/**
 * Obtener actividades pendientes de un estudiante
 * GET /api/progreso/pendientes/:estudiante_id
 */
exports.getActividadesPendientes = async (req, res) => {
    try {
        const { estudiante_id } = req.params;
        const estudianteIdNum = parseInt(estudiante_id, 10);

        const actividades = await ProgresoActividades.findAll({
            where: {
                estudiante_id: estudianteIdNum,
                completado: false
            },
            include: [
                {
                    model: Actividades,
                    as: 'actividad',
                    attributes: ['id', 'nombre', 'descripcion', 'tipo_actividad_id', 'grupo_edad_id', 'nivel', 'puntuacion_maxima']
                }
            ],
            order: [['ultima_interaccion', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            data: actividades
        });
    } catch (error) {
        console.error('Error obteniendo actividades pendientes:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener actividades pendientes',
            error: error.message
        });
    }
};