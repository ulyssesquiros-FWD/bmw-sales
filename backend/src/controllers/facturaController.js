const facturaModel = require('../models/facturaModel');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const listarFacturas = asyncHandler(async (req, res) => {
  const { estado } = req.query;
  const list = await facturaModel.findAll({ estado });
  return res.status(200).json({ ok: true, count: list.length, data: list });
});

const obtenerFacturaPorId = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const factura = await facturaModel.findById(id);
  if (!factura) throw new AppError('Comprobante fiscal no encontrado.', 404);
  return res.status(200).json({ ok: true, data: factura });
});

const emitirFactura = asyncHandler(async (req, res) => {
  const nueva = await facturaModel.create(req.body);
  return res.status(201).json({ ok: true, message: 'Factura CFDI emitida y timbrada exitosamente.', data: nueva });
});

module.exports = { listarFacturas, obtenerFacturaPorId, emitirFactura };

