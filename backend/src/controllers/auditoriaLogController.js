const auditoriaLogModel = require('../models/auditoriaLogModel');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const listarLogs = asyncHandler(async (req, res) => {
  const { limit, accion, entidad } = req.query;
  const logs = await auditoriaLogModel.findAll({ limit, accion, entidad });
  return res.status(200).json({
    ok: true,
    count: logs.length,
    data: logs
  });
});

const obtenerLogPorId = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const log = await auditoriaLogModel.findById(id);
  if (!log) {
    throw new AppError('El registro de auditoría solicitado no existe.', 404);
  }
  return res.status(200).json({
    ok: true,
    data: log
  });
});

const registrarEvento = asyncHandler(async (req, res) => {
  const { accion, entidad_afectada, id_registro, detalle } = req.body;
  const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
  const id_usuario = req.user ? req.user.id_usuario : null;

  const nuevo = await auditoriaLogModel.logEvent({
    id_usuario,
    accion,
    entidad_afectada,
    id_registro,
    ip_origen: ip,
    detalle
  });

  return res.status(201).json({
    ok: true,
    message: 'Evento de auditoría registrado exitosamente.',
    data: nuevo
  });
});

module.exports = {
  listarLogs,
  obtenerLogPorId,
  registrarEvento
};
