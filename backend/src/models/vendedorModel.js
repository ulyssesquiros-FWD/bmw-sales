const { pool } = require('../config/db');

async function findAll(search = '') {
  const params = [];
  let whereClause = '';

  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    whereClause = `WHERE vd.nombre LIKE ?
                   OR vd.apellidos LIKE ?
                   OR CONCAT(vd.nombre, ' ', vd.apellidos) LIKE ?
                   OR vd.correo LIKE ?`;
    params.push(term, term, term, term);
  }

  const [rows] = await pool.execute(
    `SELECT
       vd.id_vendedor,
       vd.nombre,
       vd.apellidos,
       vd.telefono,
       vd.correo,
       vd.fecha_contratacion,
       vd.created_at,
       vd.updated_at,
       COUNT(vt.id_venta) AS total_ventas,
       COALESCE(SUM(vt.precio_venta), 0) AS ingresos_generados
     FROM vendedores vd
     LEFT JOIN ventas vt ON vt.id_vendedor = vd.id_vendedor
     ${whereClause}
     GROUP BY vd.id_vendedor
     ORDER BY vd.id_vendedor DESC`,
    params
  );

  return rows.map((r) => ({
    ...r,
    total_ventas: Number(r.total_ventas || 0),
    ingresos_generados: Number(r.ingresos_generados || 0)
  }));
}

async function findById(id) {
  const [rows] = await pool.execute(
    `SELECT
       id_vendedor,
       nombre,
       apellidos,
       telefono,
       correo,
       fecha_contratacion,
       created_at,
       updated_at
     FROM vendedores
     WHERE id_vendedor = ?`,
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
       m.nombre AS modelo_nombre,
       CONCAT(c.nombre, ' ', c.apellidos) AS cliente_nombre_completo
     FROM ventas vt
     INNER JOIN vehiculos v ON v.id_vehiculo = vt.id_vehiculo
     INNER JOIN modelos m ON m.id_modelo = v.id_modelo
     INNER JOIN clientes c ON c.id_cliente = vt.id_cliente
     WHERE vt.id_vendedor = ?
     ORDER BY vt.fecha_venta DESC, vt.id_venta DESC`,
    [id]
  );

  return {
    ...rows[0],
    total_ventas: ventas.length,
    ventas
  };
}

async function existsById(id) {
  const [rows] = await pool.execute(
    'SELECT id_vendedor FROM vendedores WHERE id_vendedor = ?',
    [id]
  );
  return rows.length > 0;
}

async function findByCorreo(correo, excludeId = null) {
  if (excludeId !== null) {
    const [rows] = await pool.execute(
      'SELECT id_vendedor FROM vendedores WHERE LOWER(correo) = LOWER(?) AND id_vendedor <> ?',
      [correo, excludeId]
    );
    return rows[0] || null;
  }
  const [rows] = await pool.execute(
    'SELECT id_vendedor FROM vendedores WHERE LOWER(correo) = LOWER(?)',
    [correo]
  );
  return rows[0] || null;
}

async function countVentasByVendedor(id) {
  const [[row]] = await pool.execute(
    'SELECT COUNT(*) AS total FROM ventas WHERE id_vendedor = ?',
    [id]
  );
  return Number(row.total || 0);
}

async function create({ nombre, apellidos, telefono, correo, fecha_contratacion }) {
  const [result] = await pool.execute(
    `INSERT INTO vendedores (nombre, apellidos, telefono, correo, fecha_contratacion)
     VALUES (?, ?, ?, ?, ?)`,
    [nombre, apellidos, telefono, correo.toLowerCase(), fecha_contratacion]
  );
  return findById(result.insertId);
}

async function update(id, { nombre, apellidos, telefono, correo, fecha_contratacion }) {
  await pool.execute(
    `UPDATE vendedores
     SET nombre = ?, apellidos = ?, telefono = ?, correo = ?, fecha_contratacion = ?
     WHERE id_vendedor = ?`,
    [nombre, apellidos, telefono, correo.toLowerCase(), fecha_contratacion, id]
  );
  return findById(id);
}

async function remove(id) {
  const [result] = await pool.execute('DELETE FROM vendedores WHERE id_vendedor = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = {
  findAll,
  findById,
  existsById,
  findByCorreo,
  countVentasByVendedor,
  create,
  update,
  remove
};

