const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

/**
 * Obtiene una clave simétrica de exactamente 32 bytes a partir de TOKEN_ENCRYPTION_KEY en .env.
 * Si es hexadecimal de 64 caracteres se usa directo; si es passphrase se deriva con SHA-256.
 */
function getEncryptionKeyBuffer() {
  const raw = (process.env.TOKEN_ENCRYPTION_KEY || '').trim();
  if (!raw) {
    throw new Error('Configuración faltante: TOKEN_ENCRYPTION_KEY no está definida en backend/.env');
  }
  if (/^[0-9a-fA-F]{64}$/.test(raw)) {
    return Buffer.from(raw, 'hex');
  }
  return crypto.createHash('sha256').update(raw, 'utf8').digest();
}

function isTokenEncryptionConfigured() {
  return Boolean((process.env.TOKEN_ENCRYPTION_KEY || '').trim());
}

/**
 * Cifra un token sensible con AES-256-GCM generando un IV aleatorio de 12 bytes por operación.
 * Formato persistido: "<ivHex>:<authTagHex>:<cipherHex>"
 */
function encryptToken(plainText) {
  if (plainText === null || plainText === undefined || String(plainText) === '') {
    return null;
  }
  const key = getEncryptionKeyBuffer();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(String(plainText), 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Descifra un payload generado por encryptToken verificando integridad vía GCM AuthTag.
 */
function decryptToken(cipherPayload) {
  if (!cipherPayload || typeof cipherPayload !== 'string') {
    return null;
  }
  const parts = cipherPayload.split(':');
  if (parts.length !== 3) {
    throw new Error('Formato de token cifrado inválido.');
  }
  const [ivHex, authTagHex, encryptedHex] = parts;
  const key = getEncryptionKeyBuffer();
  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, 'hex')),
    decipher.final()
  ]);
  return decrypted.toString('utf8');
}

module.exports = {
  ALGORITHM,
  isTokenEncryptionConfigured,
  encryptToken,
  decryptToken
};
