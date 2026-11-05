const express = require('express');
const { body, param } = require('express-validator');
const auditoriaLogController = require('../controllers/auditoriaLogController');
const { validateRequest } = require('../middleware/validateRequest');

const router = express.Router();

const validarEvento = [
  body('accion').trim().notEmpty().withMessage('La acción auditada es obligatoria.'),
  body('entidad_afectada').trim().notEmpty().withMessage('La entidad afectada es obligatoria.'),
  validateRequest
];

router.get('/', auditoriaLogController.listarLogs);
router.get('/:id', param('id').isInt().withMessage('ID inválido.'), validateRequest, auditoriaLogController.obtenerLogPorId);
router.post('/', validarEvento, auditoriaLogController.registrarEvento);

module.exports = router;
