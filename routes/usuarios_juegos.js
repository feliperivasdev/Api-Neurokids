var express = require('express');
var router = express.Router();
const usuarios_juegosController = require('../controllers').usuarios_juegosController;
router.get('/', usuarios_juegosController.list);
router.get('/:id', usuarios_juegosController.getById);
module.exports = router;