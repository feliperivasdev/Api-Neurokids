const db = require('../models');
const ProgresoActividades = db.progreso_actividades_model;
const Actividades = db.actividades_model;
const Estudiantes = db.estudiantes_model;

/**
 * Guardar o actualizar progreso de una actividad
 * POST /api/progreso
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
            ultima_interaccion
        } = req.body;

        // Validar datos requeridos
        if (!estudiante_id || !actividad_id) {
            return res.status(400).json({
                success: false,
                message: 'Estudiante ID y Actividad ID son requeridos'
            });
        }

        // Verificar que el estudiante existe
        const estudiante = await Estudiantes.findByPk(estudiante_id);
        if (!estudiante) {
            return res.status(404).json({
                success: false,
                message: 'Estudiante no encontrado'
            });
        }

        // Verificar que la actividad existe
        const actividad = await Actividades.findByPk(actividad_id);
        if (!actividad) {
            return res.status(404).json({
                success: false,
                message: 'Actividad no encontrada'
            });
        }

        // Buscar si ya existe progreso para esta actividad
        let progreso = await ProgresoActividades.findOne({
            where: {
                estudiante_id,
                actividad_id
            }
        });

        const ahora = new Date();

        if (progreso) {
            // Actualizar progreso existente
            const datosActualizacion = {
                puntuacion: puntuacion !== undefined ? puntuacion : progreso.puntuacion,
                puntuacion_maxima: puntuacion_maxima || actividad.puntuacion_maxima || progreso.puntuacion_maxima,
                completado: completado !== undefined ? completado : progreso.completado,
                completado_at: completado ? ahora : (progreso.completado ? progreso.completado_at : null),
                intentos: intentos !== undefined ? (progreso.intentos || 0) + intentos : progreso.intentos,
                tiempo_total: tiempo_total !== undefined ? (progreso.tiempo_total || 0) + tiempo_total : progreso.tiempo_total,
                ultima_interaccion: ultima_interaccion ? new Date(ultima_interaccion) : ahora,
                updated_at: ahora
            };

            await progreso.update(datosActualizacion);

            return res.status(200).json({
                success: true,
                message: 'Progreso actualizado exitosamente',
                data: progreso
            });
        } else {
            // Función para generar ID manual
            const generateManualId = () => Math.floor(Date.now() + Math.random() * 1000);
            
            // Crear nuevo registro de progreso
            progreso = await ProgresoActividades.create({
                id: generateManualId(),
                estudiante_id,
                actividad_id,
                puntuacion: puntuacion || 0,
                puntuacion_maxima: puntuacion_maxima || actividad.puntuacion_maxima || 100,
                completado: completado || false,
                completado_at: completado ? ahora : null,
                intentos: intentos || 1,
                tiempo_total: tiempo_total || 0,
                ultima_interaccion: ultima_interaccion ? new Date(ultima_interaccion) : ahora,
                created_at: ahora,
                updated_at: ahora
            });

            return res.status(201).json({
                success: true,
                message: 'Progreso registrado exitosamente',
                data: progreso
            });
        }
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

        // Verificar que el estudiante existe
        const estudiante = await Estudiantes.findByPk(estudiante_id);
        if (!estudiante) {
            return res.status(404).json({
                success: false,
                message: 'Estudiante no encontrado'
            });
        }

        // Obtener progreso del estudiante
        const progreso = await ProgresoActividades.findAll({
            where: { estudiante_id },
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

        const progreso = await ProgresoActividades.findOne({
            where: {
                actividad_id,
                estudiante_id
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

        // Verificar que el estudiante existe
        const estudiante = await Estudiantes.findByPk(estudiante_id);
        if (!estudiante) {
            return res.status(404).json({
                success: false,
                message: 'Estudiante no encontrado'
            });
        }

        // Obtener progreso del estudiante
        const progreso = await ProgresoActividades.findAll({
            where: { estudiante_id },
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
            estudiante_id,
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

        const actividades = await ProgresoActividades.findAll({
            where: {
                estudiante_id,
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