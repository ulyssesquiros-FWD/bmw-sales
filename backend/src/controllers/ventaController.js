const ventaModel = require('../models/ventaModel');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

const getVentas = asyncHandler(async (req, res) => {
  const { search = '' } = req.query;
  const ventas = await ventaModel.findAll(search);
  res.status(200).json({
    ok: true,
    data: ventas
  });
});

const getVentaById = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const venta = await ventaModel.findById(id);
  if (!venta) {
    throw new AppError('La venta solicitada no existe.', 404);
  }
  res.status(200).json({
    ok: true,
    data: venta
  });
});

const createVenta = asyncHandler(async (req, res) => {
  const { id_vehiculo, id_cliente, id_vendedor, fecha_venta, precio_venta, observaciones } =
    req.body;

  const nuevaVenta = await ventaModel.createWithTransaction({
    id_vehiculo: Number(id_vehiculo),
    id_cliente: Number(id_cliente),
    id_vendedor: Number(id_vendedor),
    fecha_venta,
    precio_venta: Number(precio_venta),
    observaciones: observaciones && observaciones.trim() ? observaciones.trim() : null
  });

  res.status(201).json({
    ok: true,
    message: 'Venta registrada exitosamente. El estado del vehículo pasó automáticamente a Vendido.',
    data: nuevaVenta
  });
});

const updateVenta = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { id_vehiculo, id_cliente, id_vendedor, fecha_venta, precio_venta, observaciones } =
    req.body;

  const ventaActualizada = await ventaModel.updateWithTransaction(id, {
    id_vehiculo: Number(id_vehiculo),
    id_cliente: Number(id_cliente),
    id_vendedor: Number(id_vendedor),
    fecha_venta,
    precio_venta: Number(precio_venta),
    observaciones: observaciones && observaciones.trim() ? observaciones.trim() : null
  });

  res.status(200).json({
    ok: true,
    message: 'Venta actualizada exitosamente y estados de vehículos sincronizados.',
    data: ventaActualizada
  });
});

const deleteVenta = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const resultado = await ventaModel.deleteWithTransaction(id);

  res.status(200).json({
    ok: true,
    message: 'Venta eliminada correctamente. El vehículo asociado ha vuelto a estado Disponible.',
    data: resultado
  });
});

module.exports = {
  getVentas,
  getVentaById,
  createVenta,
  updateVenta,
  deleteVenta
};

