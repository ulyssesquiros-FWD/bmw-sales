const { pool } = require('../config/db');

async function findAll({ categoria } = {}) {
  let query = `
    SELECT 
      r.*,
      p.razon_social AS proveedor_nombre,
      p.pais_origen AS proveedor_pais,
      s.nombre AS sucursal_nombre,
      s.ciudad AS sucursal_ciudad
    FROM almacen_refacciones r
    INNER JOIN proveedores p ON r.id_proveedor = p.id_proveedor
    INNER JOIN sucursales s ON r.id_sucursal = s.id_sucursal
  `;
  const params = [];
  if (categoria) {
    query += ' WHERE r.categoria_tecnica = ?';
    params.push(categoria);
  }
  query += ' ORDER BY r.id_refaccion DESC';
  const [rows] = await pool.execute(query, params);
  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute(`
    SELECT 
      r.*,
      p.razon_social AS proveedor_nombre,
      s.nombre AS sucursal_nombre
    FROM almacen_refacciones r
    INNER JOIN proveedores p ON r.id_proveedor = p.id_proveedor
    INNER JOIN sucursales s ON r.id_sucursal = s.id_sucursal
    WHERE r.id_refaccion = ?
  `, [id]);
  return rows[0] || null;
}

async function create(data) {
  const [result] = await pool.execute(`
    INSERT INTO almacen_refacciones (numero_parte_oem, nombre_pieza, id_proveedor, id_sucursal, ubicacion_bahia_estante, cantidad_stock, stock_minimo_alerta, costo_unitario_usd, categoria_tecnica)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    data.numero_parte_oem, data.nombre_pieza, data.id_proveedor,
    data.id_sucursal, data.ubicacion_bahia_estante, data.cantidad_stock || 0,
    data.stock_minimo_alerta || 5, data.costo_unitario_usd, data.categoria_tecnica
  ]);
  return findById(result.insertId);
}

module.exports = { findAll, findById, create };
