var express = require('express');
var router = express.Router();
const juegosController = require('../controllers').juegosController;
router.get('/', juegosController.list);
module.exports = router;