var express = require('express');
var router = express.Router();
const usuariosController = require('../controllers').usuariosController;
router.get('/', usuariosController.list);
module.exports = router;