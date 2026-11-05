const clienteModel = require('../models/clienteModel');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

const getClientes = asyncHandler(async (req, res) => {
  const { search = '' } = req.query;
  const clientes = await clienteModel.findAll(search);
  res.status(200).json({
    ok: true,
    data: clientes
  });
});

const getClienteById = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const cliente = await clienteModel.findById(id);
  if (!cliente) {
    throw new AppError('El cliente solicitado no existe.', 404);
  }
  res.status(200).json({
    ok: true,
    data: cliente
  });
});

const createCliente = asyncHandler(async (req, res) => {
  const { nombre, apellidos, identificacion, telefono, correo, direccion } = req.body;

  const existente = await clienteModel.findByIdentificacion(identificacion.trim());
  if (existente) {
    throw new AppError(
      `Ya existe un cliente registrado con la identificación '${identificacion.trim()}'.`,
      409
    );
  }

  const nuevoCliente = await clienteModel.create({
    nombre: nombre.trim(),
    apellidos: apellidos.trim(),
    identificacion: identificacion.trim(),
    telefono: telefono.trim(),
    correo: correo.trim().toLowerCase(),
    direccion: direccion && direccion.trim() ? direccion.trim() : null
  });

  res.status(201).json({
    ok: true,
    message: 'Cliente registrado exitosamente.',
    data: nuevoCliente
  });
});

const updateCliente = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const clienteActual = await clienteModel.findById(id);
  if (!clienteActual) {
    throw new AppError('El cliente que intenta actualizar no existe.', 404);
  }

  const { nombre, apellidos, identificacion, telefono, correo, direccion } = req.body;

  const duplicado = await clienteModel.findByIdentificacion(identificacion.trim(), id);
  if (duplicado) {
    throw new AppError(
      `Ya existe otro cliente registrado con la identificación '${identificacion.trim()}'.`,
      409
    );
  }

  const clienteActualizado = await clienteModel.update(id, {
    nombre: nombre.trim(),
    apellidos: apellidos.trim(),
    identificacion: identificacion.trim(),
    telefono: telefono.trim(),
    correo: correo.trim().toLowerCase(),
    direccion: direccion && direccion.trim() ? direccion.trim() : null
  });

  res.status(200).json({
    ok: true,
    message: 'Cliente actualizado exitosamente.',
    data: clienteActualizado
  });
});

const deleteCliente = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const clienteActual = await clienteModel.findById(id);
  if (!clienteActual) {
    throw new AppError('El cliente que intenta eliminar no existe.', 404);
  }

  const ventasAsociadas = await clienteModel.countVentasByCliente(id);
  if (ventasAsociadas > 0) {
    throw new AppError(
      `No se puede eliminar al cliente '${clienteActual.nombre} ${clienteActual.apellidos}' porque tiene ${ventasAsociadas} venta(s) registrada(s) asociada(s).`,
      409
    );
  }

  await clienteModel.remove(id);
  res.status(200).json({
    ok: true,
    message: `El cliente '${clienteActual.nombre} ${clienteActual.apellidos}' fue eliminado correctamente.`
  });
});

module.exports = {
  getClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente
};

