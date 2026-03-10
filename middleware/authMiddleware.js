const jwt = require('jsonwebtoken');
const db = require('../models');
const Usuario = db.usuarios_model;

exports.verificarToken = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token no proporcionado'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_secreto_jwt');
        req.usuario = decoded;
        next();
    } catch (error) {
        console.error('Error al verificar token:', error);
        return res.status(401).json({
            success: false,
            message: 'Token inválido o expirado',
            error: error.message
        });
    }
};

// Middleware para verificar roles específicos
exports.verificarRol = (rolesPermitidos) => {
    return async (req, res, next) => {
        try {
            const usuarioId = req.usuario?.id;

            if (!usuarioId) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
            }

            // Buscar el usuario en la base de datos para obtener su rol
            const usuario = await Usuario.findByPk(usuarioId, {
                attributes: ['id', 'rol_id', 'estado']
            });

            if (!usuario) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            if (!usuario.estado) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario desactivado'
                });
            }

            // Verificar si el rol del usuario está en los roles permitidos
            if (!rolesPermitidos.includes(usuario.rol_id)) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para acceder a este recurso'
                });
            }

            // Agregar información del rol al request
            req.usuario.rol_id = usuario.rol_id;
            next();

        } catch (error) {
            console.error('Error al verificar rol:', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    };
};

// Middleware específico para administradores
exports.verificarAdministrador = exports.verificarRol([1]);

// Middleware específico para docentes
exports.verificarDocente = exports.verificarRol([2]);

// Middleware específico para estudiantes
exports.verificarEstudiante = exports.verificarRol([3]);

// Middleware para administradores y docentes
exports.verificarAdminODocente = exports.verificarRol([1, 2]);