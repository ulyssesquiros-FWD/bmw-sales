const { pool } = require('../config/db');

async function findAll() {
  const [rows] = await pool.execute(`
    SELECT 
      e.*,
      cli.nombre AS cliente_nombre,
      cli.apellidos AS cliente_apellidos,
      cli.correo AS cliente_correo
    FROM encuestas_satisfaccion e
    INNER JOIN clientes cli ON e.id_cliente = cli.id_cliente
    ORDER BY e.id_encuesta DESC
  `);
  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute(`
    SELECT 
      e.*,
      cli.nombre AS cliente_nombre,
      cli.apellidos AS cliente_apellidos
    FROM encuestas_satisfaccion e
    INNER JOIN clientes cli ON e.id_cliente = cli.id_cliente
    WHERE e.id_encuesta = ?
  `, [id]);
  return rows[0] || null;
}

async function create(data) {
  const [result] = await pool.execute(`
    INSERT INTO encuestas_satisfaccion (id_cliente, id_venta, id_mantenimiento, tipo_experiencia, puntuacion_general, puntuacion_asesor, recomienda_concesionario, comentarios_cliente, fecha_encuesta)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    data.id_cliente, data.id_venta || null, data.id_mantenimiento || null,
    data.tipo_experiencia, data.puntuacion_general, data.puntuacion_asesor,
    data.recomienda_concesionario !== undefined ? data.recomienda_concesionario : true,
    data.comentarios_cliente || null, data.fecha_encuesta
  ]);
  return findById(result.insertId);
}

module.exports = { findAll, findById, create };
