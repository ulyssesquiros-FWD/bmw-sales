const campanaMarketingModel = require('../models/campanaMarketingModel');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const listarCampanas = asyncHandler(async (req, res) => {
  const list = await campanaMarketingModel.findAll();
  return res.status(200).json({ ok: true, count: list.length, data: list });
});

const obtenerCampanaPorId = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const c = await campanaMarketingModel.findById(id);
  if (!c) throw new AppError('Campaña de marketing no encontrada.', 404);
  return res.status(200).json({ ok: true, data: c });
});

const crearCampana = asyncHandler(async (req, res) => {
  const nueva = await campanaMarketingModel.create(req.body);
  return res.status(201).json({ ok: true, message: 'Campaña BMW registrada exitosamente.', data: nueva });
});

module.exports = { listarCampanas, obtenerCampanaPorId, crearCampana };
