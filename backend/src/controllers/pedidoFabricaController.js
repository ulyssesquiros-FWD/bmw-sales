const pedidoFabricaModel = require('../models/pedidoFabricaModel');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const listarPedidos = asyncHandler(async (req, res) => {
  const { estado } = req.query;
  const list = await pedidoFabricaModel.findAll({ estado });
  return res.status(200).json({ ok: true, count: list.length, data: list });
});

const obtenerPedidoPorId = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const p = await pedidoFabricaModel.findById(id);
  if (!p) throw new AppError('Orden de producción a planta no encontrada.', 404);
  return res.status(200).json({ ok: true, data: p });
});

const crearPedido = asyncHandler(async (req, res) => {
  const nuevo = await pedidoFabricaModel.create(req.body);
  return res.status(201).json({ ok: true, message: 'Pedido a planta BMW Group transmitido con éxito.', data: nuevo });
});

const actualizarEstadoPedido = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { estado_produccion } = req.body;
  if (!estado_produccion) throw new AppError('El nuevo estado de producción es obligatorio.', 400);
  const actualizado = await pedidoFabricaModel.updateEstado(id, estado_produccion);
  return res.status(200).json({ ok: true, message: 'Estado de fabricación actualizado.', data: actualizado });
});

module.exports = {
  listarPedidos,
  obtenerPedidoPorId,
  crearPedido,
  actualizarEstadoPedido
};

