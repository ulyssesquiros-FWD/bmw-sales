const seguroModel = require('../models/seguroModel');
const vehiculoModel = require('../models/vehiculoModel');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const listarSeguros = asyncHandler(async (req, res) => {
  const { estado } = req.query;
  const list = await seguroModel.findAll({ estado });
  return res.status(200).json({
    ok: true,
    count: list.length,
    data: list
  });
});

const obtenerSeguroPorId = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const s = await seguroModel.findById(id);
  if (!s) {
    throw new AppError('La póliza de seguro solicitada no existe.', 404);
  }
  return res.status(200).json({
    ok: true,
    data: s
  });
});

const crearSeguro = asyncHandler(async (req, res) => {
  const veh = await vehiculoModel.findById(req.body.id_vehiculo);
  if (!veh) {
    throw new AppError('El vehículo seleccionado no existe en inventario.', 400);
  }

  const nuevo = await seguroModel.create(req.body);
  return res.status(201).json({
    ok: true,
    message: 'Póliza BMW Protection registrada exitosamente.',
    data: nuevo
  });
});

const actualizarSeguro = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const existente = await seguroModel.findById(id);
  if (!existente) {
    throw new AppError('La póliza de seguro solicitada no existe.', 404);
  }
  const actualizado = await seguroModel.update(id, req.body);
  return res.status(200).json({
    ok: true,
    message: 'Póliza de seguro actualizada exitosamente.',
    data: actualizado
  });
});

const eliminarSeguro = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const eliminado = await seguroModel.remove(id);
  if (!eliminado) {
    throw new AppError('La póliza de seguro solicitada no existe.', 404);
  }
  return res.status(200).json({
    ok: true,
    message: 'Póliza de seguro eliminada exitosamente.'
  });
});

module.exports = {
  listarSeguros,
  obtenerSeguroPorId,
  crearSeguro,
  actualizarSeguro,
  eliminarSeguro
};

