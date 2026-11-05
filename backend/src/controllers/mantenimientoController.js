const mantenimientoModel = require('../models/mantenimientoModel');
const vehiculoModel = require('../models/vehiculoModel');
const clienteModel = require('../models/clienteModel');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const listarMantenimientos = asyncHandler(async (req, res) => {
  const { estado } = req.query;
  const list = await mantenimientoModel.findAll({ estado });
  return res.status(200).json({
    ok: true,
    count: list.length,
    data: list
  });
});

const obtenerMantenimientoPorId = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const m = await mantenimientoModel.findById(id);
  if (!m) {
    throw new AppError('El servicio de mantenimiento solicitado no existe.', 404);
  }
  return res.status(200).json({
    ok: true,
    data: m
  });
});

const crearMantenimiento = asyncHandler(async (req, res) => {
  const [veh, cli] = await Promise.all([
    vehiculoModel.findById(req.body.id_vehiculo),
    clienteModel.findById(req.body.id_cliente)
  ]);

  if (!veh) {
    throw new AppError('El vehículo seleccionado no existe en inventario.', 400);
  }
  if (!cli) {
    throw new AppError('El cliente seleccionado no existe.', 400);
  }

  const nuevo = await mantenimientoModel.create(req.body);
  return res.status(201).json({
    ok: true,
    message: 'Cita de servicio BMW registrada exitosamente.',
    data: nuevo
  });
});

const actualizarMantenimiento = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const existente = await mantenimientoModel.findById(id);
  if (!existente) {
    throw new AppError('El servicio de mantenimiento solicitado no existe.', 404);
  }
  const actualizado = await mantenimientoModel.update(id, req.body);
  return res.status(200).json({
    ok: true,
    message: 'Servicio de taller actualizado exitosamente.',
    data: actualizado
  });
});

const eliminarMantenimiento = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const eliminado = await mantenimientoModel.remove(id);
  if (!eliminado) {
    throw new AppError('El servicio de mantenimiento solicitado no existe.', 404);
  }
  return res.status(200).json({
    ok: true,
    message: 'Servicio de mantenimiento eliminado exitosamente.'
  });
});

module.exports = {
  listarMantenimientos,
  obtenerMantenimientoPorId,
  crearMantenimiento,
  actualizarMantenimiento,
  eliminarMantenimiento
};

