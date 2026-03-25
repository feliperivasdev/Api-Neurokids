var express = require('express');
var router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const { verificarToken, verificarAdministrador } = require('../middleware/authMiddleware');

// Todas las rutas de usuarios requieren autenticación
router.use(verificarToken);

// Rutas CRUD para usuarios
// Seguridad: solo administradores pueden gestionar usuarios
router.get('/', verificarAdministrador, usuariosController.obtenerUsuarios);
router.get('/docentes', verificarAdministrador, usuariosController.obtenerDocentes);
router.post('/docentes', verificarAdministrador, usuariosController.crearDocente);
router.get('/administradores', verificarAdministrador, usuariosController.obtenerAdministradores);
router.get('/:id', verificarAdministrador, usuariosController.obtenerUsuarioPorId);
router.post('/', verificarAdministrador, usuariosController.crearUsuario);
router.put('/:id', verificarAdministrador, usuariosController.actualizarUsuario);
router.put('/:id/cambiar-contrasena', verificarAdministrador, usuariosController.cambiarContrasena);
router.delete('/:id', verificarAdministrador, usuariosController.eliminarUsuario);

module.exports = router;