const express = require('express');
const router = express.Router();
const institucionesAdminController = require('../controllers/institucionesAdminController');
const { verificarToken, verificarAdministrador } = require('../middleware/authMiddleware');

router.use(verificarToken, verificarAdministrador);

router.get('/', institucionesAdminController.obtenerInstitucionesAdmin);
router.post('/', institucionesAdminController.crearInstitucionAdmin);
router.put('/:id', institucionesAdminController.actualizarInstitucionAdmin);

module.exports = router;

