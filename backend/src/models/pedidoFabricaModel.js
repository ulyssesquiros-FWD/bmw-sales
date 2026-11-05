const { pool } = require('../config/db');

async function findAll({ estado } = {}) {
  let query = `
    SELECT 
      p.*,
      mdl.nombre AS modelo_nombre,
      s.nombre AS sucursal_nombre,
      s.ciudad AS sucursal_ciudad,
      cli.nombre AS cliente_nombre,
      cli.apellidos AS cliente_apellidos
    FROM pedidos_fabrica p
    INNER JOIN modelos mdl ON p.id_modelo = mdl.id_modelo
    INNER JOIN sucursales s ON p.id_sucursal_destino = s.id_sucursal
    LEFT JOIN clientes cli ON p.id_cliente = cli.id_cliente
  `;
  const params = [];
  if (estado) {
    query += ' WHERE p.estado_produccion = ?';
    params.push(estado);
  }
  query += ' ORDER BY p.id_pedido_fabrica DESC';
  const [rows] = await pool.execute(query, params);
  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute(`
    SELECT 
      p.*,
      mdl.nombre AS modelo_nombre,
      s.nombre AS sucursal_nombre,
      cli.nombre AS cliente_nombre,
      cli.apellidos AS cliente_apellidos
    FROM pedidos_fabrica p
    INNER JOIN modelos mdl ON p.id_modelo = mdl.id_modelo
    INNER JOIN sucursales s ON p.id_sucursal_destino = s.id_sucursal
    LEFT JOIN clientes cli ON p.id_cliente = cli.id_cliente
    WHERE p.id_pedido_fabrica = ?
  `, [id]);
  return rows[0] || null;
}

async function create(data) {
  const [result] = await pool.execute(`
    INSERT INTO pedidos_fabrica (codigo_orden_fabrica, id_modelo, id_sucursal_destino, id_cliente, planta_ensamblaje, vin_asignado, especificaciones_individual, fecha_orden, fecha_estimada_entrega, estado_produccion, costo_importacion_usd)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    data.codigo_orden_fabrica, data.id_modelo, data.id_sucursal_destino,
    data.id_cliente || null, data.planta_ensamblaje, data.vin_asignado || null,
    data.especificaciones_individual || null, data.fecha_orden,
    data.fecha_estimada_entrega, data.estado_produccion || 'En Cola de Producción',
    data.costo_importacion_usd
  ]);
  return findById(result.insertId);
}

async function updateEstado(id, nuevoEstado) {
  await pool.execute('UPDATE pedidos_fabrica SET estado_produccion = ? WHERE id_pedido_fabrica = ?', [nuevoEstado, id]);
  return findById(id);
}

module.exports = { findAll, findById, create, updateEstado };

