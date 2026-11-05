const vehiculoModel = require('../models/vehiculoModel');
const modeloModel = require('../models/modeloModel');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

const getVehiculos = asyncHandler(async (req, res) => {
  const { id_modelo, estado, search } = req.query;
  const vehiculos = await vehiculoModel.findAll({ id_modelo, estado, search });
  res.status(200).json({
    ok: true,
    data: vehiculos
  });
});

const getVehiculoById = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const vehiculo = await vehiculoModel.findById(id);
  if (!vehiculo) {
    throw new AppError('El vehículo solicitado no existe.', 404);
  }
  res.status(200).json({
    ok: true,
    data: vehiculo
  });
});

const createVehiculo = asyncHandler(async (req, res) => {
  const {
    id_modelo,
    vin,
    version,
    anio,
    color,
    kilometraje,
    precio,
    estado = 'Disponible',
    imagen_url
  } = req.body;

  if (estado === 'Vendido') {
    throw new AppError(
      'No se permite marcar manualmente un vehículo como Vendido desde el inventario. El estado Vendido se asigna automáticamente al registrar una venta.',
      400
    );
  }

  const modeloExiste = await modeloModel.existsById(Number(id_modelo));
  if (!modeloExiste) {
    throw new AppError('El modelo BMW seleccionado no existe.', 400);
  }

  const vinNormalizado = vin.trim().toUpperCase();
  const vinDuplicado = await vehiculoModel.findByVin(vinNormalizado);
  if (vinDuplicado) {
    throw new AppError(`Ya existe un vehículo registrado con el VIN '${vinNormalizado}'.`, 409);
  }

  const nuevoVehiculo = await vehiculoModel.create({
    id_modelo: Number(id_modelo),
    vin: vinNormalizado,
    version: version.trim(),
    anio: Number(anio),
    color: color.trim(),
    kilometraje: Number(kilometraje),
    precio: Number(precio),
    estado,
    imagen_url: imagen_url && imagen_url.trim() ? imagen_url.trim() : null
  });

  res.status(201).json({
    ok: true,
    message: 'Vehículo registrado exitosamente en el inventario.',
    data: nuevoVehiculo
  });
});

const updateVehiculo = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const vehiculoActual = await vehiculoModel.findById(id);
  if (!vehiculoActual) {
    throw new AppError('El vehículo que intenta actualizar no existe.', 404);
  }

  const {
    id_modelo,
    vin,
    version,
    anio,
    color,
    kilometraje,
    precio,
    estado,
    imagen_url
  } = req.body;

  const estadoSolicitado = estado ?? vehiculoActual.estado;

  // Regla de negocio estricta: No permitir marcar manualmente como Vendido ni liberar manualmente un Vendido
  if (vehiculoActual.estado !== 'Vendido' && estadoSolicitado === 'Vendido') {
    throw new AppError(
      'No se permite marcar manualmente un vehículo como Vendido desde el módulo de vehículos. Registre una venta para cambiar su estado.',
      400
    );
  }

  if (vehiculoActual.estado === 'Vendido' && estadoSolicitado !== 'Vendido') {
    throw new AppError(
      'No se puede cambiar manualmente el estado de un vehículo Vendido. Para liberarlo a Disponible, elimine o actualice la venta asociada.',
      409
    );
  }

  const modeloExiste = await modeloModel.existsById(Number(id_modelo));
  if (!modeloExiste) {
    throw new AppError('El modelo BMW seleccionado no existe.', 400);
  }

  const vinNormalizado = vin.trim().toUpperCase();
  const vinDuplicado = await vehiculoModel.findByVin(vinNormalizado, id);
  if (vinDuplicado) {
    throw new AppError(`Ya existe otro vehículo registrado con el VIN '${vinNormalizado}'.`, 409);
  }

  const vehiculoActualizado = await vehiculoModel.update(id, {
    id_modelo: Number(id_modelo),
    vin: vinNormalizado,
    version: version.trim(),
    anio: Number(anio),
    color: color.trim(),
    kilometraje: Number(kilometraje),
    precio: Number(precio),
    estado: estadoSolicitado,
    imagen_url: imagen_url && imagen_url.trim() ? imagen_url.trim() : null
  });

  res.status(200).json({
    ok: true,
    message: 'Vehículo actualizado exitosamente.',
    data: vehiculoActualizado
  });
});

const deleteVehiculo = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const vehiculoActual = await vehiculoModel.findById(id);
  if (!vehiculoActual) {
    throw new AppError('El vehículo que intenta eliminar no existe.', 404);
  }

  const ventasAsociadas = await vehiculoModel.countVentasByVehiculo(id);
  if (ventasAsociadas > 0 || vehiculoActual.estado === 'Vendido') {
    throw new AppError(
      `No se puede eliminar el vehículo ${vehiculoActual.modelo_nombre} ${vehiculoActual.version} (VIN: ${vehiculoActual.vin}) porque tiene una venta registrada asociada.`,
      409
    );
  }

  await vehiculoModel.remove(id);
  res.status(200).json({
    ok: true,
    message: `El vehículo con VIN ${vehiculoActual.vin} fue eliminado correctamente.`
  });
});

module.exports = {
  getVehiculos,
  getVehiculoById,
  createVehiculo,
  updateVehiculo,
  deleteVehiculo
};

