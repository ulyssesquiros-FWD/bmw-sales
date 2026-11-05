const garantiaModel = require('../models/garantiaModel');
const vehiculoModel = require('../models/vehiculoModel');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const listarGarantias = asyncHandler(async (req, res) => {
  const { estado } = req.query;
  const garantias = await garantiaModel.findAll({ estado });
  return res.status(200).json({
    ok: true,
    count: garantias.length,
    data: garantias
  });
});

const obtenerGarantiaPorId = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const g = await garantiaModel.findById(id);
  if (!g) {
    throw new AppError('La póliza de garantía solicitada no existe.', 404);
  }
  return res.status(200).json({
    ok: true,
    data: g
  });
});

const crearGarantia = asyncHandler(async (req, res) => {
  const veh = await vehiculoModel.findById(req.body.id_vehiculo);
  if (!veh) {
    throw new AppError('El vehículo seleccionado no existe en inventario.', 400);
  }

  const nueva = await garantiaModel.create(req.body);
  return res.status(201).json({
    ok: true,
    message: 'Garantía BMW Premium Selection registrada exitosamente.',
    data: nueva
  });
});

const actualizarGarantia = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const existente = await garantiaModel.findById(id);
  if (!existente) {
    throw new AppError('La póliza de garantía solicitada no existe.', 404);
  }
  const actualizada = await garantiaModel.update(id, req.body);
  return res.status(200).json({
    ok: true,
    message: 'Garantía actualizada exitosamente.',
    data: actualizada
  });
});

const eliminarGarantia = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const eliminada = await garantiaModel.remove(id);
  if (!eliminada) {
    throw new AppError('La póliza de garantía solicitada no existe.', 404);
  }
  return res.status(200).json({
    ok: true,
    message: 'Garantía eliminada exitosamente.'
  });
});

module.exports = {
  listarGarantias,
  obtenerGarantiaPorId,
  crearGarantia,
  actualizarGarantia,
  eliminarGarantia
};

