var express = require('express');
var router = express.Router();
const respuestas_lecturaController = require('../controllers').respuestas_lecturaController;
router.get('/', respuestas_lecturaController.list);
router.get('/:id', respuestas_lecturaController.getById);
module.exports = router;