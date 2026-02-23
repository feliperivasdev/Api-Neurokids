var express = require('express');
var router = express.Router();
const insigniasController = require('../controllers').insigniasController;
router.get('/', insigniasController.list);
router.get('/:id', insigniasController.getById);
module.exports = router;