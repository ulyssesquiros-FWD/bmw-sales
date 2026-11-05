const encuestaSatisfaccionModel = require('../models/encuestaSatisfaccionModel');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const listarEncuestas = asyncHandler(async (req, res) => {
  const list = await encuestaSatisfaccionModel.findAll();
  return res.status(200).json({ ok: true, count: list.length, data: list });
});

const obtenerEncuestaPorId = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const e = await encuestaSatisfaccionModel.findById(id);
  if (!e) throw new AppError('Encuesta no encontrada.', 404);
  return res.status(200).json({ ok: true, data: e });
});

const registrarEncuesta = asyncHandler(async (req, res) => {
  const nueva = await encuestaSatisfaccionModel.create(req.body);
  return res.status(201).json({ ok: true, message: 'Encuesta CSI registrada exitosamente.', data: nueva });
});

module.exports = { listarEncuestas, obtenerEncuestaPorId, registrarEncuesta };
