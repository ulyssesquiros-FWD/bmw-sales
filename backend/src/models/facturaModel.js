const { pool } = require('../config/db');

async function findAll({ estado } = {}) {
  let query = `
    SELECT 
      f.*,
      cli.nombre AS cliente_nombre,
      cli.apellidos AS cliente_apellidos,
      cli.identificacion AS cliente_rfc,
      v.fecha_venta,
      veh.version AS vehiculo_version,
      veh.vin
    FROM facturas f
    INNER JOIN clientes cli ON f.id_cliente = cli.id_cliente
    LEFT JOIN ventas v ON f.id_venta = v.id_venta
    LEFT JOIN vehiculos veh ON v.id_vehiculo = veh.id_vehiculo
  `;
  const params = [];
  if (estado) {
    query += ' WHERE f.estado = ?';
    params.push(estado);
  }
  query += ' ORDER BY f.id_factura DESC';
  const [rows] = await pool.execute(query, params);
  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute(`
    SELECT 
      f.*,
      cli.nombre AS cliente_nombre,
      cli.apellidos AS cliente_apellidos,
      cli.identificacion AS cliente_rfc,
      cli.correo AS cliente_correo,
      cli.direccion AS cliente_direccion
    FROM facturas f
    INNER JOIN clientes cli ON f.id_cliente = cli.id_cliente
    WHERE f.id_factura = ?
  `, [id]);
  return rows[0] || null;
}

async function create(data) {
  const [result] = await pool.execute(`
    INSERT INTO facturas (numero_factura, folio_fiscal_uuid, id_venta, id_cliente, tipo_comprobante, subtotal, iva, total, metodo_pago, fecha_emision, estado)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    data.numero_factura, data.folio_fiscal_uuid, data.id_venta || null,
    data.id_cliente, data.tipo_comprobante, data.subtotal, data.iva,
    data.total, data.metodo_pago, data.fecha_emision, data.estado || 'Timbrada'
  ]);
  return findById(result.insertId);
}

module.exports = { findAll, findById, create };

