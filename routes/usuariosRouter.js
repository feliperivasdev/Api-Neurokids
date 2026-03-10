var express = require('express');
var router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const { verificarToken } = require('../middleware/authMiddleware');

// Todas las rutas de usuarios requieren autenticación
router.use(verificarToken);

// Rutas CRUD para usuarios
router.get('/', usuariosController.obtenerUsuarios);
router.get('/docentes', usuariosController.obtenerDocentes);
router.get('/administradores', usuariosController.obtenerAdministradores);
router.get('/:id', usuariosController.obtenerUsuarioPorId);
router.post('/', usuariosController.crearUsuario);
router.put('/:id', usuariosController.actualizarUsuario);
router.put('/:id/cambiar-contrasena', usuariosController.cambiarContrasena);
router.delete('/:id', usuariosController.eliminarUsuario);

module.exports = router;