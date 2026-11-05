const vendedorModel = require('../models/vendedorModel');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

const getVendedores = asyncHandler(async (req, res) => {
  const { search = '' } = req.query;
  const vendedores = await vendedorModel.findAll(search);
  res.status(200).json({
    ok: true,
    data: vendedores
  });
});

const getVendedorById = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const vendedor = await vendedorModel.findById(id);
  if (!vendedor) {
    throw new AppError('El vendedor solicitado no existe.', 404);
  }
  res.status(200).json({
    ok: true,
    data: vendedor
  });
});

const createVendedor = asyncHandler(async (req, res) => {
  const { nombre, apellidos, telefono, correo, fecha_contratacion } = req.body;

  const existente = await vendedorModel.findByCorreo(correo.trim());
  if (existente) {
    throw new AppError(
      `Ya existe un vendedor registrado con el correo '${correo.trim().toLowerCase()}'.`,
      409
    );
  }

  const nuevoVendedor = await vendedorModel.create({
    nombre: nombre.trim(),
    apellidos: apellidos.trim(),
    telefono: telefono.trim(),
    correo: correo.trim().toLowerCase(),
    fecha_contratacion
  });

  res.status(201).json({
    ok: true,
    message: 'Asesor comercial registrado exitosamente.',
    data: nuevoVendedor
  });
});

const updateVendedor = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const vendedorActual = await vendedorModel.findById(id);
  if (!vendedorActual) {
    throw new AppError('El vendedor que intenta actualizar no existe.', 404);
  }

  const { nombre, apellidos, telefono, correo, fecha_contratacion } = req.body;

  const duplicado = await vendedorModel.findByCorreo(correo.trim(), id);
  if (duplicado) {
    throw new AppError(
      `Ya existe otro vendedor registrado con el correo '${correo.trim().toLowerCase()}'.`,
      409
    );
  }

  const vendedorActualizado = await vendedorModel.update(id, {
    nombre: nombre.trim(),
    apellidos: apellidos.trim(),
    telefono: telefono.trim(),
    correo: correo.trim().toLowerCase(),
    fecha_contratacion
  });

  res.status(200).json({
    ok: true,
    message: 'Asesor comercial actualizado exitosamente.',
    data: vendedorActualizado
  });
});

const deleteVendedor = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const vendedorActual = await vendedorModel.findById(id);
  if (!vendedorActual) {
    throw new AppError('El vendedor que intenta eliminar no existe.', 404);
  }

  const ventasAsociadas = await vendedorModel.countVentasByVendedor(id);
  if (ventasAsociadas > 0) {
    throw new AppError(
      `No se puede eliminar al vendedor '${vendedorActual.nombre} ${vendedorActual.apellidos}' porque tiene ${ventasAsociadas} venta(s) registrada(s) asociada(s).`,
      409
    );
  }

  await vendedorModel.remove(id);
  res.status(200).json({
    ok: true,
    message: `El asesor comercial '${vendedorActual.nombre} ${vendedorActual.apellidos}' fue eliminado correctamente.`
  });
});

module.exports = {
  getVendedores,
  getVendedorById,
  createVendedor,
  updateVendedor,
  deleteVendedor
};

