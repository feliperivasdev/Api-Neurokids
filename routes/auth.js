var express = require('express');
var router = express.Router();
const authController = require('../controllers/authController');
const { verificarToken } = require('../middleware/authMiddleware');

// Rutas públicas
router.get('/instituciones', authController.getInstituciones);
router.post('/estudiantes/iniciar-sesion', authController.loginEstudiante);
router.post('/estudiantes/registro', authController.registrarEstudiante);
router.post('/logout', authController.logout);

// Rutas protegidas
router.get('/me', verificarToken, authController.getMeEstudiante);

module.exports = router;