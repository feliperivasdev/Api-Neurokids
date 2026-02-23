var express = require('express');
var router = express.Router();
const preguntas_lecturaController = require('../controllers').preguntas_lecturaController;
router.get('/', preguntas_lecturaController.list);
router.get('/:id', preguntas_lecturaController.getById);
module.exports = router;