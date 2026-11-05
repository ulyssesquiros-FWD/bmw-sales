const express = require('express');
const { body, param } = require('express-validator');
const garantiaController = require('../controllers/garantiaController');
const { validateRequest } = require('../middleware/validateRequest');

const router = express.Router();

const validarGarantia = [
  body('id_vehiculo').isInt({ min: 1 }).withMessage('El ID de vehículo es obligatorio.'),
  body('tipo_garantia').trim().notEmpty().withMessage('El tipo de garantía es obligatorio.'),
  body('cobertura_meses').isInt({ min: 1 }).withMessage('La cobertura en meses debe ser un entero positivo.'),
  body('kilometraje_limite').isInt({ min: 0 }).withMessage('El kilometraje límite debe ser un entero no negativo.'),
  body('fecha_inicio').isISO8601().withMessage('La fecha de inicio debe tener formato AAAA-MM-DD.'),
  validateRequest
];

router.get('/', garantiaController.listarGarantias);
router.get('/:id', param('id').isInt().withMessage('ID inválido.'), validateRequest, garantiaController.obtenerGarantiaPorId);
router.post('/', validarGarantia, garantiaController.crearGarantia);
router.put('/:id', param('id').isInt().withMessage('ID inválido.'), validarGarantia, garantiaController.actualizarGarantia);
router.delete('/:id', param('id').isInt().withMessage('ID inválido.'), validateRequest, garantiaController.eliminarGarantia);

module.exports = router;
