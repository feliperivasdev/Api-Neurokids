var express = require('express');
var router = express.Router();
const evaluacionesController = require('../controllers').evaluacionesController;
router.get('/', evaluacionesController.list);
module.exports = router;