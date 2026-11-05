class AppError extends Error {
  constructor(message, statusCode = 500, errors = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

function translateMysqlError(err) {
  if (!err || !err.code) return null;

  if (err.code === 'ER_DUP_ENTRY') {
    const msg = err.message || '';
    if (msg.includes('uq_modelos_nombre') || msg.includes('modelos.nombre')) {
      return new AppError('Ya existe un modelo BMW registrado con ese nombre.', 409);
    }
    if (msg.includes('uq_vehiculos_vin') || msg.includes('vehiculos.vin')) {
      return new AppError('Ya existe un vehículo registrado con ese número VIN.', 409);
    }
    if (msg.includes('uq_clientes_identificacion') || msg.includes('clientes.identificacion')) {
      return new AppError('Ya existe un cliente registrado con ese número de identificación.', 409);
    }
    if (msg.includes('uq_vendedores_correo') || msg.includes('vendedores.correo')) {
      return new AppError('Ya existe un vendedor registrado con ese correo electrónico.', 409);
    }
    if (msg.includes('uq_usuarios_correo') || msg.includes('usuarios.correo')) {
      return new AppError('El correo electrónico ingresado ya está registrado.', 400);
    }
    if (msg.includes('uq_ventas_vehiculo') || msg.includes('ventas.id_vehiculo')) {
      return new AppError('Este vehículo ya cuenta con una venta registrada.', 409);
    }
    return new AppError('Ya existe un registro con los mismos datos únicos.', 409);
  }

  if (err.code === 'ER_ROW_IS_REFERENCED' || err.code === 'ER_ROW_IS_REFERENCED_2') {
    return new AppError(
      'No se puede eliminar el registro porque tiene otros registros asociados que dependen de él.',
      409
    );
  }

  if (err.code === 'ER_NO_REFERENCED_ROW' || err.code === 'ER_NO_REFERENCED_ROW_2') {
    return new AppError(
      'Uno de los registros relacionados (clave foránea) seleccionados no existe.',
      400
    );
  }

  if (err.code === 'ER_CHECK_CONSTRAINT_VIOLATED' || err.code === 'ER_DATA_TOO_LONG' || err.code === 'WARN_DATA_TRUNCATED') {
    return new AppError('Los datos enviados no cumplen el formato o las restricciones requeridas.', 400);
  }

  if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ER_BAD_DB_ERROR') {
    return new AppError(
      'No hay conexión activa con la base de datos MySQL o las tablas no han sido inicializadas.',
      500
    );
  }

  return null;
}

function notFoundHandler(req, res) {
  res.status(404).json({
    ok: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
}

function errorHandler(err, req, res, next) {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      ok: false,
      message: 'El cuerpo de la solicitud contiene un formato JSON inválido.'
    });
  }

  const mysqlTranslated = translateMysqlError(err);
  const handledError = mysqlTranslated || err;

  const statusCode = handledError.statusCode || 500;
  const message =
    statusCode === 500 && !(handledError instanceof AppError)
      ? 'Error interno del servidor al procesar la solicitud.'
      : handledError.message;

  if (statusCode >= 500) {
    console.error(`[ERROR ${statusCode}] ${req.method} ${req.originalUrl}:`, err.code || err.name, err.message);
  }

  const responsePayload = {
    ok: false,
    message
  };

  if (handledError.errors) {
    responsePayload.errors = handledError.errors;
  }

  return res.status(statusCode).json(responsePayload);
}

module.exports = {
  AppError,
  asyncHandler,
  notFoundHandler,
  errorHandler
};

