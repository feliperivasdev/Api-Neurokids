const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../models');
const Estudiante = db.estudiantes_model;
const Usuario = db.usuarios_model;
const Institucion = db.instituciones_model;
const Rol = db.roles_model;
// Modelos adicionales para logros e insignias
const LogrosEstudiante = db.logros_estudiante_model;
const InsigniasEstudiante = db.insignias_estudiante_model;
const NotificacionesEstudiante = db.notificaciones_estudiante_model;
const AccesosPlataformaEstudiante = db.accesos_plataforma_estudiante_model;
const rachaAccesosService = require('./rachaAccesosService');
const insigniasProgresoService = require('./insigniasProgresoService');

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
    /** @param {{ ip?: string | null, userAgent?: string | null }} [meta] — para historial de accesos */
    async loginEstudiante(nombre, apellido, institucion_id, meta = {}) {
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

            try {
                if (AccesosPlataformaEstudiante) {
                    const ip = meta.ip ? String(meta.ip).trim().substring(0, 45) : null;
                    const ua = meta.userAgent ? String(meta.userAgent).substring(0, 2000) : null;
                    await AccesosPlataformaEstudiante.create({
                        estudiante_id: estudiante.id,
                        fecha_hora: new Date(),
                        ip_address: ip || null,
                        user_agent: ua || null
                    });
                    try {
                        await rachaAccesosService.sincronizarRachaDesdeAccesos(estudiante.id);
                        await insigniasProgresoService.evaluarInsigniasRachaTrasAcceso(estudiante.id);
                    } catch (rachaErr) {
                        console.error('Racha/insignias tras login:', rachaErr.message);
                    }
                }
            } catch (logErr) {
                console.error('Error registrando acceso a plataforma (estudiante):', logErr.message);
            }

            return {
                estudiante: {
                    id: estudiante.id,
                    nombre: estudiante.nombre,
                    apellido: estudiante.apellido,
                    edad: estudiante.edad,
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

    /**
     * Registra una visita al panel (sesión ya autenticada). Antiduplicado por ventana de tiempo
     * para no llenar la tabla en cada refresco. Solo tokens de estudiante (sin `role` en el JWT).
     */
    async registrarVisitaEstudiante(estudianteId, meta = {}) {
        const id = Number(estudianteId);
        if (!Number.isFinite(id)) {
            throw new Error('ID de estudiante inválido');
        }
        const exists = await Estudiante.findByPk(id, { attributes: ['id'] });
        if (!exists) {
            throw new Error('Estudiante no encontrado');
        }
        if (!AccesosPlataformaEstudiante) {
            return { ok: true, skipped: true, reason: 'model_unavailable' };
        }
        const MIN_MS = 25 * 60 * 1000;
        const last = await AccesosPlataformaEstudiante.findOne({
            where: { estudiante_id: id },
            order: [['fecha_hora', 'DESC']],
            attributes: ['fecha_hora'],
            raw: true
        });
        const now = Date.now();
        if (last?.fecha_hora) {
            const t = last.fecha_hora instanceof Date
                ? last.fecha_hora.getTime()
                : new Date(last.fecha_hora).getTime();
            if (Number.isFinite(t) && now - t < MIN_MS) {
                return { ok: true, skipped: true, reason: 'throttle' };
            }
        }
        const ip = meta.ip ? String(meta.ip).trim().substring(0, 45) : null;
        const ua = meta.userAgent ? String(meta.userAgent).substring(0, 2000) : null;
        await AccesosPlataformaEstudiante.create({
            estudiante_id: id,
            fecha_hora: new Date(),
            ip_address: ip || null,
            user_agent: ua || null
        });
        try {
            await rachaAccesosService.sincronizarRachaDesdeAccesos(id);
            await insigniasProgresoService.evaluarInsigniasRachaTrasAcceso(id);
        } catch (rachaErr) {
            console.error('Racha/insignias tras visita:', rachaErr.message);
        }
        return { ok: true, registered: true };
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
                        edad: nuevoEstudiante.edad,
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

    // ========== MÉTODOS PARA DOCENTES ==========

    // Generar JWT para docentes
    generateTokenDocente(docenteId) {
        return jwt.sign(
            { id: docenteId, role: 'docente' },
            process.env.JWT_SECRET || 'tu_secreto_jwt',
            { expiresIn: '7d' }
        );
    }

    // Registrar nuevo docente
    async registrarDocente(datosDocente) {
        try {
            const { nombre, correo, contrasena, institucion_id } = datosDocente;

            // Validar datos requeridos
            if (!nombre?.trim() || !correo?.trim() || !contrasena?.trim() || !institucion_id) {
                throw new Error('Nombre, correo, contraseña e institución son requeridos');
            }

            // Validar formato del correo
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(correo.trim())) {
                throw new Error('El correo electrónico no tiene un formato válido');
            }

            // Validar longitud mínima de contraseña
            if (contrasena.length < 6) {
                throw new Error('La contraseña debe tener al menos 6 caracteres');
            }

            // Verificar que la institución existe
            const institucion = await Institucion.findByPk(institucion_id);
            if (!institucion) {
                throw new Error('Institución no encontrada');
            }

            // Verificar que no exista un usuario con el mismo correo
            const usuarioExistente = await Usuario.findOne({
                where: { correo: correo.trim().toLowerCase() }
            });

            if (usuarioExistente) {
                throw new Error('Ya existe un usuario registrado con ese correo electrónico');
            }

            // Encriptar contraseña
            const saltRounds = 10;
            const contrasenaHash = await bcrypt.hash(contrasena, saltRounds);

            // Crear el docente (usuario con rol_id = 2)
            const nuevoDocente = await Usuario.create({
                nombre: nombre.trim(),
                correo: correo.trim().toLowerCase(),
                contrasena: contrasenaHash,
                rol_id: 2, // Rol de docente
                institucion_id: institucion_id,
                estado: true,
                email_verified_at: new Date() // Marcar como verificado automáticamente
            });

            // Generar token
            const token = this.generateTokenDocente(nuevoDocente.id);

            return {
                docente: {
                    id: nuevoDocente.id,
                    nombre: nuevoDocente.nombre,
                    correo: nuevoDocente.correo,
                    rol_id: nuevoDocente.rol_id,
                    institucion_id: nuevoDocente.institucion_id,
                    institucion: institucion.nombre,
                    estado: nuevoDocente.estado,
                    created_at: nuevoDocente.created_at
                },
                token,
                token_type: 'Bearer',
                expires_in: 604800
            };

        } catch (error) {
            throw new Error(`Error en registro de docente: ${error.message}`);
        }
    }

    // Iniciar sesión para docentes
    async loginDocente(correo, contrasena) {
        try {
            if (!correo?.trim() || !contrasena?.trim()) {
                throw new Error('Correo y contraseña son requeridos');
            }

            // Buscar el docente por correo y rol
            const docente = await Usuario.findOne({
                where: {
                    correo: correo.trim().toLowerCase(),
                    rol_id: 2, // Solo docentes
                    estado: true
                },
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
                ]
            });

            if (!docente) {
                throw new Error('Credenciales inválidas o cuenta no encontrada');
            }

            // Verificar contraseña
            const contrasenaValida = await bcrypt.compare(contrasena, docente.contrasena);
            if (!contrasenaValida) {
                throw new Error('Credenciales inválidas');
            }

            // Generar token
            const token = this.generateTokenDocente(docente.id);

            return {
                usuario: {
                    id: docente.id,
                    nombre: docente.nombre,
                    correo: docente.correo,
                    rol_id: docente.rol_id,
                    rol: docente.rol?.nombre,
                    institucion_id: docente.institucion_id,
                    institucion: docente.institucion?.nombre,
                    estado: docente.estado,
                    email_verified_at: docente.email_verified_at
                },
                token,
                token_type: 'Bearer',
                expires_in: 604800
            };

        } catch (error) {
            throw new Error(`Error en login de docente: ${error.message}`);
        }
    }

    // Obtener datos del docente actual
    async getMeDocente(docenteId) {
        try {
            const docente = await Usuario.findOne({
                where: {
                    id: docenteId,
                    rol_id: 2, // Solo docentes
                    estado: true
                },
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
                attributes: ['id', 'nombre', 'correo', 'rol_id', 'institucion_id', 'estado', 'created_at', 'email_verified_at']
            });

            if (!docente) {
                throw new Error('Docente no encontrado');
            }

            return docente;

        } catch (error) {
            throw new Error(`Error al obtener datos del docente: ${error.message}`);
        }
    }

    // Actualizar perfil de docente
    async actualizarPerfilDocente(docenteId, datosActualizacion) {
        try {
            const { nombre, correo, contrasena_actual, contrasena_nueva } = datosActualizacion;

            // Buscar el docente
            const docente = await Usuario.findOne({
                where: {
                    id: docenteId,
                    rol_id: 2,
                    estado: true
                }
            });

            if (!docente) {
                throw new Error('Docente no encontrado');
            }

            const datosParaActualizar = {};

            // Actualizar nombre si se proporciona
            if (nombre && nombre.trim()) {
                datosParaActualizar.nombre = nombre.trim();
            }

            // Actualizar correo si se proporciona
            if (correo && correo.trim()) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(correo.trim())) {
                    throw new Error('El correo electrónico no tiene un formato válido');
                }

                // Verificar que el correo no esté en uso por otro usuario
                const correoExistente = await Usuario.findOne({
                    where: {
                        correo: correo.trim().toLowerCase(),
                        id: { [db.Sequelize.Op.ne]: docenteId }
                    }
                });

                if (correoExistente) {
                    throw new Error('Ya existe otro usuario con ese correo electrónico');
                }

                datosParaActualizar.correo = correo.trim().toLowerCase();
            }

            // Actualizar contraseña si se proporciona
            if (contrasena_nueva) {
                if (!contrasena_actual) {
                    throw new Error('Se requiere la contraseña actual para cambiar la contraseña');
                }

                // Verificar contraseña actual
                const contrasenaValida = await bcrypt.compare(contrasena_actual, docente.contrasena);
                if (!contrasenaValida) {
                    throw new Error('La contraseña actual es incorrecta');
                }

                if (contrasena_nueva.length < 6) {
                    throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
                }

                const saltRounds = 10;
                datosParaActualizar.contrasena = await bcrypt.hash(contrasena_nueva, saltRounds);
            }

            // Actualizar en la base de datos
            await docente.update(datosParaActualizar);

            // Retornar datos actualizados
            const docenteActualizado = await this.getMeDocente(docenteId);

            return {
                docente: docenteActualizado,
                message: 'Perfil actualizado exitosamente'
            };

        } catch (error) {
            throw new Error(`Error al actualizar perfil: ${error.message}`);
        }
    }

    // ========== MÉTODOS PARA ADMINISTRADORES ==========

    // Generar JWT para administradores
    generateTokenAdmin(adminId) {
        return jwt.sign(
            { id: adminId, role: 'admin' },
            process.env.JWT_SECRET || 'tu_secreto_jwt',
            { expiresIn: '7d' }
        );
    }

    // Registrar nuevo administrador
    async registrarAdministrador(datosAdmin) {
        try {
            const { nombre, correo, contrasena, institucion_id } = datosAdmin;

            // Validar datos requeridos
            if (!nombre?.trim() || !correo?.trim() || !contrasena?.trim()) {
                throw new Error('Nombre, correo y contraseña son requeridos');
            }

            // Validar formato del correo
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(correo.trim())) {
                throw new Error('El correo electrónico no tiene un formato válido');
            }

            // Validar longitud mínima de contraseña
            if (contrasena.length < 6) {
                throw new Error('La contraseña debe tener al menos 6 caracteres');
            }

            // Verificar institución si se proporciona
            if (institucion_id) {
                const institucion = await Institucion.findByPk(institucion_id);
                if (!institucion) {
                    throw new Error('Institución no encontrada');
                }
            }

            // Verificar que no exista un usuario con el mismo correo
            const usuarioExistente = await Usuario.findOne({
                where: { correo: correo.trim().toLowerCase() }
            });

            if (usuarioExistente) {
                throw new Error('Ya existe un usuario registrado con ese correo electrónico');
            }

            // Encriptar contraseña
            const saltRounds = 10;
            const contrasenaHash = await bcrypt.hash(contrasena, saltRounds);

            // Crear el administrador (usuario con rol_id = 1)
            const nuevoAdmin = await Usuario.create({
                nombre: nombre.trim(),
                correo: correo.trim().toLowerCase(),
                contrasena: contrasenaHash,
                rol_id: 1, // Rol de administrador
                institucion_id: institucion_id || null,
                estado: true,
                email_verified_at: new Date() // Marcar como verificado automáticamente
            });

            // Obtener institución si existe
            const institucion = institucion_id ? await Institucion.findByPk(institucion_id) : null;

            // Generar token
            const token = this.generateTokenAdmin(nuevoAdmin.id);

            return {
                administrador: {
                    id: nuevoAdmin.id,
                    nombre: nuevoAdmin.nombre,
                    correo: nuevoAdmin.correo,
                    rol_id: nuevoAdmin.rol_id,
                    institucion_id: nuevoAdmin.institucion_id,
                    institucion: institucion?.nombre || null,
                    estado: nuevoAdmin.estado,
                    created_at: nuevoAdmin.created_at
                },
                token,
                token_type: 'Bearer',
                expires_in: 604800
            };

        } catch (error) {
            throw new Error(`Error en registro de administrador: ${error.message}`);
        }
    }

    // Iniciar sesión para administradores
    async loginAdministrador(correo, contrasena) {
        try {
            if (!correo?.trim() || !contrasena?.trim()) {
                throw new Error('Correo y contraseña son requeridos');
            }

            // Buscar el administrador por correo y rol
            const admin = await Usuario.findOne({
                where: {
                    correo: correo.trim().toLowerCase(),
                    rol_id: 1, // Solo administradores
                    estado: true
                },
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
                ]
            });

            if (!admin) {
                throw new Error('Credenciales inválidas o cuenta no encontrada');
            }

            // Verificar contraseña
            const contrasenaValida = await bcrypt.compare(contrasena, admin.contrasena);
            if (!contrasenaValida) {
                throw new Error('Credenciales inválidas');
            }

            // Generar token
            const token = this.generateTokenAdmin(admin.id);

            return {
                administrador: {
                    id: admin.id,
                    nombre: admin.nombre,
                    correo: admin.correo,
                    rol_id: admin.rol_id,
                    rol: admin.rol?.nombre,
                    institucion_id: admin.institucion_id,
                    institucion: admin.institucion?.nombre,
                    estado: admin.estado,
                    email_verified_at: admin.email_verified_at
                },
                token,
                token_type: 'Bearer',
                expires_in: 604800
            };

        } catch (error) {
            throw new Error(`Error en login de administrador: ${error.message}`);
        }
    }

    // Obtener datos del administrador actual
    async getMeAdministrador(adminId) {
        try {
            const admin = await Usuario.findOne({
                where: {
                    id: adminId,
                    rol_id: 1, // Solo administradores
                    estado: true
                },
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
                attributes: ['id', 'nombre', 'correo', 'rol_id', 'institucion_id', 'estado', 'created_at', 'email_verified_at']
            });

            if (!admin) {
                throw new Error('Administrador no encontrado');
            }

            return admin;

        } catch (error) {
            throw new Error(`Error al obtener datos del administrador: ${error.message}`);
        }
    }

    // Actualizar perfil de administrador
    async actualizarPerfilAdministrador(adminId, datosActualizacion) {
        try {
            const { nombre, correo, contrasena_actual, contrasena_nueva } = datosActualizacion;

            // Buscar el administrador
            const admin = await Usuario.findOne({
                where: { 
                    id: adminId, 
                    rol_id: 1,
                    estado: true 
                }
            });

            if (!admin) {
                throw new Error('Administrador no encontrado');
            }

            const datosParaActualizar = {};

            // Actualizar nombre si se proporciona
            if (nombre && nombre.trim()) {
                datosParaActualizar.nombre = nombre.trim();
            }

            // Actualizar correo si se proporciona
            if (correo && correo.trim()) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(correo.trim())) {
                    throw new Error('El correo electrónico no tiene un formato válido');
                }

                // Verificar que el correo no esté en uso por otro usuario
                const correoExistente = await Usuario.findOne({
                    where: { 
                        correo: correo.trim().toLowerCase(),
                        id: { [db.Sequelize.Op.ne]: adminId }
                    }
                });

                if (correoExistente) {
                    throw new Error('Ya existe otro usuario con ese correo electrónico');
                }

                datosParaActualizar.correo = correo.trim().toLowerCase();
            }

            // Actualizar contraseña si se proporciona
            if (contrasena_nueva) {
                if (!contrasena_actual) {
                    throw new Error('Se requiere la contraseña actual para cambiar la contraseña');
                }

                // Verificar contraseña actual
                const contrasenaValida = await bcrypt.compare(contrasena_actual, admin.contrasena);
                if (!contrasenaValida) {
                    throw new Error('La contraseña actual es incorrecta');
                }

                if (contrasena_nueva.length < 6) {
                    throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
                }

                const saltRounds = 10;
                datosParaActualizar.contrasena = await bcrypt.hash(contrasena_nueva, saltRounds);
            }

            // Actualizar en la base de datos
            await admin.update(datosParaActualizar);

            // Retornar datos actualizados
            const adminActualizado = await this.getMeAdministrador(adminId);

            return {
                administrador: adminActualizado,
                message: 'Perfil actualizado exitosamente'
            };

        } catch (error) {
            throw new Error(`Error al actualizar perfil: ${error.message}`);
        }
    }
}

module.exports = new AuthService();