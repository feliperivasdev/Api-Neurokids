const jwt = require('jsonwebtoken');
const db = require('../models');
const Usuario = db.usuarios_model;
const Rol = db.roles_model;

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

            // Buscar el usuario en la base de datos con su rol (por nombre, por si los IDs difieren)
            const usuario = await Usuario.findByPk(usuarioId, {
                attributes: ['id', 'rol_id', 'estado', 'institucion_id'],
                include: [{ model: Rol, as: 'rol', attributes: ['id', 'nombre'] }]
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

            // Verificar por rol_id o por nombre de rol
            const rolNombre = (usuario.rol?.nombre || '').toLowerCase();
            const permitido = rolesPermitidos.some(r =>
                typeof r === 'number' ? usuario.rol_id === r : rolNombre === String(r).toLowerCase()
            );
            if (!permitido) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para acceder a este recurso'
                });
            }

            // Agregar información del rol e institución al request
            req.usuario.rol_id = usuario.rol_id;
            req.usuario.institucion_id = usuario.institucion_id;
            req.usuario.rol_nombre = (usuario.rol?.nombre || '').toLowerCase();
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
exports.verificarAdministrador = exports.verificarRol([1, 'administrador']);

// Middleware específico para docentes
exports.verificarDocente = exports.verificarRol([2, 'docente']);

// Middleware específico para estudiantes
exports.verificarEstudiante = exports.verificarRol([3]);

// Middleware para administradores y docentes (IDs 1,2 o nombres)
exports.verificarAdminODocente = exports.verificarRol([1, 2, 'administrador', 'docente']);