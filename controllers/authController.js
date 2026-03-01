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
        const { nombre, institucion_id } = req.body;

        // Validar datos requeridos
        if (!nombre || !institucion_id) {
            return res.status(400).json({
                success: false,
                message: 'El nombre e institución son requeridos'
            });
        }

        const resultado = await authService.loginEstudiante(nombre, institucion_id);

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