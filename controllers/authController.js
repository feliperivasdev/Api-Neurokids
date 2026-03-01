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