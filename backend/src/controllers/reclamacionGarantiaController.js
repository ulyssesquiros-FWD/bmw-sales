const reclamacionGarantiaModel = require('../models/reclamacionGarantiaModel');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const listarReclamaciones = asyncHandler(async (req, res) => {
  const { estado } = req.query;
  const list = await reclamacionGarantiaModel.findAll({ estado });
  return res.status(200).json({ ok: true, count: list.length, data: list });
});

const obtenerReclamacionPorId = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const r = await reclamacionGarantiaModel.findById(id);
  if (!r) throw new AppError('Reclamación de garantía no encontrada.', 404);
  return res.status(200).json({ ok: true, data: r });
});

const registrarReclamacion = asyncHandler(async (req, res) => {
  const nueva = await reclamacionGarantiaModel.create(req.body);
  return res.status(201).json({ ok: true, message: 'Reclamación de garantía enviada a BMW AG con éxito.', data: nueva });
});

module.exports = { listarReclamaciones, obtenerReclamacionPorId, registrarReclamacion };
