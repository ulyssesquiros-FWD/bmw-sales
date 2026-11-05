const pruebaManejoModel = require('../models/pruebaManejoModel');
const vehiculoModel = require('../models/vehiculoModel');
const clienteModel = require('../models/clienteModel');
const vendedorModel = require('../models/vendedorModel');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const listarPruebas = asyncHandler(async (req, res) => {
  const { estado } = req.query;
  const list = await pruebaManejoModel.findAll({ estado });
  return res.status(200).json({
    ok: true,
    count: list.length,
    data: list
  });
});

const obtenerPruebaPorId = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const p = await pruebaManejoModel.findById(id);
  if (!p) {
    throw new AppError('La prueba de manejo solicitada no existe.', 404);
  }
  return res.status(200).json({
    ok: true,
    data: p
  });
});

const crearPrueba = asyncHandler(async (req, res) => {
  const [veh, cli, vend] = await Promise.all([
    vehiculoModel.findById(req.body.id_vehiculo),
    clienteModel.findById(req.body.id_cliente),
    vendedorModel.findById(req.body.id_vendedor)
  ]);

  if (!veh) {
    throw new AppError('El vehículo seleccionado no existe.', 400);
  }
  if (!cli) {
    throw new AppError('El cliente seleccionado no existe.', 400);
  }
  if (!vend) {
    throw new AppError('El asesor comercial seleccionado no existe.', 400);
  }

  const nueva = await pruebaManejoModel.create(req.body);
  return res.status(201).json({
    ok: true,
    message: 'Prueba de manejo BMW Driving Experience agendada exitosamente.',
    data: nueva
  });
});

const actualizarPrueba = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const existente = await pruebaManejoModel.findById(id);
  if (!existente) {
    throw new AppError('La prueba de manejo solicitada no existe.', 404);
  }
  const actualizada = await pruebaManejoModel.update(id, req.body);
  return res.status(200).json({
    ok: true,
    message: 'Prueba de manejo actualizada exitosamente.',
    data: actualizada
  });
});

const eliminarPrueba = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const eliminada = await pruebaManejoModel.remove(id);
  if (!eliminada) {
    throw new AppError('La prueba de manejo solicitada no existe.', 404);
  }
  return res.status(200).json({
    ok: true,
    message: 'Prueba de manejo eliminada exitosamente.'
  });
});

module.exports = {
  listarPruebas,
  obtenerPruebaPorId,
  crearPrueba,
  actualizarPrueba,
  eliminarPrueba
};

