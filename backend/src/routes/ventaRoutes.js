const express = require('express');
const { body, param } = require('express-validator');
const ventaController = require('../controllers/ventaController');
const { validateRequest } = require('../middleware/validateRequest');

const router = express.Router();

const idParamRule = [
  param('id').isInt({ min: 1 }).withMessage('El identificador de la venta debe ser un entero positivo.')
];

const ventaBodyRules = [
  body('id_vehiculo')
    .notEmpty()
    .withMessage('Debe seleccionar un vehículo disponible para la venta.')
    .isInt({ min: 1 })
    .withMessage('El identificador del vehículo debe ser un entero positivo.'),
  body('id_cliente')
    .notEmpty()
    .withMessage('Debe seleccionar el cliente comprador.')
    .isInt({ min: 1 })
    .withMessage('El identificador del cliente debe ser un entero positivo.'),
  body('id_vendedor')
    .notEmpty()
    .withMessage('Debe seleccionar el vendedor responsable.')
    .isInt({ min: 1 })
    .withMessage('El identificador del vendedor debe ser un entero positivo.'),
  body('fecha_venta')
    .trim()
    .notEmpty()
    .withMessage('La fecha de venta es obligatoria.')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('La fecha de venta debe tener el formato AAAA-MM-DD.')
    .isISO8601({ strict: true })
    .withMessage('La fecha de venta ingresada no es válida.'),
  body('precio_venta')
    .notEmpty()
    .withMessage('El precio de venta en USD es obligatorio.')
    .isFloat({ gt: 0, max: 9999999999.99 })
    .withMessage('El precio de venta debe ser un importe positivo mayor a 0 USD.'),
  body('observaciones')
    .optional({ values: 'falsy' })
    .isString()
    .withMessage('Las observaciones deben ser texto.')
    .isLength({ max: 2000 })
    .withMessage('Las observaciones no pueden superar 2000 caracteres.')
];

router.get('/', ventaController.getVentas);
router.get('/:id', idParamRule, validateRequest, ventaController.getVentaById);
router.post('/', ventaBodyRules, validateRequest, ventaController.createVenta);
router.put('/:id', [...idParamRule, ...ventaBodyRules], validateRequest, ventaController.updateVenta);
router.delete('/:id', idParamRule, validateRequest, ventaController.deleteVenta);

module.exports = router;

