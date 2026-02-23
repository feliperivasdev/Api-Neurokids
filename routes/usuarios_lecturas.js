var express = require('express');
var router = express.Router();
const usuarios_lecturasController = require('../controllers').usuarios_lecturasController;
router.get('/', usuarios_lecturasController.list);
module.exports = router;