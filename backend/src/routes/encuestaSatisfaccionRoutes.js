const express = require('express');
const { body, param } = require('express-validator');
const encuestaSatisfaccionController = require('../controllers/encuestaSatisfaccionController');
const { validateRequest } = require('../middleware/validateRequest');

const router = express.Router();

const validarEncuesta = [
  body('id_cliente').isInt({ min: 1 }).withMessage('ID de cliente requerido.'),
  body('tipo_experiencia').trim().notEmpty().withMessage('Tipo de experiencia requerido.'),
  body('puntuacion_general').isInt({ min: 1, max: 10 }).withMessage('Puntuación general entre 1 y 10.'),
  body('puntuacion_asesor').isInt({ min: 1, max: 10 }).withMessage('Puntuación de asesor entre 1 y 10.'),
  body('fecha_encuesta').isISO8601().withMessage('Fecha inválida.'),
  validateRequest
];

router.get('/', encuestaSatisfaccionController.listarEncuestas);
router.get('/:id', param('id').isInt().withMessage('ID inválido.'), validateRequest, encuestaSatisfaccionController.obtenerEncuestaPorId);
router.post('/', validarEncuesta, encuestaSatisfaccionController.registrarEncuesta);

module.exports = router;
