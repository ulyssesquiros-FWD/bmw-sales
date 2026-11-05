const { pool } = require('../config/db');

async function findAll({ estado = '' } = {}) {
  let query = `
    SELECT p.*, 
           v.vin, v.version, mdl.nombre AS modelo_nombre,
           c.nombre AS cliente_nombre, c.apellidos AS cliente_apellidos, c.telefono AS cliente_telefono,
           vend.nombre AS vendedor_nombre, vend.apellidos AS vendedor_apellidos
    FROM pruebas_manejo p
    INNER JOIN vehiculos v ON p.id_vehiculo = v.id_vehiculo
    INNER JOIN modelos mdl ON v.id_modelo = mdl.id_modelo
    INNER JOIN clientes c ON p.id_cliente = c.id_cliente
    INNER JOIN vendedores vend ON p.id_vendedor = vend.id_vendedor
  `;
  const params = [];

  if (estado) {
    query += ' WHERE p.estado = ?';
    params.push(estado);
  }

  query += ' ORDER BY p.fecha_prueba DESC';
  const [rows] = await pool.execute(query, params);
  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute(
    `SELECT p.*, 
            v.vin, v.version, mdl.nombre AS modelo_nombre,
            c.nombre AS cliente_nombre, c.apellidos AS cliente_apellidos,
            vend.nombre AS vendedor_nombre, vend.apellidos AS vendedor_apellidos
     FROM pruebas_manejo p
     INNER JOIN vehiculos v ON p.id_vehiculo = v.id_vehiculo
     INNER JOIN modelos mdl ON v.id_modelo = mdl.id_modelo
     INNER JOIN clientes c ON p.id_cliente = c.id_cliente
     INNER JOIN vendedores vend ON p.id_vendedor = vend.id_vendedor
     WHERE p.id_prueba = ?`,
    [Number(id)]
  );
  return rows[0] || null;
}

async function create({ id_vehiculo, id_cliente, id_vendedor, fecha_prueba, duracion_minutos, estado, comentarios }) {
  const [result] = await pool.execute(
    `INSERT INTO pruebas_manejo (id_vehiculo, id_cliente, id_vendedor, fecha_prueba, duracion_minutos, estado, comentarios)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      Number(id_vehiculo),
      Number(id_cliente),
      Number(id_vendedor),
      fecha_prueba,
      Number(duracion_minutos) || 45,
      estado || 'Agendada',
      comentarios || null
    ]
  );
  return findById(result.insertId);
}

async function update(id, { id_vehiculo, id_cliente, id_vendedor, fecha_prueba, duracion_minutos, estado, comentarios }) {
  await pool.execute(
    `UPDATE pruebas_manejo
     SET id_vehiculo = ?, id_cliente = ?, id_vendedor = ?, fecha_prueba = ?, duracion_minutos = ?, estado = ?, comentarios = ?
     WHERE id_prueba = ?`,
    [
      Number(id_vehiculo),
      Number(id_cliente),
      Number(id_vendedor),
      fecha_prueba,
      Number(duracion_minutos) || 45,
      estado || 'Agendada',
      comentarios || null,
      Number(id)
    ]
  );
  return findById(id);
}

async function remove(id) {
  const [result] = await pool.execute('DELETE FROM pruebas_manejo WHERE id_prueba = ?', [Number(id)]);
  return result.affectedRows > 0;
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove
};
