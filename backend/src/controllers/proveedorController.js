const proveedorModel = require('../models/proveedorModel');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const listarProveedores = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const proveedores = await proveedorModel.findAll({ search });
  return res.status(200).json({
    ok: true,
    count: proveedores.length,
    data: proveedores
  });
});

const obtenerProveedorPorId = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const prov = await proveedorModel.findById(id);
  if (!prov) {
    throw new AppError('El proveedor solicitado no existe.', 404);
  }
  return res.status(200).json({
    ok: true,
    data: prov
  });
});

const crearProveedor = asyncHandler(async (req, res) => {
  const nuevo = await proveedorModel.create(req.body);
  return res.status(201).json({
    ok: true,
    message: 'Proveedor BMW registrado exitosamente.',
    data: nuevo
  });
});

const actualizarProveedor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const existente = await proveedorModel.findById(id);
  if (!existente) {
    throw new AppError('El proveedor solicitado no existe.', 404);
  }
  const actualizado = await proveedorModel.update(id, req.body);
  return res.status(200).json({
    ok: true,
    message: 'Proveedor actualizado exitosamente.',
    data: actualizado
  });
});

const eliminarProveedor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const eliminado = await proveedorModel.remove(id);
  if (!eliminado) {
    throw new AppError('El proveedor solicitado no existe.', 404);
  }
  return res.status(200).json({
    ok: true,
    message: 'Proveedor eliminado exitosamente.'
  });
});

module.exports = {
  listarProveedores,
  obtenerProveedorPorId,
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor
};
