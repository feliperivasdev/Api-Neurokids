var express = require('express');
var router = express.Router();
const niveles_dificultadController = require('../controllers').niveles_dificultadController;
router.get('/', niveles_dificultadController.list);
module.exports = router;