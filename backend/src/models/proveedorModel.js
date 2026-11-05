const { pool } = require('../config/db');

async function findAll({ search = '' } = {}) {
  let query = 'SELECT * FROM proveedores';
  const params = [];

  if (search) {
    query += ' WHERE razon_social LIKE ? OR contacto_nombre LIKE ? OR rfc_identificacion LIKE ?';
    params.push(`%${search.trim()}%`, `%${search.trim()}%`, `%${search.trim()}%`);
  }

  query += ' ORDER BY id_proveedor ASC';
  const [rows] = await pool.execute(query, params);
  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute('SELECT * FROM proveedores WHERE id_proveedor = ?', [Number(id)]);
  return rows[0] || null;
}

async function create({ razon_social, rfc_identificacion, contacto_nombre, correo, telefono, pais_origen }) {
  const [result] = await pool.execute(
    `INSERT INTO proveedores (razon_social, rfc_identificacion, contacto_nombre, correo, telefono, pais_origen)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [razon_social, rfc_identificacion, contacto_nombre, correo, telefono, pais_origen || 'Alemania']
  );
  return findById(result.insertId);
}

async function update(id, { razon_social, rfc_identificacion, contacto_nombre, correo, telefono, pais_origen }) {
  await pool.execute(
    `UPDATE proveedores
     SET razon_social = ?, rfc_identificacion = ?, contacto_nombre = ?, correo = ?, telefono = ?, pais_origen = ?
     WHERE id_proveedor = ?`,
    [razon_social, rfc_identificacion, contacto_nombre, correo, telefono, pais_origen || 'Alemania', Number(id)]
  );
  return findById(id);
}

async function remove(id) {
  const [result] = await pool.execute('DELETE FROM proveedores WHERE id_proveedor = ?', [Number(id)]);
  return result.affectedRows > 0;
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove
};

