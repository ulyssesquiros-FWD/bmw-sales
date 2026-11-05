const { pool } = require('../config/db');

async function findAll({ categoria = '', search = '' } = {}) {
  let query = 'SELECT * FROM accesorios WHERE 1=1';
  const params = [];

  if (categoria) {
    query += ' AND categoria = ?';
    params.push(categoria);
  }

  if (search) {
    query += ' AND (nombre LIKE ? OR codigo_parte LIKE ?)';
    params.push(`%${search.trim()}%`, `%${search.trim()}%`);
  }

  query += ' ORDER BY id_accesorio ASC';
  const [rows] = await pool.execute(query, params);
  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute(
    'SELECT * FROM accesorios WHERE id_accesorio = ?',
    [Number(id)]
  );
  return rows[0] || null;
}

async function create({ nombre, categoria, codigo_parte, precio, stock, descripcion }) {
  const [result] = await pool.execute(
    `INSERT INTO accesorios (nombre, categoria, codigo_parte, precio, stock, descripcion)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [nombre, categoria, codigo_parte, Number(precio), Number(stock) || 0, descripcion || null]
  );
  return findById(result.insertId);
}

async function update(id, { nombre, categoria, codigo_parte, precio, stock, descripcion }) {
  await pool.execute(
    `UPDATE accesorios
     SET nombre = ?, categoria = ?, codigo_parte = ?, precio = ?, stock = ?, descripcion = ?
     WHERE id_accesorio = ?`,
    [nombre, categoria, codigo_parte, Number(precio), Number(stock) || 0, descripcion || null, Number(id)]
  );
  return findById(id);
}

async function remove(id) {
  const [result] = await pool.execute('DELETE FROM accesorios WHERE id_accesorio = ?', [Number(id)]);
  return result.affectedRows > 0;
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove
};

