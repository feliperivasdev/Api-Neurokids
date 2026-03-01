const jwt = require('jsonwebtoken');
const db = require('../models');
const Estudiante = db.estudiantes_model;
const Institucion = db.instituciones_model;
const Rol = db.roles_model;
// Modelos adicionales para logros e insignias
const LogrosEstudiante = db.logros_estudiante_model;
const InsigniasEstudiante = db.insignias_estudiante_model;
const NotificacionesEstudiante = db.notificaciones_estudiante_model;

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
            const institucion = await Institucion.findByPk(institucion_id);
            if (!institucion) {
                throw new Error('Institución no encontrada');
            }

            const estudiante = await Estudiante.findOne({
                where: {
                    nombre: nombre.trim(),
                    apellido: apellido.trim(),
                    institucion_id: institucion_id
                }
            });

            if (!estudiante) {
                throw new Error('No existe un estudiante registrado con ese nombre en la institución seleccionada. Por favor regístrate primero.');
            }

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
                expires_in: 604800
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

        const existe = await Estudiante.findOne({ where: { codigo_estudiante: codigo } });
        if (existe) {
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

            if (!rolEstudiante) {
                rolEstudiante = await Rol.create({
                    nombre: 'estudiante',
                    descripcion: 'Rol para estudiantes del sistema'
                });
            }

            return rolEstudiante.id;
        } catch (error) {
            console.warn('No se pudo asignar rol, continuando sin rol:', error.message);
            return null;
        }
    }

    // Registrar nuevo estudiante
    async registrarEstudiante(datosEstudiante) {
        try {
            const { nombre, apellido, edad, institucion_id, num_documento, correo, con_padres } = datosEstudiante;

            // Validar que la institución existe
            const institucion = await Institucion.findByPk(institucion_id);
            if (!institucion) {
                throw new Error('Institución no encontrada');
            }

            // Validaciones según si está con padres o no
            if (con_padres) {
                if (!nombre?.trim() || !apellido?.trim() || !edad || !num_documento?.trim() || !correo?.trim()) {
                    throw new Error('Cuando está con padres, todos los campos son obligatorios');
                }
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(correo.trim())) {
                    throw new Error('El correo electrónico no tiene un formato válido');
                }
            } else {
                if (!nombre?.trim() || !apellido?.trim() || !edad) {
                    throw new Error('Nombre, apellido y edad son obligatorios');
                }
            }

            // VERIFICAR SI EL ESTUDIANTE YA EXISTE
            const estudianteExistente = await Estudiante.findOne({
                where: {
                    nombre: nombre.trim(),
                    apellido: apellido.trim(),
                    institucion_id: institucion_id
                }
            });

            if (estudianteExistente) {
                throw new Error('Ya existe un estudiante registrado con ese nombre y apellido en la institución seleccionada');
            }

            // Validar correo único si se proporciona
            if (correo && correo.trim()) {
                const correoExistente = await Estudiante.findOne({
                    where: {
                        correo: correo.trim().toLowerCase()
                    }
                });

                if (correoExistente) {
                    throw new Error('Ya existe un estudiante registrado con ese correo electrónico');
                }
            }

            // Validar documento único si se proporciona
            if (num_documento && num_documento.trim()) {
                const documentoExistente = await Estudiante.findOne({
                    where: {
                        num_documento: num_documento.trim()
                    }
                });

                if (documentoExistente) {
                    throw new Error('Ya existe un estudiante registrado con ese número de documento');
                }
            }

            // Generar código único y obtener rol
            const codigo_estudiante = await this.generarCodigoEstudiante();
            const rol_id = await this.obtenerRolEstudiante();

            // Usar una transacción para asegurar consistencia
            const transaction = await db.sequelize.transaction();

            try {
                // Función para generar ID manual por falta de autoIncrement en modelos secundarios
                const generateManualId = () => Math.floor(Date.now() + Math.random() * 1000);

                // Crear el estudiante
                const nuevoEstudiante = await Estudiante.create({
                    nombre: nombre.trim(),
                    apellido: apellido.trim(),
                    edad,
                    institucion_id,
                    num_documento: num_documento ? num_documento.trim() : null,
                    correo: correo ? correo.trim().toLowerCase() : null,
                    codigo_estudiante,
                    rol_id,
                    con_padres: !!con_padres,
                    estado: 'true'
                }, { transaction });

                // --- Lógica de Logros, Insignias y Notificaciones ---

                // Crear registro de logros
                await LogrosEstudiante.create({
                    id: nuevoEstudiante.id,
                    estudiante_id: nuevoEstudiante.id,
                    puntos_totales: 10,
                    insignias_totales: 1
                }, { transaction });

                // Asignar insignia de bienvenida (ID 14)
                await InsigniasEstudiante.create({
                    id: generateManualId(),
                    estudiante_id: nuevoEstudiante.id,
                    insignia_id: 14,
                    progreso_actual: 1,
                    progreso_requerido: 1,
                    completado: true,
                    notificado: false,
                    obtenido_at: new Date()
                }, { transaction });

                // Crear notificación de insignia obtenida
                await NotificacionesEstudiante.create({
                    id: generateManualId(),
                    estudiante_id: nuevoEstudiante.id,
                    tipo_notificacion: 'insignia',
                    titulo: '¡Felicidades! Has obtenido tu primera insignia',
                    mensaje: 'Bienvenido a Neurokids. Has obtenido la insignia de nuevo usuario.',
                    icono: 'trophy',
                    leida: false,
                    insignia_relacionada_id: 14,
                    prioridad: 'alta',
                    created_at: new Date()
                }, { transaction });

                // Confirmar la transacción
                await transaction.commit();

                // Generar token
                const token = this.generateToken(nuevoEstudiante.id);

                return {
                    estudiante: {
                        id: nuevoEstudiante.id,
                        nombre: nuevoEstudiante.nombre,
                        apellido: nuevoEstudiante.apellido,
                        codigo_estudiante: nuevoEstudiante.codigo_estudiante,
                        num_documento: nuevoEstudiante.num_documento,
                        correo: nuevoEstudiante.correo,
                        institucion_id: nuevoEstudiante.institucion_id,
                        institucion: institucion.nombre,
                        estado: nuevoEstudiante.estado
                    },
                    token,
                    token_type: 'Bearer',
                    expires_in: 604800
                };

            } catch (transactionError) {
                // Revertir la transacción en caso de error
                await transaction.rollback();
                throw transactionError;
            }

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

    // Logout
    async logout() {
        return { message: 'Sesión cerrada exitosamente' };
    }
}

module.exports = new AuthService();