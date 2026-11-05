const express = require('express');
const { body, param } = require('express-validator');
const proveedorController = require('../controllers/proveedorController');
const { validateRequest } = require('../middleware/validateRequest');

const router = express.Router();

const validarProveedor = [
  body('razon_social').trim().notEmpty().withMessage('La razón social es obligatoria.'),
  body('rfc_identificacion').trim().notEmpty().withMessage('El RFC o identificación fiscal es obligatorio.'),
  body('contacto_nombre').trim().notEmpty().withMessage('El nombre de contacto es obligatorio.'),
  body('correo').isEmail().withMessage('El correo electrónico no es válido.'),
  body('telefono').trim().notEmpty().withMessage('El teléfono es obligatorio.'),
  validateRequest
];

router.get('/', proveedorController.listarProveedores);
router.get('/:id', param('id').isInt().withMessage('ID inválido.'), validateRequest, proveedorController.obtenerProveedorPorId);
router.post('/', validarProveedor, proveedorController.crearProveedor);
router.put('/:id', param('id').isInt().withMessage('ID inválido.'), validarProveedor, proveedorController.actualizarProveedor);
router.delete('/:id', param('id').isInt().withMessage('ID inválido.'), validateRequest, proveedorController.eliminarProveedor);

module.exports = router;

