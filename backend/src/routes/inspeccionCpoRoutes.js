const express = require('express');
const { body, param } = require('express-validator');
const inspeccionCpoController = require('../controllers/inspeccionCpoController');
const { validateRequest } = require('../middleware/validateRequest');

const router = express.Router();

const validarInspeccion = [
  body('folio_inspeccion').trim().notEmpty().withMessage('El folio de inspección es obligatorio.'),
  body('id_vehiculo').isInt({ min: 1 }).withMessage('El ID de vehículo es obligatorio.'),
  body('tecnico_certificador').trim().notEmpty().withMessage('El nombre del técnico certificador es obligatorio.'),
  body('fecha_inspeccion').isISO8601().withMessage('Fecha inválida.'),
  validateRequest
];

router.get('/', inspeccionCpoController.listarInspecciones);
router.get('/:id', param('id').isInt().withMessage('ID inválido.'), validateRequest, inspeccionCpoController.obtenerInspeccionPorId);
router.post('/', validarInspeccion, inspeccionCpoController.registrarInspeccion);

module.exports = router;

