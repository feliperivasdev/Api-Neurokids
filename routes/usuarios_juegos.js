var express = require('express');
var router = express.Router();
const usuarios_juegosController = require('../controllers').usuarios_juegosController;
router.get('/', usuarios_juegosController.list);
module.exports = router;