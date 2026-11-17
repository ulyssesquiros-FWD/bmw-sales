const express = require('express');
const empresaController = require('../controllers/empresaController');
const { requireAdmin } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/mi-empresa', empresaController.getMiEmpresa);
router.put('/plan', requireAdmin, empresaController.updatePlan);
router.get('/colaboradores', empresaController.listColaboradores);
router.post('/colaboradores', requireAdmin, empresaController.createColaborador);
router.delete('/colaboradores/:id', requireAdmin, empresaController.deleteColaborador);

module.exports = router;
