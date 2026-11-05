const express = require('express');
const { body, param } = require('express-validator');
const vendedorController = require('../controllers/vendedorController');
const { validateRequest } = require('../middleware/validateRequest');

const router = express.Router();

const idParamRule = [
  param('id').isInt({ min: 1 }).withMessage('El identificador del vendedor debe ser un entero positivo.')
];

const vendedorBodyRules = [
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El nombre del vendedor es obligatorio.')
    .isLength({ max: 100 })
    .withMessage('El nombre no puede superar 100 caracteres.'),
  body('apellidos')
    .trim()
    .notEmpty()
    .withMessage('Los apellidos del vendedor son obligatorios.')
    .isLength({ max: 100 })
    .withMessage('Los apellidos no pueden superar 100 caracteres.'),
  body('telefono')
    .trim()
    .notEmpty()
    .withMessage('El teléfono del vendedor es obligatorio.')
    .isLength({ min: 5, max: 20 })
    .withMessage('El teléfono debe tener entre 5 y 20 caracteres.'),
  body('correo')
    .trim()
    .notEmpty()
    .withMessage('El correo electrónico del vendedor es obligatorio.')
    .isEmail()
    .withMessage('Debe ingresar un correo electrónico válido.')
    .isLength({ max: 120 })
    .withMessage('El correo electrónico no puede superar 120 caracteres.'),
  body('fecha_contratacion')
    .trim()
    .notEmpty()
    .withMessage('La fecha de contratación es obligatoria.')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('La fecha de contratación debe tener el formato AAAA-MM-DD.')
    .isISO8601({ strict: true })
    .withMessage('La fecha de contratación ingresada no es una fecha válida.')
];

router.get('/', vendedorController.getVendedores);
router.get('/:id', idParamRule, validateRequest, vendedorController.getVendedorById);
router.post('/', vendedorBodyRules, validateRequest, vendedorController.createVendedor);
router.put('/:id', [...idParamRule, ...vendedorBodyRules], validateRequest, vendedorController.updateVendedor);
router.delete('/:id', idParamRule, validateRequest, vendedorController.deleteVendedor);

module.exports = router;

