const { pool } = require('../config/db');

async function findAll({ estado = '' } = {}) {
  let query = `
    SELECT g.*, v.vin, v.version, v.color, m.nombre AS modelo_nombre
    FROM garantias g
    INNER JOIN vehiculos v ON g.id_vehiculo = v.id_vehiculo
    INNER JOIN modelos m ON v.id_modelo = m.id_modelo
  `;
  const params = [];

  if (estado) {
    query += ' WHERE g.estado = ?';
    params.push(estado);
  }

  query += ' ORDER BY g.id_garantia DESC';
  const [rows] = await pool.execute(query, params);
  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute(
    `SELECT g.*, v.vin, v.version, m.nombre AS modelo_nombre
     FROM garantias g
     INNER JOIN vehiculos v ON g.id_vehiculo = v.id_vehiculo
     INNER JOIN modelos m ON v.id_modelo = m.id_modelo
     WHERE g.id_garantia = ?`,
    [Number(id)]
  );
  return rows[0] || null;
}

async function create({ id_vehiculo, tipo_garantia, cobertura_meses, kilometraje_limite, estado, fecha_inicio }) {
  const [result] = await pool.execute(
    `INSERT INTO garantias (id_vehiculo, tipo_garantia, cobertura_meses, kilometraje_limite, estado, fecha_inicio)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      Number(id_vehiculo),
      tipo_garantia,
      Number(cobertura_meses),
      Number(kilometraje_limite),
      estado || 'Activa',
      fecha_inicio
    ]
  );
  return findById(result.insertId);
}

async function update(id, { id_vehiculo, tipo_garantia, cobertura_meses, kilometraje_limite, estado, fecha_inicio }) {
  await pool.execute(
    `UPDATE garantias
     SET id_vehiculo = ?, tipo_garantia = ?, cobertura_meses = ?, kilometraje_limite = ?, estado = ?, fecha_inicio = ?
     WHERE id_garantia = ?`,
    [
      Number(id_vehiculo),
      tipo_garantia,
      Number(cobertura_meses),
      Number(kilometraje_limite),
      estado || 'Activa',
      fecha_inicio,
      Number(id)
    ]
  );
  return findById(id);
}

async function remove(id) {
  const [result] = await pool.execute('DELETE FROM garantias WHERE id_garantia = ?', [Number(id)]);
  return result.affectedRows > 0;
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove
};
