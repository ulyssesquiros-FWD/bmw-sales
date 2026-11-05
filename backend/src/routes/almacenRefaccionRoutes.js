const express = require('express');
const { body, param } = require('express-validator');
const almacenRefaccionController = require('../controllers/almacenRefaccionController');
const { validateRequest } = require('../middleware/validateRequest');

const router = express.Router();

const validarRefaccion = [
  body('numero_parte_oem').trim().notEmpty().withMessage('Número de parte OEM obligatorio.'),
  body('nombre_pieza').trim().notEmpty().withMessage('Nombre de pieza obligatorio.'),
  body('id_proveedor').isInt({ min: 1 }).withMessage('ID de proveedor requerido.'),
  body('id_sucursal').isInt({ min: 1 }).withMessage('ID de sucursal requerido.'),
  body('costo_unitario_usd').isFloat({ min: 0 }).withMessage('Costo unitario debe ser positivo.'),
  validateRequest
];

router.get('/', almacenRefaccionController.listarRefacciones);
router.get('/:id', param('id').isInt().withMessage('ID inválido.'), validateRequest, almacenRefaccionController.obtenerRefaccionPorId);
router.post('/', validarRefaccion, almacenRefaccionController.registrarRefaccion);

module.exports = router;
