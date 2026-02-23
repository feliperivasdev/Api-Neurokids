var express = require('express');
var router = express.Router();
const rolesController = require('../controllers').rolesController;
router.get('/', rolesController.list);
router.get('/:id', rolesController.getById);
module.exports = router;