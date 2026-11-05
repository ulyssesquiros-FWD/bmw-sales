const { pool } = require('../config/db');

async function findAll({ search = '', limit = 50, offset = 0 } = {}) {
  let query = 'SELECT * FROM sucursales';
  const params = [];

  if (search && search.trim()) {
    query += ' WHERE nombre LIKE ? OR ciudad LIKE ?';
    params.push(`%${search.trim()}%`, `%${search.trim()}%`);
  }

  query += ' ORDER BY id_sucursal ASC LIMIT ? OFFSET ?';
  params.push(Number(limit), Number(offset));

  const [rows] = await pool.execute(query, params);
  return rows;
}

async function findById(idSucursal) {
  const [rows] = await pool.execute(
    'SELECT * FROM sucursales WHERE id_sucursal = ?',
    [Number(idSucursal)]
  );
  return rows[0] || null;
}

async function create({ nombre, ciudad, direccion, telefono, capacidad_vehiculos }) {
  const [result] = await pool.execute(
    `INSERT INTO sucursales (nombre, ciudad, direccion, telefono, capacidad_vehiculos)
     VALUES (?, ?, ?, ?, ?)`,
    [nombre, ciudad, direccion, telefono, Number(capacidad_vehiculos) || 50]
  );
  return findById(result.insertId);
}

async function update(idSucursal, { nombre, ciudad, direccion, telefono, capacidad_vehiculos }) {
  await pool.execute(
    `UPDATE sucursales
     SET nombre = ?, ciudad = ?, direccion = ?, telefono = ?, capacidad_vehiculos = ?
     WHERE id_sucursal = ?`,
    [nombre, ciudad, direccion, telefono, Number(capacidad_vehiculos) || 50, Number(idSucursal)]
  );
  return findById(idSucursal);
}

async function remove(idSucursal) {
  const [result] = await pool.execute(
    'DELETE FROM sucursales WHERE id_sucursal = ?',
    [Number(idSucursal)]
  );
  return result.affectedRows > 0;
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove
};
