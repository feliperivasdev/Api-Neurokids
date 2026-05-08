const express = require('express');

const router = express.Router();

const reportesController = require('../controllers/reportesController');

const { verificarToken, verificarAdminODocente } = require('../middleware/authMiddleware');



router.get('/estudiantes', verificarToken, verificarAdminODocente, reportesController.reporteEstudiantes);

router.get(
  '/analisis-general',
  // verificarToken,
  // verificarAdminODocente,
  reportesController.analisisGeneral
);

router.get(

  '/estudiantes/:estudiante_id/detalle',

  verificarToken,

  verificarAdminODocente,

  reportesController.reporteDetalleEstudiante

);



module.exports = router;

