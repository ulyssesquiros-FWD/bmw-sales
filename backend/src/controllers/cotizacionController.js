const cotizacionModel = require('../models/cotizacionModel');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const listarCotizaciones = asyncHandler(async (req, res) => {
  const { estado } = req.query;
  const list = await cotizacionModel.findAll({ estado });
  return res.status(200).json({ ok: true, count: list.length, data: list });
});

const obtenerCotizacionPorId = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const cot = await cotizacionModel.findById(id);
  if (!cot) throw new AppError('Cotización no encontrada.', 404);
  return res.status(200).json({ ok: true, data: cot });
});

const crearCotizacion = asyncHandler(async (req, res) => {
  const nueva = await cotizacionModel.create(req.body);
  return res.status(201).json({ ok: true, message: 'Cotización comercial generada exitosamente.', data: nueva });
});

const actualizarCotizacion = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const actualizada = await cotizacionModel.update(id, req.body);
  return res.status(200).json({ ok: true, message: 'Cotización actualizada.', data: actualizada });
});

const eliminarCotizacion = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await cotizacionModel.remove(id);
  return res.status(200).json({ ok: true, message: 'Cotización eliminada exitosamente.' });
});

module.exports = {
  listarCotizaciones,
  obtenerCotizacionPorId,
  crearCotizacion,
  actualizarCotizacion,
  eliminarCotizacion
};
