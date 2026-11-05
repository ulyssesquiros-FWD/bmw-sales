const express = require('express');
const { body, param } = require('express-validator');
const cotizacionController = require('../controllers/cotizacionController');
const { validateRequest } = require('../middleware/validateRequest');

const router = express.Router();

const validarCotizacion = [
  body('folio').trim().notEmpty().withMessage('El folio de la cotización es obligatorio.'),
  body('id_cliente').isInt({ min: 1 }).withMessage('El ID de cliente es obligatorio.'),
  body('id_vehiculo').isInt({ min: 1 }).withMessage('El ID de vehículo es obligatorio.'),
  body('id_vendedor').isInt({ min: 1 }).withMessage('El ID de vendedor es obligatorio.'),
  body('precio_final').isFloat({ min: 1 }).withMessage('El precio final debe ser positivo.'),
  body('fecha_emision').isISO8601().withMessage('Fecha de emisión inválida.'),
  body('fecha_vencimiento').isISO8601().withMessage('Fecha de vencimiento inválida.'),
  validateRequest
];

router.get('/', cotizacionController.listarCotizaciones);
router.get('/:id', param('id').isInt().withMessage('ID inválido.'), validateRequest, cotizacionController.obtenerCotizacionPorId);
router.post('/', validarCotizacion, cotizacionController.crearCotizacion);
router.put('/:id', param('id').isInt().withMessage('ID inválido.'), validateRequest, cotizacionController.actualizarCotizacion);
router.delete('/:id', param('id').isInt().withMessage('ID inválido.'), validateRequest, cotizacionController.eliminarCotizacion);

module.exports = router;
