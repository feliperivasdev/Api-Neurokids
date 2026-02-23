var express = require('express');
var router = express.Router();
const juegosController = require('../controllers').juegosController;
router.get('/', juegosController.list);
router.get('/:id', juegosController.getById);
module.exports = router;