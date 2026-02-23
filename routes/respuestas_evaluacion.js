var express = require('express');
var router = express.Router();
const respuestas_evaluacionController = require('../controllers').respuestas_evaluacionController;
router.get('/', respuestas_evaluacionController.list);
router.get('/:id', respuestas_evaluacionController.getById);
module.exports = router;