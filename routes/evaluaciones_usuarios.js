var express = require('express');
var router = express.Router();
const evaluaciones_usuariosController = require('../controllers').evaluaciones_usuariosController;
router.get('/', evaluaciones_usuariosController.list);
router.get('/:id', evaluaciones_usuariosController.getById);
module.exports = router;