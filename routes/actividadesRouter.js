const express = require('express');
const router = express.Router();
const actividadesController = require('../controllers/actividadesController');

router.get('/', actividadesController.listarActividades);

module.exports = router;

