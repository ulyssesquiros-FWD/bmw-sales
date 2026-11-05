const express = require('express');
const { body, param } = require('express-validator');
const mantenimientoController = require('../controllers/mantenimientoController');
const { validateRequest } = require('../middleware/validateRequest');

const router = express.Router();

const validarMantenimiento = [
  body('id_vehiculo').isInt({ min: 1 }).withMessage('El ID de vehículo es obligatorio.'),
  body('id_cliente').isInt({ min: 1 }).withMessage('El ID de cliente es obligatorio.'),
  body('tipo_servicio').trim().notEmpty().withMessage('El tipo de servicio es obligatorio.'),
  body('costo').isFloat({ min: 0 }).withMessage('El costo debe ser un importe positivo o cero.'),
  body('fecha_servicio').isISO8601().withMessage('La fecha de servicio debe tener formato AAAA-MM-DD.'),
  validateRequest
];

router.get('/', mantenimientoController.listarMantenimientos);
router.get('/:id', param('id').isInt().withMessage('ID inválido.'), validateRequest, mantenimientoController.obtenerMantenimientoPorId);
router.post('/', validarMantenimiento, mantenimientoController.crearMantenimiento);
router.put('/:id', param('id').isInt().withMessage('ID inválido.'), validarMantenimiento, mantenimientoController.actualizarMantenimiento);
router.delete('/:id', param('id').isInt().withMessage('ID inválido.'), validateRequest, mantenimientoController.eliminarMantenimiento);

module.exports = router;

