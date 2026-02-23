var express = require('express');
var router = express.Router();
const preguntas_lecturaController = require('../controllers').preguntas_lecturaController;
router.get('/', preguntas_lecturaController.list);
module.exports = router;