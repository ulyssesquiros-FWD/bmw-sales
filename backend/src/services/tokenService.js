const jwt = require('jsonwebtoken');

const JWT_ALGORITHM = 'HS256';
const JWT_ISSUER = 'bmw-premium-motors-api';
const JWT_AUDIENCE = 'bmw-premium-motors-client';
const MIN_SECRET_LENGTH = 32;

const INSECURE_PLACEHOLDERS = new Set([
  'CLAVE_SECRETA_GENERADA',
  'secret',
  'changeme',
  'jwt_secret',
  'default_secret'
]);

/**
 * Valida que JWT_SECRET exista en el entorno y cumpla con entropía mínima.
 * Nunca utiliza secretos por defecto codificados en el código fuente.
 */
function validateJwtConfig() {
  const secret = process.env.JWT_SECRET;

  if (!secret || typeof secret !== 'string' || secret.trim().length === 0) {
    const err = new Error(
      'Configuración crítica faltante: JWT_SECRET no está definido en backend/.env.'
    );
    err.code = 'JWT_SECRET_MISSING';
    throw err;
  }

  const trimmed = secret.trim();
  if (trimmed.length < MIN_SECRET_LENGTH || INSECURE_PLACEHOLDERS.has(trimmed)) {
    const err = new Error(
      `Configuración insegura: JWT_SECRET debe ser una clave aleatoria de al menos ${MIN_SECRET_LENGTH} caracteres.`
    );
    err.code = 'JWT_SECRET_WEAK';
    throw err;
  }

  return {
    secret: trimmed,
    expiresIn: (process.env.JWT_EXPIRES_IN || '1h').trim()
  };
}

/**
 * Genera un Access Token JWT firmado con HS256 conteniendo únicamente claims mínimos (sub, iss, aud, iat, exp).
 */
function generateAccessToken(idUsuario) {
  const { secret, expiresIn } = validateJwtConfig();

  const token = jwt.sign({}, secret, {
    algorithm: JWT_ALGORITHM,
    expiresIn,
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    subject: String(idUsuario)
  });

  return {
    token,
    expiresIn
  };
}

/**
 * Verifica criptográficamente firma, algoritmo HS256, issuer, audience y expiración del JWT.
 */
function verifyAccessToken(token) {
  const { secret } = validateJwtConfig();

  return jwt.verify(token, secret, {
    algorithms: [JWT_ALGORITHM],
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE
  });
}

module.exports = {
  JWT_ALGORITHM,
  JWT_ISSUER,
  JWT_AUDIENCE,
  validateJwtConfig,
  generateAccessToken,
  verifyAccessToken
};

