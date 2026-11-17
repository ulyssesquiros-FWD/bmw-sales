const { verifyAccessToken } = require('../services/tokenService');
const usuarioModel = require('../models/usuarioModel');

function unauthorizedResponse(res) {
  return res.status(401).json({
    ok: false,
    success: false,
    error: 'No autorizado'
  });
}

/**
 * Middleware de autenticación JWT.
 * Verifica formato Bearer, firma HS256, issuer, audience, expiración y existencia activa en MySQL.
 * Deriva empresa_id y rol estrictamente desde el usuario verificado (nunca desde el frontend).
 */
async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || typeof authHeader !== 'string') {
    return unauthorizedResponse(res);
  }

  const parts = authHeader.trim().split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1]) {
    return unauthorizedResponse(res);
  }

  const token = parts[1];

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch {
    return unauthorizedResponse(res);
  }

  if (!decoded || typeof decoded.sub !== 'string' || !/^\d+$/.test(decoded.sub)) {
    return unauthorizedResponse(res);
  }

  const userId = Number(decoded.sub);
  if (!Number.isSafeInteger(userId) || userId <= 0) {
    return unauthorizedResponse(res);
  }

  try {
    const usuario = await usuarioModel.findPublicById(userId);
    if (!usuario) {
      return unauthorizedResponse(res);
    }

    const empresaId = Number(usuario.id_empresa || decoded.empresa_id || 1);
    const rol = usuario.rol || decoded.rol || 'admin';

    req.user = {
      id_usuario: usuario.id_usuario,
      nombre: usuario.nombre,
      correo: usuario.correo,
      id_empresa: empresaId,
      empresa_id: empresaId,
      rol,
      empresa_nombre: usuario.empresa_nombre || 'BMW Premium Motors Corporativo',
      id_plan: Number(usuario.id_plan || 2),
      plan_nombre: usuario.plan_nombre || 'Pro',
      max_documentos: Number(usuario.max_documentos || 500),
      max_preguntas_mes: Number(usuario.max_preguntas_mes || 10000),
      fecha_creacion: usuario.fecha_creacion
    };
    req.empresaId = empresaId;

    return next();
  } catch (dbError) {
    return next(dbError);
  }
}

module.exports = authMiddleware;
