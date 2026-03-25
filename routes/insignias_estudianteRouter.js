const express = require('express');
const router = express.Router();
const insigniasEstudianteController = require('../controllers/insignias_estudianteController');

// Catálogo completo (nombres desde BD) + estado bloqueada/desbloqueada (ruta específica antes de la genérica)
router.get(
  '/estudiante/:estudiante_id/catalogo',
  insigniasEstudianteController.getCatalogoInsigniasEstudiante
);

// Obtener el inventario de insignias ganadas por el estudiante
router.get('/estudiante/:estudiante_id', insigniasEstudianteController.getInsigniasPorEstudiante);

module.exports = router;