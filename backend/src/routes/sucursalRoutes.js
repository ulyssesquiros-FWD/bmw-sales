const express = require('express');
const { body, param } = require('express-validator');
const sucursalController = require('../controllers/sucursalController');
const { validateRequest } = require('../middleware/validateRequest');

const router = express.Router();

const validarSucursal = [
  body('nombre').trim().notEmpty().withMessage('El nombre de la sucursal es obligatorio.'),
  body('ciudad').trim().notEmpty().withMessage('La ciudad es obligatoria.'),
  body('direccion').trim().notEmpty().withMessage('La dirección es obligatoria.'),
  body('telefono').trim().notEmpty().withMessage('El teléfono es obligatorio.'),
  validateRequest
];

router.get('/', sucursalController.listarSucursales);
router.get('/:id', param('id').isInt().withMessage('ID inválido.'), validateRequest, sucursalController.obtenerSucursalPorId);
router.post('/', validarSucursal, sucursalController.crearSucursal);
router.put('/:id', param('id').isInt().withMessage('ID inválido.'), validarSucursal, sucursalController.actualizarSucursal);
router.delete('/:id', param('id').isInt().withMessage('ID inválido.'), validateRequest, sucursalController.eliminarSucursal);

module.exports = router;
