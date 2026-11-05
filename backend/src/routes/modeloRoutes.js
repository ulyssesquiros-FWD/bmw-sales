const express = require('express');
const { body, param } = require('express-validator');
const modeloController = require('../controllers/modeloController');
const { validateRequest } = require('../middleware/validateRequest');

const router = express.Router();

const idParamRule = [
  param('id').isInt({ min: 1 }).withMessage('El identificador del modelo debe ser un entero positivo.')
];

const modeloBodyRules = [
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El nombre del modelo es obligatorio.')
    .isLength({ max: 100 })
    .withMessage('El nombre del modelo no puede superar 100 caracteres.'),
  body('tipo_carroceria')
    .trim()
    .notEmpty()
    .withMessage('El tipo de carrocería es obligatorio.')
    .isLength({ max: 50 })
    .withMessage('El tipo de carrocería no puede superar 50 caracteres.'),
  body('combustible')
    .trim()
    .notEmpty()
    .withMessage('El tipo de combustible es obligatorio.')
    .isLength({ max: 50 })
    .withMessage('El tipo de combustible no puede superar 50 caracteres.'),
  body('transmision')
    .trim()
    .notEmpty()
    .withMessage('El tipo de transmisión es obligatorio.')
    .isLength({ max: 50 })
    .withMessage('El tipo de transmisión no puede superar 50 caracteres.'),
  body('descripcion')
    .optional({ values: 'falsy' })
    .isString()
    .withMessage('La descripción debe ser texto.')
    .isLength({ max: 2000 })
    .withMessage('La descripción no puede superar 2000 caracteres.')
];

router.get('/', modeloController.getModelos);
router.get('/:id', idParamRule, validateRequest, modeloController.getModeloById);
router.post('/', modeloBodyRules, validateRequest, modeloController.createModelo);
router.put('/:id', [...idParamRule, ...modeloBodyRules], validateRequest, modeloController.updateModelo);
router.delete('/:id', idParamRule, validateRequest, modeloController.deleteModelo);

module.exports = router;

