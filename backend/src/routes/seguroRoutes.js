const express = require('express');
const { body, param } = require('express-validator');
const seguroController = require('../controllers/seguroController');
const { validateRequest } = require('../middleware/validateRequest');

const router = express.Router();

const validarSeguro = [
  body('id_vehiculo').isInt({ min: 1 }).withMessage('El ID de vehículo es obligatorio.'),
  body('aseguradora').trim().notEmpty().withMessage('La aseguradora es obligatoria.'),
  body('numero_poliza').trim().notEmpty().withMessage('El número de póliza es obligatorio.'),
  body('cobertura').trim().notEmpty().withMessage('El tipo de cobertura es obligatorio.'),
  body('prima_anual').isFloat({ min: 1 }).withMessage('La prima anual debe ser mayor a 0.'),
  body('fecha_vencimiento').isISO8601().withMessage('La fecha de vencimiento debe tener formato AAAA-MM-DD.'),
  validateRequest
];

router.get('/', seguroController.listarSeguros);
router.get('/:id', param('id').isInt().withMessage('ID inválido.'), validateRequest, seguroController.obtenerSeguroPorId);
router.post('/', validarSeguro, seguroController.crearSeguro);
router.put('/:id', param('id').isInt().withMessage('ID inválido.'), validarSeguro, seguroController.actualizarSeguro);
router.delete('/:id', param('id').isInt().withMessage('ID inválido.'), validateRequest, seguroController.eliminarSeguro);

module.exports = router;
