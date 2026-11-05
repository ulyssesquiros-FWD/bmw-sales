const { verifyAccessToken } = require('../services/tokenService');
const usuarioModel = require('../models/usuarioModel');

function unauthorizedResponse(res) {
  return res.status(401).json({
    error: 'No autorizado'
  });
}

/**
 * Middleware de autenticación JWT.
 * Verifica formato Bearer, firma HS256, issuer, audience, expiración y existencia activa en MySQL.
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
    // No exponer detalles internos del token ni del error criptográfico
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

    req.user = {
      id_usuario: usuario.id_usuario,
      nombre: usuario.nombre,
      correo: usuario.correo,
      fecha_creacion: usuario.fecha_creacion
    };

    return next();
  } catch (dbError) {
    return next(dbError);
  }
}

module.exports = authMiddleware;
