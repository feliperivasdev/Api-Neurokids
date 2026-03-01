const express = require('express');
const router = express.Router();
const insigniasEstudianteController = require('../controllers/insignias_estudianteController');

// Obtener el inventario de insignias ganadas por el estudiante
router.get('/estudiante/:estudiante_id', insigniasEstudianteController.getInsigniasPorEstudiante);

module.exports = router;