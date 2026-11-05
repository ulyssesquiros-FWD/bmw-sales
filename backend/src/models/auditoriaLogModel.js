const { pool } = require('../config/db');

async function findAll({ limit = 100, accion = '', entidad = '' } = {}) {
  let query = `
    SELECT l.*, u.nombre AS usuario_nombre, u.correo AS usuario_correo
    FROM auditoria_logs l
    LEFT JOIN usuarios u ON l.id_usuario = u.id_usuario
    WHERE 1=1
  `;
  const params = [];

  if (accion) {
    query += ' AND l.accion = ?';
    params.push(accion);
  }

  if (entidad) {
    query += ' AND l.entidad_afectada = ?';
    params.push(entidad);
  }

  query += ' ORDER BY l.fecha_creacion DESC LIMIT ?';
  params.push(Number(limit));

  const [rows] = await pool.execute(query, params);
  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute(
    `SELECT l.*, u.nombre AS usuario_nombre, u.correo AS usuario_correo
     FROM auditoria_logs l
     LEFT JOIN usuarios u ON l.id_usuario = u.id_usuario
     WHERE l.id_log = ?`,
    [Number(id)]
  );
  return rows[0] || null;
}

async function logEvent({ id_usuario = null, accion, entidad_afectada, id_registro = null, ip_origen = '127.0.0.1', detalle = null }) {
  const [result] = await pool.execute(
    `INSERT INTO auditoria_logs (id_usuario, accion, entidad_afectada, id_registro, ip_origen, detalle)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      id_usuario ? Number(id_usuario) : null,
      accion,
      entidad_afectada,
      id_registro ? String(id_registro) : null,
      ip_origen,
      detalle ? String(detalle) : null
    ]
  );
  return findById(result.insertId);
}

module.exports = {
  findAll,
  findById,
  logEvent
};

