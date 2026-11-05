const express = require('express');
const { body, param } = require('express-validator');
const facturaController = require('../controllers/facturaController');
const { validateRequest } = require('../middleware/validateRequest');

const router = express.Router();

const validarFactura = [
  body('numero_factura').trim().notEmpty().withMessage('El número de factura es obligatorio.'),
  body('folio_fiscal_uuid').trim().isUUID().withMessage('El folio fiscal UUID debe ser válido.'),
  body('id_cliente').isInt({ min: 1 }).withMessage('El ID de cliente es obligatorio.'),
  body('tipo_comprobante').trim().notEmpty().withMessage('Tipo de comprobante requerido.'),
  body('total').isFloat({ min: 1 }).withMessage('El total de la factura debe ser positivo.'),
  validateRequest
];

router.get('/', facturaController.listarFacturas);
router.get('/:id', param('id').isInt().withMessage('ID inválido.'), validateRequest, facturaController.obtenerFacturaPorId);
router.post('/', validarFactura, facturaController.emitirFactura);

module.exports = router;

