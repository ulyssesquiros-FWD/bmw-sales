const { pool } = require('../config/db');

async function findAll({ estado = '' } = {}) {
  let query = `
    SELECT m.*, 
           v.vin, v.version, mdl.nombre AS modelo_nombre,
           c.nombre AS cliente_nombre, c.apellidos AS cliente_apellidos, c.correo AS cliente_correo
    FROM mantenimientos m
    INNER JOIN vehiculos v ON m.id_vehiculo = v.id_vehiculo
    INNER JOIN modelos mdl ON v.id_modelo = mdl.id_modelo
    INNER JOIN clientes c ON m.id_cliente = c.id_cliente
  `;
  const params = [];

  if (estado) {
    query += ' WHERE m.estado = ?';
    params.push(estado);
  }

  query += ' ORDER BY m.fecha_servicio DESC';
  const [rows] = await pool.execute(query, params);
  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute(
    `SELECT m.*, 
            v.vin, v.version, mdl.nombre AS modelo_nombre,
            c.nombre AS cliente_nombre, c.apellidos AS cliente_apellidos
     FROM mantenimientos m
     INNER JOIN vehiculos v ON m.id_vehiculo = v.id_vehiculo
     INNER JOIN modelos mdl ON v.id_modelo = mdl.id_modelo
     INNER JOIN clientes c ON m.id_cliente = c.id_cliente
     WHERE m.id_mantenimiento = ?`,
    [Number(id)]
  );
  return rows[0] || null;
}

async function create({ id_vehiculo, id_cliente, tipo_servicio, costo, fecha_servicio, estado, notas }) {
  const [result] = await pool.execute(
    `INSERT INTO mantenimientos (id_vehiculo, id_cliente, tipo_servicio, costo, fecha_servicio, estado, notas)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      Number(id_vehiculo),
      Number(id_cliente),
      tipo_servicio,
      Number(costo),
      fecha_servicio,
      estado || 'Programado',
      notas || null
    ]
  );
  return findById(result.insertId);
}

async function update(id, { id_vehiculo, id_cliente, tipo_servicio, costo, fecha_servicio, estado, notas }) {
  await pool.execute(
    `UPDATE mantenimientos
     SET id_vehiculo = ?, id_cliente = ?, tipo_servicio = ?, costo = ?, fecha_servicio = ?, estado = ?, notas = ?
     WHERE id_mantenimiento = ?`,
    [
      Number(id_vehiculo),
      Number(id_cliente),
      tipo_servicio,
      Number(costo),
      fecha_servicio,
      estado || 'Programado',
      notas || null,
      Number(id)
    ]
  );
  return findById(id);
}

async function remove(id) {
  const [result] = await pool.execute('DELETE FROM mantenimientos WHERE id_mantenimiento = ?', [Number(id)]);
  return result.affectedRows > 0;
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove
};
