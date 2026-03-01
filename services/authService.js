const jwt = require('jsonwebtoken');
const db = require('../models');
const Estudiante = db.estudiantes_model;
const Institucion = db.instituciones_model;
const Rol = db.roles_model;

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
                where: { estado: 'true' },
                attributes: ['id', 'nombre',],
                order: [['nombre', 'ASC']]
            });

            return instituciones;
        } catch (error) {
            throw new Error(`Error al obtener instituciones: ${error.message}`);
        }
    }

    // Iniciar sesión (solo para estudiantes ya registrados)
    async loginEstudiante(nombre, apellido, institucion_id) {
        try {
            // Validar que la institución existe
            const institucion = await Institucion.findByPk(institucion_id);
            if (!institucion) {
                throw new Error('Institución no encontrada');
            }

            // Buscar estudiante existente
            const estudiante = await Estudiante.findOne({
                where: {
                    nombre: nombre.trim(),
                    apellido: apellido.trim(),
                    institucion_id: institucion_id
                }
            });

            // Si el estudiante no existe, retornar error
            if (!estudiante) {
                throw new Error('No existe un estudiante registrado con ese nombre en la institución seleccionada. Por favor regístrate primero.');
            }
           
            // Generar token
            const token = this.generateToken(estudiante.id);

            return {
                estudiante: {
                    id: estudiante.id,
                    nombre: estudiante.nombre,
                    apellido: estudiante.apellido,
                    codigo_estudiante: estudiante.codigo_estudiante,
                    institucion_id: estudiante.institucion_id,
                    institucion: institucion.nombre,
                    estado: estudiante.estado || true
                },
                token,
                token_type: 'Bearer',
                expires_in: 604800 // 7 días en segundos
            };
        } catch (error) {
            throw new Error(`Error en login: ${error.message}`);
        }
    }

    // Generar código de estudiante único
    async generarCodigoEstudiante() {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const codigo = `EST${timestamp}${random}`;

        // Verificar que no exista ya
        const existe = await Estudiante.findOne({ where: { codigo_estudiante: codigo } });
        if (existe) {
            // Si existe, generar otro recursivamente
            return await this.generarCodigoEstudiante();
        }

        return codigo;
    }

    // Obtener o crear rol de estudiante
    async obtenerRolEstudiante() {
        try {
            let rolEstudiante = await Rol.findOne({
                where: { nombre: 'estudiante' }
            });

            // Si no existe el rol estudiante, lo creamos
            if (!rolEstudiante) {
                rolEstudiante = await Rol.create({
                    nombre: 'estudiante',
                    descripcion: 'Rol para estudiantes del sistema'
                });
            }

            return rolEstudiante.id;
        } catch (error) {
            console.warn('No se pudo asignar rol, continuando sin rol:', error.message);
            return null; // Retornar null si no se puede asignar rol
        }
    }

    // Registrar nuevo estudiante
    async registrarEstudiante(datosEstudiante) {
        try {
            const {
                nombre,
                apellido,
                edad,
                institucion_id,
                num_documento,
                correo,
                con_padres
            } = datosEstudiante;

            // Validar que la institución existe
            const institucion = await Institucion.findByPk(institucion_id);
            if (!institucion) {
                throw new Error('Institución no encontrada');
            }

            // Validaciones según si está con padres o no
            if (con_padres) {
                // Si está con padres, todos los campos son obligatorios
                if (!nombre?.trim() || !apellido?.trim() || !edad || !num_documento?.trim() || !correo?.trim()) {
                    throw new Error('Cuando está con padres, todos los campos son obligatorios');
                }

                // Validar formato de correo
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(correo.trim())) {
                    throw new Error('El correo electrónico no tiene un formato válido');
                }

                // Validar rango de edad
                if (edad < 7 || edad > 18) {
                    throw new Error('La edad debe estar entre 7 y 18 años');
                }
            } else {
                // Si está solo, solo nombre, apellido e institución son obligatorios
                if (!nombre?.trim() || !apellido?.trim()) {
                    throw new Error('El nombre y apellido son obligatorios');
                }

                // Si proporcionó edad, validar rango
                if (edad && (edad < 7 || edad > 18)) {
                    throw new Error('Si proporcionas la edad, debe estar entre 7 y 18 años');
                }
            }

            // Verificar si ya existe un estudiante con igual nombre, apellido e institución
            const estudianteExistente = await Estudiante.findOne({
                where: {
                    nombre: nombre.trim(),
                    apellido: apellido.trim(),
                    institucion_id: institucion_id
                }
            });

            if (estudianteExistente) {
                throw new Error('Ya existe un estudiante con este nombre en la institución seleccionada');
            }

            // Si se proporciona número de documento, verificar que no exista
            if (num_documento?.trim()) {
                const estudianteConDocumento = await Estudiante.findOne({
                    where: {
                        num_documento: num_documento.trim()
                    }
                });

                if (estudianteConDocumento) {
                    throw new Error('Ya existe un estudiante registrado con este número de documento');
                }
            }

            // Generar código de estudiante único
            const codigo_estudiante = await this.generarCodigoEstudiante();
            
            // Obtener rol de estudiante
            const rol_id = await this.obtenerRolEstudiante();

            // Crear el estudiante
            const nuevoEstudiante = await Estudiante.create({
                nombre: nombre.trim(),
                apellido: apellido.trim(),
                codigo_estudiante,
                edad: edad || null,
                num_documento: num_documento?.trim() || null,
                correo: correo?.trim() || null,
                institucion_id,
                estado: true,
                rol_id
            });

            // Generar token
            const token = this.generateToken(nuevoEstudiante.id);

            return {
                estudiante: {
                    id: nuevoEstudiante.id,
                    nombre: nuevoEstudiante.nombre,
                    apellido: nuevoEstudiante.apellido,
                    codigo_estudiante: nuevoEstudiante.codigo_estudiante,
                    edad: nuevoEstudiante.edad,
                    num_documento: nuevoEstudiante.num_documento,
                    correo: nuevoEstudiante.correo,
                    institucion_id: nuevoEstudiante.institucion_id,
                    institucion: institucion.nombre,
                    estado: nuevoEstudiante.estado
                },
                token,
                token_type: 'Bearer',
                expires_in: 604800 // 7 días en segundos
            };
        } catch (error) {
            throw new Error(`Error en registro: ${error.message}`);
        }
    }

    // Obtener datos del usuario actual
    async getMeEstudiante(estudianteId) {
        try {
            const estudiante = await Estudiante.findByPk(estudianteId, {
                include: [
                    {
                        model: Institucion,
                        attributes: ['nombre',]
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