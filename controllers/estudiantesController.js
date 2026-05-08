const db = require('../models');
const Estudiantes = db.estudiantes_model;
const LogrosEstudiante = db.logros_estudiante_model;
const Institucion = db.instituciones_model;
const Rol = db.roles_model;

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

// Listar estudiantes con paginación y filtros básicos
// Si el usuario es docente, solo ve estudiantes de su institución; administradores ven todos
exports.listarEstudiantes = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const { institucion_id: queryInstitucionId, edad, search } = req.query;

        const whereClause = {};

        // Docente: restringir siempre a su institución; Admin: puede filtrar por query o ver todos
        const esAdministrador = req.usuario.rol_id === 1 || req.usuario.rol_nombre === 'administrador';
        if (esAdministrador) {
            if (queryInstitucionId) {
                whereClause.institucion_id = queryInstitucionId;
            }
        } else {
            // Docente: solo estudiantes de su institución
            const institucionDocente = req.usuario.institucion_id;
            if (institucionDocente != null && institucionDocente !== undefined) {
                whereClause.institucion_id = institucionDocente;
            } else {
                // Docente sin institución asignada: devolver lista vacía
                return res.status(200).json({
                    success: true,
                    data: {
                        estudiantes: [],
                        pagination: { current_page: 1, per_page: limit, total: 0, total_pages: 0 }
                    },
                    message: 'Estudiantes obtenidos exitosamente'
                });
            }
        }

        if (edad) {
            whereClause.edad = edad;
        }

        if (search && typeof search === 'string' && search.trim()) {
            whereClause.nombre = db.Sequelize.where(
                db.Sequelize.fn('LOWER', db.Sequelize.col('nombre')),
                'LIKE',
                `%${search.trim().toLowerCase()}%`
            );
        }

        const { count, rows: estudiantes } = await Estudiantes.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Institucion,
                    as: 'institucion',
                    attributes: ['nombre']
                },
                {
                    model: Rol,
                    as: 'rol',
                    attributes: ['nombre', 'descripcion']
                }
            ],
            attributes: ['id', 'nombre', 'apellido', 'correo', 'edad', 'institucion_id', 'rol_id', 'estado', 'created_at'],
            limit,
            offset,
            order: [['created_at', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            data: {
                estudiantes,
                pagination: {
                    current_page: page,
                    per_page: limit,
                    total: count,
                    total_pages: Math.ceil(count / limit)
                }
            },
            message: 'Estudiantes obtenidos exitosamente'
        });
    } catch (error) {
        console.error('Error en listarEstudiantes:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Crear estudiante (admin o docente)
exports.crearEstudiante = async (req, res) => {
    try {
        const { nombre, apellido, correo, edad, institucion_id } = req.body;

        if (!nombre || !apellido) {
            return res.status(400).json({
                success: false,
                message: 'Nombre y apellido son requeridos'
            });
        }

        const esAdministrador = req.usuario.rol_id === 1 || req.usuario.rol_nombre === 'administrador';
        const targetInstitucionId = esAdministrador ? institucion_id : req.usuario.institucion_id;

        if (!targetInstitucionId) {
            return res.status(400).json({
                success: false,
                message: 'Institución es requerida para crear el estudiante'
            });
        }

        const institucion = await Institucion.findByPk(targetInstitucionId);
        if (!institucion) {
            return res.status(400).json({
                success: false,
                message: 'Institución no encontrada'
            });
        }

        const estudianteExistente = await Estudiantes.findOne({
            where: {
                nombre: nombre.trim(),
                apellido: apellido.trim(),
                institucion_id: targetInstitucionId
            }
        });

        if (estudianteExistente) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe un estudiante con ese nombre y apellido en la misma institución'
            });
        }

        if (correo) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(correo.trim())) {
                return res.status(400).json({
                    success: false,
                    message: 'El correo electrónico no tiene un formato válido'
                });
            }

            const correoExistente = await Estudiantes.findOne({
                where: { correo: correo.trim().toLowerCase() }
            });

            if (correoExistente) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe un estudiante con ese correo electrónico'
                });
            }
        }

        const nuevoEstudiante = await Estudiantes.create({
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            correo: correo ? correo.trim().toLowerCase() : null,
            edad: edad !== undefined ? edad : null,
            institucion_id: targetInstitucionId,
            estado: true,
            rol_id: 3
        });

        return res.status(201).json({
            success: true,
            data: nuevoEstudiante,
            message: 'Estudiante creado exitosamente'
        });
    } catch (error) {
        console.error('Error en crearEstudiante:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Actualizar estudiante
exports.actualizarEstudiante = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, apellido, correo, edad, institucion_id } = req.body;

        const estudiante = await Estudiantes.findByPk(id);
        if (!estudiante) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Verificar permisos: admin puede editar cualquier estudiante, docente solo de su institución
        const esAdministrador = req.usuario.rol_id === 1 || req.usuario.rol_nombre === 'administrador';
        if (!esAdministrador) {
            const institucionDocente = req.usuario.institucion_id;
            if (estudiante.institucion_id !== institucionDocente) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para editar este estudiante'
                });
            }
        }

        const datosActualizacion = {};

        if (nombre !== undefined) {
            datosActualizacion.nombre = nombre.trim();
        }

        if (apellido !== undefined) {
            datosActualizacion.apellido = apellido.trim();
        }

        if (correo !== undefined) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(correo.trim())) {
                return res.status(400).json({
                    success: false,
                    message: 'El correo electrónico no tiene un formato válido'
                });
            }
            datosActualizacion.correo = correo.trim().toLowerCase();
        }

        if (edad !== undefined) {
            datosActualizacion.edad = edad;
        }

        if (institucion_id !== undefined) {
            // Solo admin puede cambiar institución
            if (!esAdministrador) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para cambiar la institución del estudiante'
                });
            }
            const institucion = await Institucion.findByPk(institucion_id);
            if (!institucion) {
                return res.status(400).json({
                    success: false,
                    message: 'Institución no encontrada'
                });
            }
            datosActualizacion.institucion_id = institucion_id;
        }

        await estudiante.update(datosActualizacion);

        return res.status(200).json({
            success: true,
            data: estudiante,
            message: 'Estudiante actualizado exitosamente'
        });
    } catch (error) {
        console.error('Error en actualizarEstudiante:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Eliminar estudiante
exports.eliminarEstudiante = async (req, res) => {
    try {
        const { id } = req.params;

        const estudiante = await Estudiantes.findByPk(id);
        if (!estudiante) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Verificar permisos: admin puede eliminar cualquier estudiante, docente solo de su institución
        const esAdministrador = req.usuario.rol_id === 1 || req.usuario.rol_nombre === 'administrador';
        if (!esAdministrador) {
            const institucionDocente = req.usuario.institucion_id;
            if (estudiante.institucion_id !== institucionDocente) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para eliminar este estudiante'
                });
            }
        }

        await estudiante.destroy();

        return res.status(200).json({
            success: true,
            message: 'Estudiante eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error en eliminarEstudiante:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};