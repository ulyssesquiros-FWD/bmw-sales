const financiamientoModel = require('../models/financiamientoModel');
const ventaModel = require('../models/ventaModel');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const listarFinanciamientos = asyncHandler(async (req, res) => {
  const { estado } = req.query;
  const list = await financiamientoModel.findAll({ estado });
  return res.status(200).json({
    ok: true,
    count: list.length,
    data: list
  });
});

const obtenerFinanciamientoPorId = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const f = await financiamientoModel.findById(id);
  if (!f) {
    throw new AppError('El plan de financiamiento solicitado no existe.', 404);
  }
  return res.status(200).json({
    ok: true,
    data: f
  });
});

const crearFinanciamiento = asyncHandler(async (req, res) => {
  const venta = await ventaModel.findById(req.body.id_venta);
  if (!venta) {
    throw new AppError('La operación de venta asociada no existe.', 400);
  }

  const nuevo = await financiamientoModel.create(req.body);
  return res.status(201).json({
    ok: true,
    message: 'Plan de financiamiento BMW Financial Services aprobado y registrado.',
    data: nuevo
  });
});

const actualizarFinanciamiento = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const existente = await financiamientoModel.findById(id);
  if (!existente) {
    throw new AppError('El plan de financiamiento solicitado no existe.', 404);
  }
  const actualizado = await financiamientoModel.update(id, req.body);
  return res.status(200).json({
    ok: true,
    message: 'Plan de financiamiento actualizado exitosamente.',
    data: actualizado
  });
});

const eliminarFinanciamiento = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const eliminado = await financiamientoModel.remove(id);
  if (!eliminado) {
    throw new AppError('El plan de financiamiento solicitado no existe.', 404);
  }
  return res.status(200).json({
    ok: true,
    message: 'Plan de financiamiento cancelado/eliminado exitosamente.'
  });
});

module.exports = {
  listarFinanciamientos,
  obtenerFinanciamientoPorId,
  crearFinanciamiento,
  actualizarFinanciamiento,
  eliminarFinanciamiento
};

