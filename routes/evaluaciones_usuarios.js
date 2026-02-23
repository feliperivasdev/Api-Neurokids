var express = require('express');
var router = express.Router();
const evaluaciones_usuariosController = require('../controllers').evaluaciones_usuariosController;
router.get('/', evaluaciones_usuariosController.list);
module.exports = router;