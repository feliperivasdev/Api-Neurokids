var express = require('express');
var router = express.Router();
const respuestas_evaluacionController = require('../controllers').respuestas_evaluacionController;
router.get('/', respuestas_evaluacionController.list);
module.exports = router;