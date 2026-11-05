const { pool } = require('../config/db');

/**
 * Obtiene únicamente los campos públicos del usuario por su ID.
 * Jamás selecciona ni devuelve password_hash.
 */
async function findPublicById(idUsuario) {
  const [rows] = await pool.execute(
    `SELECT id_usuario, nombre, correo, fecha_creacion
     FROM usuarios
     WHERE id_usuario = ?`,
    [Number(idUsuario)]
  );
  return rows[0] || null;
}

/**
 * Comprueba si ya existe un usuario registrado con ese correo (en minúsculas).
 */
async function existsByCorreo(correo) {
  const [rows] = await pool.execute(
    'SELECT id_usuario FROM usuarios WHERE correo = ?',
    [correo.toLowerCase()]
  );
  return rows.length > 0;
}

/**
 * Uso exclusivo del proceso de login para verificar credenciales con bcrypt.compare().
 */
async function findByCorreoForAuth(correo) {
  const [rows] = await pool.execute(
    `SELECT id_usuario, nombre, correo, password_hash, fecha_creacion
     FROM usuarios
     WHERE correo = ?`,
    [correo.toLowerCase()]
  );
  return rows[0] || null;
}

/**
 * Registra un nuevo usuario almacenando únicamente su password_hash y retorna datos públicos.
 */
async function create({ nombre, correo, password_hash }) {
  const correoNormalizado = correo.toLowerCase();
  const [result] = await pool.execute(
    `INSERT INTO usuarios (nombre, correo, password_hash)
     VALUES (?, ?, ?)`,
    [nombre, correoNormalizado, password_hash]
  );

  return {
    id_usuario: result.insertId,
    nombre,
    correo: correoNormalizado
  };
}

module.exports = {
  findPublicById,
  existsByCorreo,
  findByCorreoForAuth,
  create
};

