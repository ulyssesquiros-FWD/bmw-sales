const express = require('express');
const { body, param } = require('express-validator');
const pedidoFabricaController = require('../controllers/pedidoFabricaController');
const { validateRequest } = require('../middleware/validateRequest');

const router = express.Router();

const validarPedido = [
  body('codigo_orden_fabrica').trim().notEmpty().withMessage('El código de orden es obligatorio.'),
  body('id_modelo').isInt({ min: 1 }).withMessage('El ID de modelo es obligatorio.'),
  body('id_sucursal_destino').isInt({ min: 1 }).withMessage('La sucursal de destino es obligatoria.'),
  body('planta_ensamblaje').trim().notEmpty().withMessage('La planta de ensamblaje es requerida.'),
  body('costo_importacion_usd').isFloat({ min: 0 }).withMessage('El costo debe ser positivo.'),
  validateRequest
];

router.get('/', pedidoFabricaController.listarPedidos);
router.get('/:id', param('id').isInt().withMessage('ID inválido.'), validateRequest, pedidoFabricaController.obtenerPedidoPorId);
router.post('/', validarPedido, pedidoFabricaController.crearPedido);
router.patch('/:id/estado', param('id').isInt().withMessage('ID inválido.'), validateRequest, pedidoFabricaController.actualizarEstadoPedido);

module.exports = router;

