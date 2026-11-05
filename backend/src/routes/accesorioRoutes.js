const express = require('express');
const { body, param } = require('express-validator');
const accesorioController = require('../controllers/accesorioController');
const { validateRequest } = require('../middleware/validateRequest');

const router = express.Router();

const validarAccesorio = [
  body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio.'),
  body('categoria').trim().notEmpty().withMessage('La categoría es obligatoria.'),
  body('codigo_parte').trim().notEmpty().withMessage('El código de parte BMW es obligatorio.'),
  body('precio').isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo.'),
  validateRequest
];

router.get('/', accesorioController.listarAccesorios);
router.get('/:id', param('id').isInt().withMessage('ID inválido.'), validateRequest, accesorioController.obtenerAccesorioPorId);
router.post('/', validarAccesorio, accesorioController.crearAccesorio);
router.put('/:id', param('id').isInt().withMessage('ID inválido.'), validarAccesorio, accesorioController.actualizarAccesorio);
router.delete('/:id', param('id').isInt().withMessage('ID inválido.'), validateRequest, accesorioController.eliminarAccesorio);

module.exports = router;
