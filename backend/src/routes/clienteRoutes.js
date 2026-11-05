const express = require('express');
const { body, param } = require('express-validator');
const clienteController = require('../controllers/clienteController');
const { validateRequest } = require('../middleware/validateRequest');

const router = express.Router();

const idParamRule = [
  param('id').isInt({ min: 1 }).withMessage('El identificador del cliente debe ser un entero positivo.')
];

const clienteBodyRules = [
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El nombre del cliente es obligatorio.')
    .isLength({ max: 100 })
    .withMessage('El nombre no puede superar 100 caracteres.'),
  body('apellidos')
    .trim()
    .notEmpty()
    .withMessage('Los apellidos del cliente son obligatorios.')
    .isLength({ max: 100 })
    .withMessage('Los apellidos no pueden superar 100 caracteres.'),
  body('identificacion')
    .trim()
    .notEmpty()
    .withMessage('El número de identificación es obligatorio.')
    .isLength({ min: 3, max: 30 })
    .withMessage('La identificación debe tener entre 3 y 30 caracteres.'),
  body('telefono')
    .trim()
    .notEmpty()
    .withMessage('El teléfono del cliente es obligatorio.')
    .isLength({ min: 5, max: 20 })
    .withMessage('El teléfono debe tener entre 5 y 20 caracteres.'),
  body('correo')
    .trim()
    .notEmpty()
    .withMessage('El correo electrónico es obligatorio.')
    .isEmail()
    .withMessage('Debe ingresar un correo electrónico válido.')
    .isLength({ max: 120 })
    .withMessage('El correo electrónico no puede superar 120 caracteres.'),
  body('direccion')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 255 })
    .withMessage('La dirección no puede superar 255 caracteres.')
];

router.get('/', clienteController.getClientes);
router.get('/:id', idParamRule, validateRequest, clienteController.getClienteById);
router.post('/', clienteBodyRules, validateRequest, clienteController.createCliente);
router.put('/:id', [...idParamRule, ...clienteBodyRules], validateRequest, clienteController.updateCliente);
router.delete('/:id', idParamRule, validateRequest, clienteController.deleteCliente);

module.exports = router;

