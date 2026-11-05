const { pool } = require('../config/db');

async function findAll(search = '') {
  const params = [];
  let whereClause = '';

  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    whereClause = `WHERE c.nombre LIKE ?
                   OR c.apellidos LIKE ?
                   OR CONCAT(c.nombre, ' ', c.apellidos) LIKE ?
                   OR c.identificacion LIKE ?`;
    params.push(term, term, term, term);
  }

  const [rows] = await pool.execute(
    `SELECT
       c.id_cliente,
       c.nombre,
       c.apellidos,
       c.identificacion,
       c.telefono,
       c.correo,
       c.direccion,
       c.created_at,
       c.updated_at,
       COUNT(vt.id_venta) AS total_compras
     FROM clientes c
     LEFT JOIN ventas vt ON vt.id_cliente = c.id_cliente
     ${whereClause}
     GROUP BY c.id_cliente
     ORDER BY c.id_cliente DESC`,
    params
  );

  return rows.map((r) => ({
    ...r,
    total_compras: Number(r.total_compras || 0)
  }));
}

async function findById(id) {
  const [rows] = await pool.execute(
    `SELECT
       id_cliente,
       nombre,
       apellidos,
       identificacion,
       telefono,
       correo,
       direccion,
       created_at,
       updated_at
     FROM clientes
     WHERE id_cliente = ?`,
    [id]
  );

  if (rows.length === 0) return null;

  const [ventas] = await pool.execute(
    `SELECT
       vt.id_venta,
       vt.fecha_venta,
       vt.precio_venta,
       v.vin,
       v.version,
       v.anio,
       m.nombre AS modelo_nombre
     FROM ventas vt
     INNER JOIN vehiculos v ON v.id_vehiculo = vt.id_vehiculo
     INNER JOIN modelos m ON m.id_modelo = v.id_modelo
     WHERE vt.id_cliente = ?
     ORDER BY vt.fecha_venta DESC, vt.id_venta DESC`,
    [id]
  );

  return {
    ...rows[0],
    total_compras: ventas.length,
    ventas
  };
}

async function existsById(id) {
  const [rows] = await pool.execute('SELECT id_cliente FROM clientes WHERE id_cliente = ?', [id]);
  return rows.length > 0;
}

async function findByIdentificacion(identificacion, excludeId = null) {
  if (excludeId !== null) {
    const [rows] = await pool.execute(
      'SELECT id_cliente FROM clientes WHERE LOWER(identificacion) = LOWER(?) AND id_cliente <> ?',
      [identificacion, excludeId]
    );
    return rows[0] || null;
  }
  const [rows] = await pool.execute(
    'SELECT id_cliente FROM clientes WHERE LOWER(identificacion) = LOWER(?)',
    [identificacion]
  );
  return rows[0] || null;
}

async function countVentasByCliente(id) {
  const [[row]] = await pool.execute(
    'SELECT COUNT(*) AS total FROM ventas WHERE id_cliente = ?',
    [id]
  );
  return Number(row.total || 0);
}

async function create({ nombre, apellidos, identificacion, telefono, correo, direccion }) {
  const [result] = await pool.execute(
    `INSERT INTO clientes (nombre, apellidos, identificacion, telefono, correo, direccion)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [nombre, apellidos, identificacion, telefono, correo.toLowerCase(), direccion || null]
  );
  return findById(result.insertId);
}

async function update(id, { nombre, apellidos, identificacion, telefono, correo, direccion }) {
  await pool.execute(
    `UPDATE clientes
     SET nombre = ?, apellidos = ?, identificacion = ?, telefono = ?, correo = ?, direccion = ?
     WHERE id_cliente = ?`,
    [nombre, apellidos, identificacion, telefono, correo.toLowerCase(), direccion || null, id]
  );
  return findById(id);
}

async function remove(id) {
  const [result] = await pool.execute('DELETE FROM clientes WHERE id_cliente = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = {
  findAll,
  findById,
  existsById,
  findByIdentificacion,
  countVentasByCliente,
  create,
  update,
  remove
};

