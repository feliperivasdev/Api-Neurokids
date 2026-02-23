var express = require('express');
var router = express.Router();
const resultados_preguntasController = require('../controllers').resultados_preguntasController;
router.get('/', resultados_preguntasController.list);
module.exports = router;