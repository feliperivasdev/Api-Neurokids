var express = require('express');
var router = express.Router();
const lecturasController = require('../controllers').lecturasController;
router.get('/', lecturasController.list);
router.get('/:id', lecturasController.getById);
module.exports = router;