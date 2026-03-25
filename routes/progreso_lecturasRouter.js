const express = require('express');
const router = express.Router();
const progresoLecturasController = require('../controllers/progreso_lecturasController');

// Guardar o actualizar progreso de lectura
router.post('/', progresoLecturasController.guardarProgresoLectura);

// Obtener progreso de lecturas de un estudiante
router.get('/estudiante/:estudiante_id', progresoLecturasController.getProgresoLecturasEstudiante);

// Obtener progreso de una lectura específica para un estudiante
router.get('/lectura/:lectura_id/estudiante/:estudiante_id', progresoLecturasController.getProgresoLectura);

module.exports = router;

