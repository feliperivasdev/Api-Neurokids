var express = require('express');
var router = express.Router();
const authController = require('../controllers/authController');
const { verificarToken } = require('../middleware/authMiddleware');

// Rutas públicas - ESTUDIANTES
router.get('/instituciones', authController.getInstituciones);
router.post('/estudiantes/iniciar-sesion', authController.loginEstudiante);
router.post('/estudiantes/registro', authController.registrarEstudiante);

// Rutas públicas - DOCENTES
router.post('/docentes/registro', authController.registrarDocente);
router.post('/docentes/iniciar-sesion', authController.loginDocente);

// Rutas públicas - ADMINISTRADORES
router.post('/administradores/registro', authController.registrarAdministrador);
router.post('/administradores/iniciar-sesion', authController.loginAdministrador);

// Ruta de logout general
router.post('/logout', authController.logout);

// Rutas protegidas - ESTUDIANTES
router.get('/estudiantes/me', verificarToken, authController.getMeEstudiante);

// Rutas protegidas - DOCENTES
router.get('/docentes/me', verificarToken, authController.getMeDocente);
router.put('/docentes/perfil', verificarToken, authController.actualizarPerfilDocente);

// Rutas protegidas - ADMINISTRADORES
router.get('/administradores/me', verificarToken, authController.getMeAdministrador);
router.put('/administradores/perfil', verificarToken, authController.actualizarPerfilAdministrador);

module.exports = router;