var express = require('express');
var router = express.Router();
const institucionesController = require('../controllers').institucionesController;
router.get('/', institucionesController.list);
router.get('/:id', institucionesController.getById);
module.exports = router;