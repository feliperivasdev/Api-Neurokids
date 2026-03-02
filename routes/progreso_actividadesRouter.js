const express = require('express');
const router = express.Router();
const progresoActividadesController = require('../controllers/progreso_actividadesController');

// Guardar o actualizar progreso
router.post('/', progresoActividadesController.guardarProgreso);

// Obtener progreso del estudiante
router.get('/estudiante/:estudiante_id', progresoActividadesController.getProgresoEstudiante);

// Obtener progreso de una actividad específica
router.get('/actividad/:actividad_id/estudiante/:estudiante_id', progresoActividadesController.getProgresoActividad);

// Obtener resumen de progreso
router.get('/resumen/:estudiante_id', progresoActividadesController.getResumenProgreso);

// Obtener actividades pendientes
router.get('/pendientes/:estudiante_id', progresoActividadesController.getActividadesPendientes);

module.exports = router;