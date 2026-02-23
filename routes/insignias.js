var express = require('express');
var router = express.Router();
const insigniasController = require('../controllers').insigniasController;
router.get('/', insigniasController.list);
module.exports = router;