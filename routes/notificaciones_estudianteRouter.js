const express = require('express');
const router = express.Router();
const notificaciones_estudianteController = require('../controllers/notificaciones_estudianteController');


router.get('/pendientes/:estudiante_id', notificaciones_estudianteController.getNotificacionesPendientes);


router.put('/marcar-todas-leidas/:estudiante_id', notificaciones_estudianteController.marcarTodasComoLeidas);


router.put('/completar-bienvenida/:estudiante_id', notificaciones_estudianteController.marcarInsigniaBienvenidaLeida);


router.put(
  '/marcar-leida/:estudiante_id/:notificacion_id',
  notificaciones_estudianteController.marcarUnaComoLeida
);

module.exports = router;