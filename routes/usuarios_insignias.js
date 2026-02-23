var express = require('express');
var router = express.Router();
const usuarios_insigniasController = require('../controllers').usuarios_insigniasController;
router.get('/', usuarios_insigniasController.list);
module.exports = router;