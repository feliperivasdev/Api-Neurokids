var express = require('express');
var router = express.Router();
const institucionesController = require('../controllers').institucionesController;
router.get('/', institucionesController.list);
module.exports = router;