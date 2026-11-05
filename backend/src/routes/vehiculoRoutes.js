const express = require('express');
const { body, param, query } = require('express-validator');
const vehiculoController = require('../controllers/vehiculoController');
const { validateRequest } = require('../middleware/validateRequest');

const router = express.Router();

const idParamRule = [
  param('id').isInt({ min: 1 }).withMessage('El identificador del vehículo debe ser un entero positivo.')
];

const queryFilterRules = [
  query('id_modelo')
    .optional({ values: 'falsy' })
    .isInt({ min: 1 })
    .withMessage('El filtro de modelo debe ser un entero positivo.'),
  query('estado')
    .optional({ values: 'falsy' })
    .isIn(['Disponible', 'Reservado', 'Vendido'])
    .withMessage('El filtro de estado debe ser Disponible, Reservado o Vendido.')
];

const baseVehiculoRules = [
  body('id_modelo')
    .notEmpty()
    .withMessage('Debe seleccionar un modelo BMW.')
    .isInt({ min: 1 })
    .withMessage('El modelo seleccionado debe tener un ID válido.'),
  body('vin')
    .trim()
    .notEmpty()
    .withMessage('El número VIN es obligatorio.')
    .isLength({ min: 17, max: 17 })
    .withMessage('El número VIN debe contener exactamente 17 caracteres.')
    .matches(/^[A-Za-z0-9]{17}$/)
    .withMessage('El número VIN solo puede contener letras y números sin espacios (17 caracteres).'),
  body('version')
    .trim()
    .notEmpty()
    .withMessage('La versión del vehículo es obligatoria.')
    .isLength({ max: 100 })
    .withMessage('La versión no puede superar 100 caracteres.'),
  body('anio')
    .notEmpty()
    .withMessage('El año del vehículo es obligatorio.')
    .isInt({ min: 1950, max: 2100 })
    .withMessage('El año del vehículo debe ser un año válido de 4 dígitos (entre 1950 y 2100).'),
  body('color')
    .trim()
    .notEmpty()
    .withMessage('El color del vehículo es obligatorio.')
    .isLength({ max: 50 })
    .withMessage('El color no puede superar 50 caracteres.'),
  body('kilometraje')
    .notEmpty()
    .withMessage('El kilometraje es obligatorio.')
    .isInt({ min: 0, max: 4294967295 })
    .withMessage('El kilometraje debe ser un número entero mayor o igual a 0 (no se permiten valores negativos).'),
  body('precio')
    .notEmpty()
    .withMessage('El precio en USD es obligatorio.')
    .isFloat({ gt: 0, max: 9999999999.99 })
    .withMessage('El precio debe ser un importe positivo mayor a 0 USD.'),
  body('imagen_url')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 500 })
    .withMessage('La URL de la imagen no puede superar 500 caracteres.')
    .custom((val) => {
      if (val.startsWith('/vehicles/') || val.startsWith('/logos/')) {
        return true;
      }
      try {
        const parsed = new URL(val);
        if (['http:', 'https:'].includes(parsed.protocol)) {
          return true;
        }
      } catch {
        // continúa al error inferior
      }
      throw new Error(
        'La ruta de la imagen debe ser una URL válida (http:// o https://) o una ruta local de catálogo (/vehicles/...).'
      );
    })
];

const createEstadoRule = body('estado')
  .optional({ values: 'falsy' })
  .custom((val) => {
    if (val === 'Vendido') {
      throw new Error(
        'No se permite marcar manualmente un vehículo como Vendido. El estado Vendido se controla exclusivamente mediante las ventas.'
      );
    }
    if (!['Disponible', 'Reservado'].includes(val)) {
      throw new Error('El estado inicial del vehículo debe ser Disponible o Reservado.');
    }
    return true;
  });

const updateEstadoRule = body('estado')
  .optional({ values: 'falsy' })
  .isIn(['Disponible', 'Reservado', 'Vendido'])
  .withMessage('El estado proporcionado no es válido.');

router.get('/', queryFilterRules, validateRequest, vehiculoController.getVehiculos);
router.get('/:id', idParamRule, validateRequest, vehiculoController.getVehiculoById);
router.post(
  '/',
  [...baseVehiculoRules, createEstadoRule],
  validateRequest,
  vehiculoController.createVehiculo
);
router.put(
  '/:id',
  [...idParamRule, ...baseVehiculoRules, updateEstadoRule],
  validateRequest,
  vehiculoController.updateVehiculo
);
router.delete('/:id', idParamRule, validateRequest, vehiculoController.deleteVehiculo);

module.exports = router;

