const sucursalModel = require('../models/sucursalModel');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const listarSucursales = asyncHandler(async (req, res) => {
  const { search, limit, offset } = req.query;
  const sucursales = await sucursalModel.findAll({ search, limit, offset });
  return res.status(200).json({
    ok: true,
    count: sucursales.length,
    data: sucursales
  });
});

const obtenerSucursalPorId = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const sucursal = await sucursalModel.findById(id);
  if (!sucursal) {
    throw new AppError('La sucursal BMW solicitada no existe.', 404);
  }
  return res.status(200).json({
    ok: true,
    data: sucursal
  });
});

const crearSucursal = asyncHandler(async (req, res) => {
  const sucursal = await sucursalModel.create(req.body);
  return res.status(201).json({
    ok: true,
    message: 'Sucursal BMW registrada exitosamente.',
    data: sucursal
  });
});

const actualizarSucursal = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const existente = await sucursalModel.findById(id);
  if (!existente) {
    throw new AppError('La sucursal BMW solicitada no existe.', 404);
  }
  const actualizada = await sucursalModel.update(id, req.body);
  return res.status(200).json({
    ok: true,
    message: 'Sucursal BMW actualizada exitosamente.',
    data: actualizada
  });
});

const eliminarSucursal = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const eliminada = await sucursalModel.remove(id);
  if (!eliminada) {
    throw new AppError('La sucursal BMW solicitada no existe.', 404);
  }
  return res.status(200).json({
    ok: true,
    message: 'Sucursal BMW eliminada exitosamente.'
  });
});

module.exports = {
  listarSucursales,
  obtenerSucursalPorId,
  crearSucursal,
  actualizarSucursal,
  eliminarSucursal
};
