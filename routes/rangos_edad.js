var express = require('express');
var router = express.Router();
const rangos_edadController = require('../controllers').rangos_edadController;
router.get('/', rangos_edadController.list);
module.exports = router;