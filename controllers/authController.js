const authService = require('../services/authService');

exports.getInstituciones = async (req, res, next) => {
    try {
        const instituciones = await authService.getInstituciones();

        return res.status(200).json({
            success: true,
            data: instituciones,
            message: 'Instituciones obtenidas exitosamente'
        });
    } catch (error) {
        console.error('Error en getInstituciones:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.loginEstudiante = async (req, res, next) => {
    try {
        // Debug logs
        console.log('--- LOGIN DEBUG ---');
        console.log('Content-Type:', req.headers['content-type']);
        console.log('Body completo:', req.body);
        console.log('Parámetros recibidos:', {
            nombre: req.body.nombre,
            apellido: req.body.apellido,
            institucion_id: req.body.institucion_id
        });
        console.log('--- FIN DEBUG ---');

        const { nombre, apellido, institucion_id } = req.body;

        // Validar datos requeridos
        if (!nombre || !apellido || !institucion_id) {
            return res.status(400).json({
                success: false,
                message: 'El nombre, apellido e institución son requeridos'
            });
        }

        const resultado = await authService.loginEstudiante(nombre, apellido, institucion_id);

        return res.status(200).json({
            success: true,
            message: 'Sesión iniciada exitosamente',
            data: resultado
        });
    } catch (error) {
        console.error('Error en loginEstudiante:', error);
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.getMeEstudiante = async (req, res, next) => {
    try {
        const estudianteId = req.usuario?.id;

        if (!estudianteId) {
            return res.status(401).json({
                success: false,
                message: 'No autorizado'
            });
        }

        const estudiante = await authService.getMeEstudiante(estudianteId);

        return res.status(200).json({
            success: true,
            data: estudiante
        });
    } catch (error) {
        console.error('Error en getMeEstudiante:', error);
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.registrarEstudiante = async (req, res, next) => {
    try {
        const datosEstudiante = req.body;

        // Validar datos básicos requeridos
        if (!datosEstudiante.nombre || !datosEstudiante.apellido || !datosEstudiante.institucion_id) {
            return res.status(400).json({
                success: false,
                message: 'El nombre, apellido e institución son requeridos'
            });
        }

        const resultado = await authService.registrarEstudiante(datosEstudiante);

        return res.status(201).json({
            success: true,
            message: 'Cuenta creada exitosamente',
            data: resultado
        });
    } catch (error) {
        console.error('Error en registrarEstudiante:', error);
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.logout = async (req, res, next) => {
    try {
        const resultado = await authService.logout();

        return res.status(200).json({
            success: true,
            message: resultado.message
        });
    } catch (error) {
        console.error('Error en logout:', error);
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// ========== CONTROLADORES PARA DOCENTES ==========

exports.registrarDocente = async (req, res, next) => {
    try {
        const datosDocente = req.body;

        // Validar datos básicos requeridos
        if (!datosDocente.nombre || !datosDocente.correo || !datosDocente.contrasena || !datosDocente.institucion_id) {
            return res.status(400).json({
                success: false,
                message: 'Nombre, correo, contraseña e institución son requeridos'
            });
        }

        const resultado = await authService.registrarDocente(datosDocente);

        return res.status(201).json({
            success: true,
            message: 'Cuenta de docente creada exitosamente',
            data: resultado
        });
    } catch (error) {
        console.error('Error en registrarDocente:', error);
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.loginDocente = async (req, res, next) => {
    try {
        console.log('--- LOGIN DOCENTE DEBUG ---');
        console.log('Content-Type:', req.headers['content-type']);
        console.log('Body completo:', req.body);
        console.log('--- FIN DEBUG ---');

        const { correo, contrasena } = req.body;

        // Validar datos requeridos
        if (!correo || !contrasena) {
            return res.status(400).json({
                success: false,
                message: 'Correo y contraseña son requeridos'
            });
        }

        const resultado = await authService.loginDocente(correo, contrasena);

        return res.status(200).json({
            success: true,
            message: 'Sesión de docente iniciada exitosamente',
            data: resultado
        });
    } catch (error) {
        console.error('Error en loginDocente:', error);
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.getMeDocente = async (req, res, next) => {
    try {
        const docenteId = req.usuario?.id;

        if (!docenteId) {
            return res.status(401).json({
                success: false,
                message: 'No autorizado'
            });
        }

        const docente = await authService.getMeDocente(docenteId);

        return res.status(200).json({
            success: true,
            data: docente
        });
    } catch (error) {
        console.error('Error en getMeDocente:', error);
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.actualizarPerfilDocente = async (req, res, next) => {
    try {
        const docenteId = req.usuario?.id;
        const datosActualizacion = req.body;

        if (!docenteId) {
            return res.status(401).json({
                success: false,
                message: 'No autorizado'
            });
        }

        const resultado = await authService.actualizarPerfilDocente(docenteId, datosActualizacion);

        return res.status(200).json({
            success: true,
            message: resultado.message,
            data: resultado.docente
        });
    } catch (error) {
        console.error('Error en actualizarPerfilDocente:', error);
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// ========== CONTROLADORES PARA ADMINISTRADORES ==========

exports.registrarAdministrador = async (req, res, next) => {
    try {
        const datosAdmin = req.body;

        // Validar datos básicos requeridos
        if (!datosAdmin.nombre || !datosAdmin.correo || !datosAdmin.contrasena) {
            return res.status(400).json({
                success: false,
                message: 'Nombre, correo y contraseña son requeridos'
            });
        }

        const resultado = await authService.registrarAdministrador(datosAdmin);

        return res.status(201).json({
            success: true,
            message: 'Cuenta de administrador creada exitosamente',
            data: resultado
        });
    } catch (error) {
        console.error('Error en registrarAdministrador:', error);
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.loginAdministrador = async (req, res, next) => {
    try {
        console.log('--- LOGIN ADMINISTRADOR DEBUG ---');
        console.log('Content-Type:', req.headers['content-type']);
        console.log('Body completo:', req.body);
        console.log('--- FIN DEBUG ---');

        const { correo, contrasena } = req.body;

        // Validar datos requeridos
        if (!correo || !contrasena) {
            return res.status(400).json({
                success: false,
                message: 'Correo y contraseña son requeridos'
            });
        }

        const resultado = await authService.loginAdministrador(correo, contrasena);

        return res.status(200).json({
            success: true,
            message: 'Sesión de administrador iniciada exitosamente',
            data: resultado
        });
    } catch (error) {
        console.error('Error en loginAdministrador:', error);
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.getMeAdministrador = async (req, res, next) => {
    try {
        const adminId = req.usuario?.id;

        if (!adminId) {
            return res.status(401).json({
                success: false,
                message: 'No autorizado'
            });
        }

        const administrador = await authService.getMeAdministrador(adminId);

        return res.status(200).json({
            success: true,
            data: administrador
        });
    } catch (error) {
        console.error('Error en getMeAdministrador:', error);
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.actualizarPerfilAdministrador = async (req, res, next) => {
    try {
        const adminId = req.usuario?.id;
        const datosActualizacion = req.body;

        if (!adminId) {
            return res.status(401).json({
                success: false,
                message: 'No autorizado'
            });
        }

        const resultado = await authService.actualizarPerfilAdministrador(adminId, datosActualizacion);

        return res.status(200).json({
            success: true,
            message: resultado.message,
            data: resultado.administrador
        });
    } catch (error) {
        console.error('Error en actualizarPerfilAdministrador:', error);
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};