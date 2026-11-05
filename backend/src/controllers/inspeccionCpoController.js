const inspeccionCpoModel = require('../models/inspeccionCpoModel');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const listarInspecciones = asyncHandler(async (req, res) => {
  const list = await inspeccionCpoModel.findAll();
  return res.status(200).json({ ok: true, count: list.length, data: list });
});

const obtenerInspeccionPorId = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const insp = await inspeccionCpoModel.findById(id);
  if (!insp) throw new AppError('Inspección CPO no encontrada.', 404);
  return res.status(200).json({ ok: true, data: insp });
});

const registrarInspeccion = asyncHandler(async (req, res) => {
  const nueva = await inspeccionCpoModel.create(req.body);
  return res.status(201).json({ ok: true, message: 'Inspección técnica 110 puntos registrada con éxito.', data: nueva });
});

module.exports = { listarInspecciones, obtenerInspeccionPorId, registrarInspeccion };
