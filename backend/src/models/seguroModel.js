const { pool } = require('../config/db');

async function findAll({ estado = '' } = {}) {
  let query = `
    SELECT s.*, v.vin, v.version, v.color, m.nombre AS modelo_nombre
    FROM seguros s
    INNER JOIN vehiculos v ON s.id_vehiculo = v.id_vehiculo
    INNER JOIN modelos m ON v.id_modelo = m.id_modelo
  `;
  const params = [];

  if (estado) {
    query += ' WHERE s.estado = ?';
    params.push(estado);
  }

  query += ' ORDER BY s.fecha_vencimiento ASC';
  const [rows] = await pool.execute(query, params);
  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute(
    `SELECT s.*, v.vin, v.version, m.nombre AS modelo_nombre
     FROM seguros s
     INNER JOIN vehiculos v ON s.id_vehiculo = v.id_vehiculo
     INNER JOIN modelos m ON v.id_modelo = m.id_modelo
     WHERE s.id_seguro = ?`,
    [Number(id)]
  );
  return rows[0] || null;
}

async function create({ id_vehiculo, aseguradora, numero_poliza, cobertura, prima_anual, fecha_vencimiento, estado }) {
  const [result] = await pool.execute(
    `INSERT INTO seguros (id_vehiculo, aseguradora, numero_poliza, cobertura, prima_anual, fecha_vencimiento, estado)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      Number(id_vehiculo),
      aseguradora,
      numero_poliza,
      cobertura,
      Number(prima_anual),
      fecha_vencimiento,
      estado || 'Vigente'
    ]
  );
  return findById(result.insertId);
}

async function update(id, { id_vehiculo, aseguradora, numero_poliza, cobertura, prima_anual, fecha_vencimiento, estado }) {
  await pool.execute(
    `UPDATE seguros
     SET id_vehiculo = ?, aseguradora = ?, numero_poliza = ?, cobertura = ?, prima_anual = ?, fecha_vencimiento = ?, estado = ?
     WHERE id_seguro = ?`,
    [
      Number(id_vehiculo),
      aseguradora,
      numero_poliza,
      cobertura,
      Number(prima_anual),
      fecha_vencimiento,
      estado || 'Vigente',
      Number(id)
    ]
  );
  return findById(id);
}

async function remove(id) {
  const [result] = await pool.execute('DELETE FROM seguros WHERE id_seguro = ?', [Number(id)]);
  return result.affectedRows > 0;
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove
};
