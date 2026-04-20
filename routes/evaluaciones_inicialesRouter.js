const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/evaluaciones_inicialesController');

router.get('/temas/:grupo_edad_id', verificarToken, ctrl.getTemas);
router.get('/verificar/:estudiante_id', verificarToken, ctrl.verificarEvaluacion);
router.post('/setup', verificarToken, ctrl.setup);
router.post('/responder', verificarToken, ctrl.responder);

module.exports = router;
