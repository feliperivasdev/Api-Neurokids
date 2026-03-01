const express = require('express');
const router = express.Router();
const notificaciones_estudianteController = require('../controllers/notificaciones_estudianteController');

// Obtener las pendientes (esto ya lo tienes y funciona bien)
router.get('/pendientes/:estudiante_id', notificaciones_estudianteController.getNotificacionesPendientes);

// NUEVAS RUTAS buscando por estudiante_id
// Para marcar absolutamente todo como leído:
router.put('/marcar-todas-leidas/:estudiante_id', notificaciones_estudianteController.marcarTodasComoLeidas);

// O específicamente para el flujo de la medalla de registro:
router.put('/completar-bienvenida/:estudiante_id', notificaciones_estudianteController.marcarInsigniaBienvenidaLeida);

module.exports = router;