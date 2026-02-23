var express = require('express');
var router = express.Router();
const usuarios_lecturasController = require('../controllers').usuarios_lecturasController;
router.get('/', usuarios_lecturasController.list);
router.get('/:id', usuarios_lecturasController.getById);
module.exports = router;