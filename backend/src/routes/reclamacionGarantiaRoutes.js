const express = require('express');
const { body, param } = require('express-validator');
const reclamacionGarantiaController = require('../controllers/reclamacionGarantiaController');
const { validateRequest } = require('../middleware/validateRequest');

const router = express.Router();

const validarReclamacion = [
  body('codigo_reclamacion').trim().notEmpty().withMessage('Código de reclamación obligatorio.'),
  body('id_garantia').isInt({ min: 1 }).withMessage('ID de garantía obligatorio.'),
  body('id_vehiculo').isInt({ min: 1 }).withMessage('ID de vehículo obligatorio.'),
  body('codigo_falla_ista').trim().notEmpty().withMessage('Código ISTA obligatorio.'),
  body('monto_reclamado_usd').isFloat({ min: 0 }).withMessage('Monto reclamado inválido.'),
  body('fecha_reclamacion').isISO8601().withMessage('Fecha inválida.'),
  validateRequest
];

router.get('/', reclamacionGarantiaController.listarReclamaciones);
router.get('/:id', param('id').isInt().withMessage('ID inválido.'), validateRequest, reclamacionGarantiaController.obtenerReclamacionPorId);
router.post('/', validarReclamacion, reclamacionGarantiaController.registrarReclamacion);

module.exports = router;
