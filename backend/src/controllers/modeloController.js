const modeloModel = require('../models/modeloModel');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

const getModelos = asyncHandler(async (req, res) => {
  const { search = '' } = req.query;
  const modelos = await modeloModel.findAll(search);
  res.status(200).json({
    ok: true,
    data: modelos
  });
});

const getModeloById = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const modelo = await modeloModel.findById(id);
  if (!modelo) {
    throw new AppError('El modelo BMW solicitado no existe.', 404);
  }
  res.status(200).json({
    ok: true,
    data: modelo
  });
});

const createModelo = asyncHandler(async (req, res) => {
  const { nombre, tipo_carroceria, combustible, transmision, descripcion } = req.body;

  const existente = await modeloModel.findByNombre(nombre.trim());
  if (existente) {
    throw new AppError(`Ya existe un modelo BMW registrado con el nombre '${nombre.trim()}'.`, 409);
  }

  const nuevoModelo = await modeloModel.create({
    nombre: nombre.trim(),
    tipo_carroceria: tipo_carroceria.trim(),
    combustible: combustible.trim(),
    transmision: transmision.trim(),
    descripcion: descripcion ? descripcion.trim() : null
  });

  res.status(201).json({
    ok: true,
    message: 'Modelo BMW creado exitosamente.',
    data: nuevoModelo
  });
});

const updateModelo = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const modeloActual = await modeloModel.findById(id);
  if (!modeloActual) {
    throw new AppError('El modelo BMW que intenta actualizar no existe.', 404);
  }

  const { nombre, tipo_carroceria, combustible, transmision, descripcion } = req.body;

  const duplicado = await modeloModel.findByNombre(nombre.trim(), id);
  if (duplicado) {
    throw new AppError(`Ya existe otro modelo BMW registrado con el nombre '${nombre.trim()}'.`, 409);
  }

  const modeloActualizado = await modeloModel.update(id, {
    nombre: nombre.trim(),
    tipo_carroceria: tipo_carroceria.trim(),
    combustible: combustible.trim(),
    transmision: transmision.trim(),
    descripcion: descripcion ? descripcion.trim() : null
  });

  res.status(200).json({
    ok: true,
    message: 'Modelo BMW actualizado exitosamente.',
    data: modeloActualizado
  });
});

const deleteModelo = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const modeloActual = await modeloModel.findById(id);
  if (!modeloActual) {
    throw new AppError('El modelo BMW que intenta eliminar no existe.', 404);
  }

  const vehiculosAsociados = await modeloModel.countVehiculosByModelo(id);
  if (vehiculosAsociados > 0) {
    throw new AppError(
      `No se puede eliminar el modelo '${modeloActual.nombre}' porque tiene ${vehiculosAsociados} vehículo(s) asociado(s). Elimine o reasigne primero los vehículos vinculados.`,
      409
    );
  }

  await modeloModel.remove(id);
  res.status(200).json({
    ok: true,
    message: `El modelo '${modeloActual.nombre}' fue eliminado correctamente.`
  });
});

module.exports = {
  getModelos,
  getModeloById,
  createModelo,
  updateModelo,
  deleteModelo
};

