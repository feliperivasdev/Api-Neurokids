const express = require('express');
const router = express.Router();
const estudiantesController = require('../controllers/estudiantesController');

// Obtener el perfil con sus puntos y logros incluidos
router.get('/perfil/:id', estudiantesController.getPerfilCompleto);

module.exports = router;