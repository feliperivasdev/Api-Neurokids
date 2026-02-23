var express = require('express');
var router = express.Router();
const preguntas_evaluacionController = require('../controllers').preguntas_evaluacionController;
router.get('/', preguntas_evaluacionController.list);
//router.get('/:id', preguntas_evaluacionController.getById);
module.exports = router;