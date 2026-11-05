const { pool } = require('../config/db');

async function findAll() {
  const [rows] = await pool.execute(`
    SELECT 
      c.*,
      s.nombre AS sucursal_nombre,
      s.ciudad AS sucursal_ciudad
    FROM campanas_marketing c
    LEFT JOIN sucursales s ON c.id_sucursal = s.id_sucursal
    ORDER BY c.fecha_inicio DESC
  `);
  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute(`
    SELECT 
      c.*,
      s.nombre AS sucursal_nombre,
      s.ciudad AS sucursal_ciudad
    FROM campanas_marketing c
    LEFT JOIN sucursales s ON c.id_sucursal = s.id_sucursal
    WHERE c.id_campana = ?
  `, [id]);
  return rows[0] || null;
}

async function create(data) {
  const [result] = await pool.execute(`
    INSERT INTO campanas_marketing (nombre, tipo_evento, id_sucursal, presupuesto_usd, fecha_inicio, fecha_fin, leads_generados, ventas_atribuidas, estado, objetivo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    data.nombre, data.tipo_evento, data.id_sucursal || null,
    data.presupuesto_usd, data.fecha_inicio, data.fecha_fin,
    data.leads_generados || 0, data.ventas_atribuidas || 0,
    data.estado || 'Planificada', data.objetivo || null
  ]);
  return findById(result.insertId);
}

module.exports = { findAll, findById, create };

