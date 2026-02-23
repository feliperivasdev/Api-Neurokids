var express = require('express');
var router = express.Router();
const resultados_preguntasController = require('../controllers').resultados_preguntasController;
router.get('/', resultados_preguntasController.list);
router.get('/:id', resultados_preguntasController.getById);
module.exports = router;