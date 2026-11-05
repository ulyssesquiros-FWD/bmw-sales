const { pool } = require('../config/db');

async function findAll({ estado } = {}) {
  let query = `
    SELECT 
      c.*,
      cli.nombre AS cliente_nombre,
      cli.apellidos AS cliente_apellidos,
      cli.correo AS cliente_correo,
      v.version AS vehiculo_version,
      v.vin,
      mdl.nombre AS modelo_nombre,
      vend.nombre AS vendedor_nombre,
      vend.apellidos AS vendedor_apellidos
    FROM cotizaciones c
    INNER JOIN clientes cli ON c.id_cliente = cli.id_cliente
    INNER JOIN vehiculos v ON c.id_vehiculo = v.id_vehiculo
    INNER JOIN modelos mdl ON v.id_modelo = mdl.id_modelo
    INNER JOIN vendedores vend ON c.id_vendedor = vend.id_vendedor
  `;
  const params = [];
  if (estado) {
    query += ' WHERE c.estado = ?';
    params.push(estado);
  }
  query += ' ORDER BY c.id_cotizacion DESC';
  const [rows] = await pool.execute(query, params);
  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute(`
    SELECT 
      c.*,
      cli.nombre AS cliente_nombre,
      cli.apellidos AS cliente_apellidos,
      v.version AS vehiculo_version,
      v.vin,
      mdl.nombre AS modelo_nombre,
      vend.nombre AS vendedor_nombre,
      vend.apellidos AS vendedor_apellidos
    FROM cotizaciones c
    INNER JOIN clientes cli ON c.id_cliente = cli.id_cliente
    INNER JOIN vehiculos v ON c.id_vehiculo = v.id_vehiculo
    INNER JOIN modelos mdl ON v.id_modelo = mdl.id_modelo
    INNER JOIN vendedores vend ON c.id_vendedor = vend.id_vendedor
    WHERE c.id_cotizacion = ?
  `, [id]);
  return rows[0] || null;
}

async function create(data) {
  const [result] = await pool.execute(`
    INSERT INTO cotizaciones (folio, id_cliente, id_vehiculo, id_vendedor, precio_lista, descuento, precio_final, propuesta_enganche, plazo_meses_sugerido, fecha_emision, fecha_vencimiento, estado, notas)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    data.folio, data.id_cliente, data.id_vehiculo, data.id_vendedor,
    data.precio_lista, data.descuento || 0, data.precio_final,
    data.propuesta_enganche || 0, data.plazo_meses_sugerido || 36,
    data.fecha_emision, data.fecha_vencimiento, data.estado || 'Enviada',
    data.notas || null
  ]);
  return findById(result.insertId);
}

async function update(id, data) {
  await pool.execute(`
    UPDATE cotizaciones 
    SET descuento = ?, precio_final = ?, propuesta_enganche = ?, plazo_meses_sugerido = ?, fecha_vencimiento = ?, estado = ?, notas = ?
    WHERE id_cotizacion = ?
  `, [
    data.descuento, data.precio_final, data.propuesta_enganche,
    data.plazo_meses_sugerido, data.fecha_vencimiento, data.estado,
    data.notas, id
  ]);
  return findById(id);
}

async function remove(id) {
  const [result] = await pool.execute('DELETE FROM cotizaciones WHERE id_cotizacion = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = { findAll, findById, create, update, remove };

