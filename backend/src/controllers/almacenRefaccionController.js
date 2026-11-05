const almacenRefaccionModel = require('../models/almacenRefaccionModel');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const listarRefacciones = asyncHandler(async (req, res) => {
  const { categoria } = req.query;
  const list = await almacenRefaccionModel.findAll({ categoria });
  return res.status(200).json({ ok: true, count: list.length, data: list });
});

const obtenerRefaccionPorId = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const r = await almacenRefaccionModel.findById(id);
  if (!r) throw new AppError('Pieza no encontrada en almacén.', 404);
  return res.status(200).json({ ok: true, data: r });
});

const registrarRefaccion = asyncHandler(async (req, res) => {
  const nueva = await almacenRefaccionModel.create(req.body);
  return res.status(201).json({ ok: true, message: 'Refacción registrada en inventario técnico.', data: nueva });
});

module.exports = { listarRefacciones, obtenerRefaccionPorId, registrarRefaccion };

