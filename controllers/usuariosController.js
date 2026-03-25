const db = require('../models');
const Usuario = db.usuarios_model;
const Institucion = db.instituciones_model;
const Rol = db.roles_model;
const bcrypt = require('bcrypt');

async function getRolIdByNombre(nombreRol) {
    // Primero intentar coincidencia exacta por nombre
    let rol = await Rol.findOne({
        where: { nombre: nombreRol },
        attributes: ['id', 'nombre']
    });

    if (rol) return rol.id;

    // Fallback: comparar en memoria ignorando mayúsculas/minúsculas
    const todos = await Rol.findAll({ attributes: ['id', 'nombre'] });
    const match = todos.find(r => r.nombre?.toLowerCase() === nombreRol.trim().toLowerCase());
    return match?.id || null;
}

// Obtener todos los usuarios (con paginación)
exports.obtenerUsuarios = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const rol_id = req.query.rol_id;

        let whereClause = {};
        if (rol_id) {
            whereClause.rol_id = rol_id;
        }

        const { count, rows: usuarios } = await Usuario.findAndCountAll({
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
            attributes: ['id', 'nombre', 'correo', 'rol_id', 'institucion_id', 'estado', 'created_at', 'email_verified_at'],
            limit,
            offset,
            order: [['created_at', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            data: {
                usuarios,
                pagination: {
                    current_page: page,
                    per_page: limit,
                    total: count,
                    total_pages: Math.ceil(count / limit)
                }
            },
            message: 'Usuarios obtenidos exitosamente'
        });
    } catch (error) {
        console.error('Error en obtenerUsuarios:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Obtener usuario por ID
exports.obtenerUsuarioPorId = async (req, res, next) => {
    try {
        const { id } = req.params;

        const usuario = await Usuario.findByPk(id, {
            include: [
                {
                    model: Institucion,
                    as: 'institucion',
                    attributes: ['nombre', 'direccion', 'telefono']
                },
                {
                    model: Rol,
                    as: 'rol',
                    attributes: ['nombre', 'descripcion']
                }
            ],
            attributes: ['id', 'nombre', 'correo', 'rol_id', 'institucion_id', 'estado', 'created_at', 'updated_at', 'email_verified_at']
        });

        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        return res.status(200).json({
            success: true,
            data: usuario,
            message: 'Usuario obtenido exitosamente'
        });
    } catch (error) {
        console.error('Error en obtenerUsuarioPorId:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Crear nuevo usuario (administrativo)
exports.crearUsuario = async (req, res, next) => {
    try {
        const { nombre, correo, contrasena, rol_id, institucion_id } = req.body;

        // Validar datos requeridos
        if (!nombre || !correo || !contrasena || !rol_id) {
            return res.status(400).json({
                success: false,
                message: 'Nombre, correo, contraseña y rol son requeridos'
            });
        }

        // Validar formato del correo
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(correo.trim())) {
            return res.status(400).json({
                success: false,
                message: 'El correo electrónico no tiene un formato válido'
            });
        }

        // Verificar que no exista un usuario con el mismo correo
        const usuarioExistente = await Usuario.findOne({
            where: { correo: correo.trim().toLowerCase() }
        });

        if (usuarioExistente) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe un usuario registrado con ese correo electrónico'
            });
        }

        // Verificar que el rol existe
        const rol = await Rol.findByPk(rol_id);
        if (!rol) {
            return res.status(400).json({
                success: false,
                message: 'Rol no encontrado'
            });
        }

        // Verificar institución si se proporciona
        if (institucion_id) {
            const institucion = await Institucion.findByPk(institucion_id);
            if (!institucion) {
                return res.status(400).json({
                    success: false,
                    message: 'Institución no encontrada'
                });
            }
        }

        // Encriptar contraseña
        const saltRounds = 10;
        const contrasenaHash = await bcrypt.hash(contrasena, saltRounds);

        const nuevoUsuario = await Usuario.create({
            nombre: nombre.trim(),
            correo: correo.trim().toLowerCase(),
            contrasena: contrasenaHash,
            rol_id,
            institucion_id: institucion_id || null,
            estado: true,
            email_verified_at: new Date()
        });

        // Obtener el usuario creado con sus relaciones
        const usuarioCreado = await Usuario.findByPk(nuevoUsuario.id, {
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
            attributes: ['id', 'nombre', 'correo', 'rol_id', 'institucion_id', 'estado', 'created_at', 'email_verified_at']
        });

        return res.status(201).json({
            success: true,
            data: usuarioCreado,
            message: 'Usuario creado exitosamente'
        });
    } catch (error) {
        console.error('Error en crearUsuario:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Actualizar usuario
exports.actualizarUsuario = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { nombre, correo, rol_id, institucion_id, estado } = req.body;

        const usuario = await Usuario.findByPk(id);
        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        const datosActualizacion = {};

        // Actualizar nombre
        if (nombre) {
            datosActualizacion.nombre = nombre.trim();
        }

        // Actualizar correo
        if (correo) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(correo.trim())) {
                return res.status(400).json({
                    success: false,
                    message: 'El correo electrónico no tiene un formato válido'
                });
            }

            // Verificar que el correo no esté en uso por otro usuario
            const correoExistente = await Usuario.findOne({
                where: {
                    correo: correo.trim().toLowerCase(),
                    id: { [db.Sequelize.Op.ne]: id }
                }
            });

            if (correoExistente) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe otro usuario con ese correo electrónico'
                });
            }

            datosActualizacion.correo = correo.trim().toLowerCase();
        }

        // Actualizar rol
        if (rol_id) {
            const rol = await Rol.findByPk(rol_id);
            if (!rol) {
                return res.status(400).json({
                    success: false,
                    message: 'Rol no encontrado'
                });
            }
            datosActualizacion.rol_id = rol_id;
        }

        // Actualizar institución
        if (institucion_id !== undefined) {
            if (institucion_id) {
                const institucion = await Institucion.findByPk(institucion_id);
                if (!institucion) {
                    return res.status(400).json({
                        success: false,
                        message: 'Institución no encontrada'
                    });
                }
            }
            datosActualizacion.institucion_id = institucion_id;
        }

        // Actualizar estado
        if (estado !== undefined) {
            datosActualizacion.estado = estado;
        }

        await usuario.update(datosActualizacion);

        // Obtener el usuario actualizado con sus relaciones
        const usuarioActualizado = await Usuario.findByPk(id, {
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
            attributes: ['id', 'nombre', 'correo', 'rol_id', 'institucion_id', 'estado', 'created_at', 'updated_at', 'email_verified_at']
        });

        return res.status(200).json({
            success: true,
            data: usuarioActualizado,
            message: 'Usuario actualizado exitosamente'
        });
    } catch (error) {
        console.error('Error en actualizarUsuario:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Cambiar contraseña de usuario (requiere contraseña actual)
exports.cambiarContrasena = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { contrasena_actual, contrasena_nueva } = req.body;

        if (!contrasena_actual || !contrasena_nueva) {
            return res.status(400).json({
                success: false,
                message: 'Contraseña actual y nueva contraseña son requeridas'
            });
        }

        if (contrasena_nueva.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'La nueva contraseña debe tener al menos 6 caracteres'
            });
        }

        const usuario = await Usuario.findByPk(id);
        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Verificar contraseña actual
        const contrasenaValida = await bcrypt.compare(contrasena_actual, usuario.contrasena);
        if (!contrasenaValida) {
            return res.status(400).json({
                success: false,
                message: 'La contraseña actual es incorrecta'
            });
        }

        // Encriptar nueva contraseña
        const saltRounds = 10;
        const nuevaContrasenaHash = await bcrypt.hash(contrasena_nueva, saltRounds);

        await usuario.update({ contrasena: nuevaContrasenaHash });

        return res.status(200).json({
            success: true,
            message: 'Contraseña actualizada exitosamente'
        });
    } catch (error) {
        console.error('Error en cambiarContrasena:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Eliminar usuario (cambiar estado a false)
exports.eliminarUsuario = async (req, res, next) => {
    try {
        const { id } = req.params;

        const usuario = await Usuario.findByPk(id);
        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        await usuario.update({ estado: false });

        return res.status(200).json({
            success: true,
            message: 'Usuario eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error en eliminarUsuario:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Obtener solo docentes
exports.obtenerDocentes = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const institucion_id = req.query.institucion_id;

        // Resolver el rol "docente" desde DB para no depender de IDs fijos
        const docenteRolId = await getRolIdByNombre('docente');
        if (!docenteRolId) {
            return res.status(500).json({
                success: false,
                message: 'Rol Docente no encontrado en la base de datos'
            });
        }

        let whereClause = { rol_id: docenteRolId };
        if (institucion_id) {
            whereClause.institucion_id = institucion_id;
        }

        const { count, rows: docentes } = await Usuario.findAndCountAll({
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
            attributes: ['id', 'nombre', 'correo', 'rol_id', 'institucion_id', 'estado', 'created_at', 'email_verified_at'],
            limit,
            offset,
            order: [['created_at', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            data: {
                docentes,
                pagination: {
                    current_page: page,
                    per_page: limit,
                    total: count,
                    total_pages: Math.ceil(count / limit)
                }
            },
            message: 'Docentes obtenidos exitosamente'
        });
    } catch (error) {
        console.error('Error en obtenerDocentes:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Crear docente (administrativo) sin depender de rol_id fijo
exports.crearDocente = async (req, res, next) => {
    try {
        const { nombre, correo, contrasena, institucion_id } = req.body;

        if (!nombre || !correo || !contrasena || !institucion_id) {
            return res.status(400).json({
                success: false,
                message: 'Nombre, correo, contraseña e institución son requeridos'
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(correo.trim())) {
            return res.status(400).json({
                success: false,
                message: 'El correo electrónico no tiene un formato válido'
            });
        }

        const usuarioExistente = await Usuario.findOne({
            where: { correo: correo.trim().toLowerCase() }
        });
        if (usuarioExistente) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe un usuario registrado con ese correo electrónico'
            });
        }

        const institucion = await Institucion.findByPk(institucion_id);
        if (!institucion) {
            return res.status(400).json({
                success: false,
                message: 'Institución no encontrada'
            });
        }

        const docenteRolId = await getRolIdByNombre('docente');
        if (!docenteRolId) {
            return res.status(500).json({
                success: false,
                message: 'Rol Docente no encontrado en la base de datos'
            });
        }

        const saltRounds = 10;
        const contrasenaHash = await bcrypt.hash(contrasena, saltRounds);

        const nuevoDocente = await Usuario.create({
            nombre: nombre.trim(),
            correo: correo.trim().toLowerCase(),
            contrasena: contrasenaHash,
            rol_id: docenteRolId,
            institucion_id,
            estado: true,
            email_verified_at: new Date()
        });

        const docenteCreado = await Usuario.findByPk(nuevoDocente.id, {
            include: [
                { model: Institucion, as: 'institucion', attributes: ['nombre'] },
                { model: Rol, as: 'rol', attributes: ['nombre', 'descripcion'] }
            ],
            attributes: ['id', 'nombre', 'correo', 'rol_id', 'institucion_id', 'estado', 'created_at', 'email_verified_at']
        });

        return res.status(201).json({
            success: true,
            data: docenteCreado,
            message: 'Docente creado exitosamente'
        });
    } catch (error) {
        console.error('Error en crearDocente:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Obtener solo administradores
exports.obtenerAdministradores = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const institucion_id = req.query.institucion_id;

        let whereClause = { rol_id: 1 }; // Solo administradores
        if (institucion_id) {
            whereClause.institucion_id = institucion_id;
        }

        const { count, rows: administradores } = await Usuario.findAndCountAll({
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
            attributes: ['id', 'nombre', 'correo', 'rol_id', 'institucion_id', 'estado', 'created_at', 'email_verified_at'],
            limit,
            offset,
            order: [['created_at', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            data: {
                administradores,
                pagination: {
                    current_page: page,
                    per_page: limit,
                    total: count,
                    total_pages: Math.ceil(count / limit)
                }
            },
            message: 'Administradores obtenidos exitosamente'
        });
    } catch (error) {
        console.error('Error en obtenerAdministradores:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};