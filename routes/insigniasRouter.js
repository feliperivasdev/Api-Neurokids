const express = require('express');
const router = express.Router();
const insigniasController = require('../controllers/insigniasController');

// Obtener una insignia específica
router.get('/:id', insigniasController.getInsigniaById);

// Obtener todas las insignias
router.get('/', insigniasController.getAllInsignias);

module.exports = router;