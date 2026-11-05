const express = require('express');
const { body, param } = require('express-validator');
const pruebaManejoController = require('../controllers/pruebaManejoController');
const { validateRequest } = require('../middleware/validateRequest');

const router = express.Router();

const validarPrueba = [
  body('id_vehiculo').isInt({ min: 1 }).withMessage('El ID de vehículo es obligatorio.'),
  body('id_cliente').isInt({ min: 1 }).withMessage('El ID de cliente es obligatorio.'),
  body('id_vendedor').isInt({ min: 1 }).withMessage('El ID de asesor comercial es obligatorio.'),
  body('fecha_prueba').isISO8601().withMessage('La fecha de la prueba debe ser válida.'),
  validateRequest
];

router.get('/', pruebaManejoController.listarPruebas);
router.get('/:id', param('id').isInt().withMessage('ID inválido.'), validateRequest, pruebaManejoController.obtenerPruebaPorId);
router.post('/', validarPrueba, pruebaManejoController.crearPrueba);
router.put('/:id', param('id').isInt().withMessage('ID inválido.'), validarPrueba, pruebaManejoController.actualizarPrueba);
router.delete('/:id', param('id').isInt().withMessage('ID inválido.'), validateRequest, pruebaManejoController.eliminarPrueba);

module.exports = router;

