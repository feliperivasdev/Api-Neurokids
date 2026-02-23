var express = require('express');
var router = express.Router();
const evaluacionesController = require('../controllers').evaluacionesController;
router.get('/', evaluacionesController.list);
router.get('/:id', evaluacionesController.getById);
module.exports = router;