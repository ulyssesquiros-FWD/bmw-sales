const { pool } = require('../config/db');

async function findAll({ estado } = {}) {
  let query = `
    SELECT 
      r.*,
      g.tipo_garantia,
      v.version AS vehiculo_version,
      v.vin
    FROM reclamaciones_garantia r
    INNER JOIN garantias g ON r.id_garantia = g.id_garantia
    INNER JOIN vehiculos v ON r.id_vehiculo = v.id_vehiculo
  `;
  const params = [];
  if (estado) {
    query += ' WHERE r.estado = ?';
    params.push(estado);
  }
  query += ' ORDER BY r.id_reclamacion DESC';
  const [rows] = await pool.execute(query, params);
  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute(`
    SELECT 
      r.*,
      g.tipo_garantia,
      v.version AS vehiculo_version,
      v.vin
    FROM reclamaciones_garantia r
    INNER JOIN garantias g ON r.id_garantia = g.id_garantia
    INNER JOIN vehiculos v ON r.id_vehiculo = v.id_vehiculo
    WHERE r.id_reclamacion = ?
  `, [id]);
  return rows[0] || null;
}

async function create(data) {
  const [result] = await pool.execute(`
    INSERT INTO reclamaciones_garantia (codigo_reclamacion, id_garantia, id_vehiculo, id_mantenimiento, codigo_falla_ista, descripcion_falla, monto_reclamado_usd, monto_autorizado_usd, estado, fecha_reclamacion)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    data.codigo_reclamacion, data.id_garantia, data.id_vehiculo,
    data.id_mantenimiento || null, data.codigo_falla_ista,
    data.descripcion_falla, data.monto_reclamado_usd,
    data.monto_autorizado_usd || 0, data.estado || 'Enviada a Planta',
    data.fecha_reclamacion
  ]);
  return findById(result.insertId);
}

module.exports = { findAll, findById, create };

