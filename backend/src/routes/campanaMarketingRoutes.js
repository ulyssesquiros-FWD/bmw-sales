const express = require('express');
const { body, param } = require('express-validator');
const campanaMarketingController = require('../controllers/campanaMarketingController');
const { validateRequest } = require('../middleware/validateRequest');

const router = express.Router();

const validarCampana = [
  body('nombre').trim().notEmpty().withMessage('El nombre de la campaña es obligatorio.'),
  body('tipo_evento').trim().notEmpty().withMessage('El tipo de evento es obligatorio.'),
  body('presupuesto_usd').isFloat({ min: 0 }).withMessage('Presupuesto inválido.'),
  body('fecha_inicio').isISO8601().withMessage('Fecha de inicio inválida.'),
  body('fecha_fin').isISO8601().withMessage('Fecha de fin inválida.'),
  validateRequest
];

router.get('/', campanaMarketingController.listarCampanas);
router.get('/:id', param('id').isInt().withMessage('ID inválido.'), validateRequest, campanaMarketingController.obtenerCampanaPorId);
router.post('/', validarCampana, campanaMarketingController.crearCampana);

module.exports = router;
