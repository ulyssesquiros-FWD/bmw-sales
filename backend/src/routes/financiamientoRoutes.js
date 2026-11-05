const express = require('express');
const { body, param } = require('express-validator');
const financiamientoController = require('../controllers/financiamientoController');
const { validateRequest } = require('../middleware/validateRequest');

const router = express.Router();

const validarFinanciamiento = [
  body('id_venta').isInt({ min: 1 }).withMessage('El ID de venta es obligatorio.'),
  body('plazo_meses').isInt({ min: 6 }).withMessage('El plazo debe ser de al menos 6 meses.'),
  body('tasa_interes_anual').isFloat({ min: 0 }).withMessage('La tasa de interés debe ser positiva.'),
  body('cuota_mensual').isFloat({ min: 1 }).withMessage('La cuota mensual debe ser mayor a 0.'),
  body('monto_financiado').isFloat({ min: 1 }).withMessage('El monto financiado debe ser mayor a 0.'),
  validateRequest
];

router.get('/', financiamientoController.listarFinanciamientos);
router.get('/:id', param('id').isInt().withMessage('ID inválido.'), validateRequest, financiamientoController.obtenerFinanciamientoPorId);
router.post('/', validarFinanciamiento, financiamientoController.crearFinanciamiento);
router.put('/:id', param('id').isInt().withMessage('ID inválido.'), validarFinanciamiento, financiamientoController.actualizarFinanciamiento);
router.delete('/:id', param('id').isInt().withMessage('ID inválido.'), validateRequest, financiamientoController.eliminarFinanciamiento);

module.exports = router;
