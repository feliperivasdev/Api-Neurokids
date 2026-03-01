const jwt = require('jsonwebtoken');
const { Estudiante, Institucion } = require('../models');

class AuthService {
    // Generar JWT
    generateToken(estudianteId) {
        return jwt.sign(
            { id: estudianteId },
            process.env.JWT_SECRET || 'tu_secreto_jwt',
            { expiresIn: '7d' }
        );
    }

    // Verificar JWT
    verifyToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET || 'tu_secreto_jwt');
        } catch (error) {
            throw new Error('Token inválido o expirado');
        }
    }

    // Obtener todas las instituciones activas
    async getInstituciones() {
        try {
            const instituciones = await Institucion.findAll({
                where: { estado: 'activa' },
                attributes: ['id', 'nombre', 'ciudad'],
                order: [['nombre', 'ASC']]
            });

            return instituciones;
        } catch (error) {
            throw new Error(`Error al obtener instituciones: ${error.message}`);
        }
    }

    // Iniciar sesión (crear o buscar estudiante)
    async loginEstudiante(nombre, institucion_id) {
        try {
            // Validar que la institución existe
            const institucion = await Institucion.findByPk(institucion_id);
            if (!institucion) {
                throw new Error('Institución no encontrada');
            }

            // Buscar o crear al estudiante
            let estudiante = await Estudiante.findOne({
                where: {
                    nombre: nombre.trim(),
                    institucion_id: institucion_id
                }
            });

            // Si el estudiante no existe, lo creamos
            if (!estudiante) {
                estudiante = await Estudiante.create({
                    nombre: nombre.trim(),
                    institucion_id,
                    email: null,
                    fecha_registro: new Date()
                });
            }

            // Generar token
            const token = this.generateToken(estudiante.id);

            return {
                id: estudiante.id,
                nombre: estudiante.nombre,
                institucion_id: estudiante.institucion_id,
                institucion: institucion.nombre,
                token
            };
        } catch (error) {
            throw new Error(`Error en login: ${error.message}`);
        }
    }

    // Obtener datos del usuario actual
    async getMeEstudiante(estudianteId) {
        try {
            const estudiante = await Estudiante.findByPk(estudianteId, {
                include: [
                    {
                        model: Institucion,
                        attributes: ['nombre', 'ciudad']
                    }
                ]
            });

            if (!estudiante) {
                throw new Error('Estudiante no encontrado');
            }

            return estudiante;
        } catch (error) {
            throw new Error(`Error al obtener datos: ${error.message}`);
        }
    }

    // Logout (solo validación)
    async logout() {
        // En JWT, el logout se maneja en el cliente eliminando el token
        // Este método puede usarse para logs o invalidar tokens en blacklist si es necesario
        return { message: 'Sesión cerrada exitosamente' };
    }
}

module.exports = new AuthService();