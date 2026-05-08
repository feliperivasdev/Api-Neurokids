const express = require('express');
const router = express.Router();
const estudiantesController = require('../controllers/estudiantesController');
const { verificarToken, verificarAdminODocente } = require('../middleware/authMiddleware');

// Listar estudiantes (solo administradores y docentes; requiere token)
router.get('/', verificarToken, verificarAdminODocente, estudiantesController.listarEstudiantes);

// Obtener el perfil con sus puntos y logros incluidos
router.get('/perfil/:id', estudiantesController.getPerfilCompleto);

// Crear estudiante
router.post('/', verificarToken, verificarAdminODocente, estudiantesController.crearEstudiante);

// Actualizar estudiante
router.put('/:id', verificarToken, verificarAdminODocente, estudiantesController.actualizarEstudiante);

// Eliminar estudiante
router.delete('/:id', verificarToken, verificarAdminODocente, estudiantesController.eliminarEstudiante);

module.exports = router;