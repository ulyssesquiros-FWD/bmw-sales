const { pool } = require('../config/db');

const PUBLIC_USER_SELECT = `
  SELECT
    u.id_usuario,
    u.nombre,
    u.correo,
    u.id_empresa,
    u.rol,
    u.fecha_creacion,
    e.nombre AS empresa_nombre,
    e.slug AS empresa_slug,
    e.id_plan,
    p.nombre AS plan_nombre,
    p.max_documentos,
    p.max_preguntas_mes
  FROM usuarios u
  LEFT JOIN empresas e ON e.id_empresa = u.id_empresa
  LEFT JOIN planes p ON p.id_plan = e.id_plan
`;

/**
 * Obtiene únicamente los campos públicos del usuario por su ID,
 * junto con su empresa y límites de plan. Jamás selecciona password_hash.
 */
async function findPublicById(idUsuario) {
  const [rows] = await pool.execute(
    `${PUBLIC_USER_SELECT}
     WHERE u.id_usuario = ?`,
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
    `SELECT
       u.id_usuario,
       u.nombre,
       u.correo,
       u.password_hash,
       u.id_empresa,
       u.rol,
       u.fecha_creacion,
       e.nombre AS empresa_nombre,
       e.slug AS empresa_slug,
       e.id_plan,
       p.nombre AS plan_nombre,
       p.max_documentos,
       p.max_preguntas_mes
     FROM usuarios u
     LEFT JOIN empresas e ON e.id_empresa = u.id_empresa
     LEFT JOIN planes p ON p.id_plan = e.id_plan
     WHERE u.correo = ?`,
    [correo.toLowerCase()]
  );
  return rows[0] || null;
}

/**
 * Lista los usuarios pertenecientes a una empresa específica.
 */
async function findByEmpresa(idEmpresa) {
  const [rows] = await pool.execute(
    `SELECT id_usuario, id_empresa, nombre, correo, rol, fecha_creacion
     FROM usuarios
     WHERE id_empresa = ?
     ORDER BY fecha_creacion DESC`,
    [Number(idEmpresa)]
  );
  return rows;
}

/**
 * Registra un nuevo usuario almacenando únicamente su password_hash, id_empresa y rol.
 */
async function create({ nombre, correo, password_hash, id_empresa = 1, rol = 'admin' }) {
  const correoNormalizado = correo.toLowerCase();
  const rolSeguro = rol === 'colaborador' ? 'colaborador' : 'admin';
  const empresaId = Number(id_empresa) || 1;

  const [result] = await pool.execute(
    `INSERT INTO usuarios (id_empresa, nombre, correo, password_hash, rol)
     VALUES (?, ?, ?, ?, ?)`,
    [empresaId, nombre, correoNormalizado, password_hash, rolSeguro]
  );

  return findPublicById(result.insertId);
}

/**
 * Elimina un colaborador dentro de la misma empresa (evita eliminarse a sí mismo).
 */
async function deleteByIdAndEmpresa(idUsuario, idEmpresa) {
  const [result] = await pool.execute(
    'DELETE FROM usuarios WHERE id_usuario = ? AND id_empresa = ?',
    [Number(idUsuario), Number(idEmpresa)]
  );
  return result.affectedRows > 0;
}

module.exports = {
  findPublicById,
  existsByCorreo,
  findByCorreoForAuth,
  findByEmpresa,
  create,
  deleteByIdAndEmpresa
};
