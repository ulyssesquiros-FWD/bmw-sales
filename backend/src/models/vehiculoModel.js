const { pool } = require('../config/db');

async function findAll({ id_modelo, estado, search } = {}) {
  const conditions = [];
  const params = [];

  if (id_modelo) {
    conditions.push('v.id_modelo = ?');
    params.push(Number(id_modelo));
  }

  if (estado) {
    conditions.push('v.estado = ?');
    params.push(estado);
  }

  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    conditions.push('(v.vin LIKE ? OR v.version LIKE ? OR m.nombre LIKE ? OR v.color LIKE ?)');
    params.push(term, term, term, term);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows] = await pool.execute(
    `SELECT
       v.id_vehiculo,
       v.id_modelo,
       v.vin,
       v.version,
       v.anio,
       v.color,
       v.kilometraje,
       v.precio,
       v.estado,
       v.imagen_url,
       v.created_at,
       v.updated_at,
       m.nombre AS modelo_nombre,
       m.tipo_carroceria,
       m.combustible,
       m.transmision,
       vt.id_venta
     FROM vehiculos v
     INNER JOIN modelos m ON m.id_modelo = v.id_modelo
     LEFT JOIN ventas vt ON vt.id_vehiculo = v.id_vehiculo
     ${whereClause}
     ORDER BY v.id_vehiculo DESC`,
    params
  );

  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute(
    `SELECT
       v.id_vehiculo,
       v.id_modelo,
       v.vin,
       v.version,
       v.anio,
       v.color,
       v.kilometraje,
       v.precio,
       v.estado,
       v.imagen_url,
       v.created_at,
       v.updated_at,
       m.nombre AS modelo_nombre,
       m.tipo_carroceria,
       m.combustible,
       m.transmision,
       vt.id_venta,
       vt.fecha_venta,
       vt.precio_venta,
       CONCAT(c.nombre, ' ', c.apellidos) AS cliente_nombre_completo,
       CONCAT(vd.nombre, ' ', vd.apellidos) AS vendedor_nombre_completo
     FROM vehiculos v
     INNER JOIN modelos m ON m.id_modelo = v.id_modelo
     LEFT JOIN ventas vt ON vt.id_vehiculo = v.id_vehiculo
     LEFT JOIN clientes c ON c.id_cliente = vt.id_cliente
     LEFT JOIN vendedores vd ON vd.id_vendedor = vt.id_vendedor
     WHERE v.id_vehiculo = ?`,
    [id]
  );

  return rows[0] || null;
}

async function findByVin(vin, excludeId = null) {
  if (excludeId !== null) {
    const [rows] = await pool.execute(
      'SELECT id_vehiculo FROM vehiculos WHERE UPPER(vin) = UPPER(?) AND id_vehiculo <> ?',
      [vin, excludeId]
    );
    return rows[0] || null;
  }
  const [rows] = await pool.execute(
    'SELECT id_vehiculo FROM vehiculos WHERE UPPER(vin) = UPPER(?)',
    [vin]
  );
  return rows[0] || null;
}

async function countVentasByVehiculo(id) {
  const [[row]] = await pool.execute(
    'SELECT COUNT(*) AS total FROM ventas WHERE id_vehiculo = ?',
    [id]
  );
  return Number(row.total || 0);
}

async function create({
  id_modelo,
  vin,
  version,
  anio,
  color,
  kilometraje,
  precio,
  estado = 'Disponible',
  imagen_url = null
}) {
  const [result] = await pool.execute(
    `INSERT INTO vehiculos (id_modelo, vin, version, anio, color, kilometraje, precio, estado, imagen_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      Number(id_modelo),
      vin.toUpperCase(),
      version,
      Number(anio),
      color,
      Number(kilometraje),
      Number(precio),
      estado,
      imagen_url || null
    ]
  );
  return findById(result.insertId);
}

async function update(
  id,
  { id_modelo, vin, version, anio, color, kilometraje, precio, estado, imagen_url }
) {
  await pool.execute(
    `UPDATE vehiculos
     SET id_modelo = ?,
         vin = ?,
         version = ?,
         anio = ?,
         color = ?,
         kilometraje = ?,
         precio = ?,
         estado = ?,
         imagen_url = ?
     WHERE id_vehiculo = ?`,
    [
      Number(id_modelo),
      vin.toUpperCase(),
      version,
      Number(anio),
      color,
      Number(kilometraje),
      Number(precio),
      estado,
      imagen_url || null,
      id
    ]
  );
  return findById(id);
}

async function remove(id) {
  const [result] = await pool.execute('DELETE FROM vehiculos WHERE id_vehiculo = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = {
  findAll,
  findById,
  findByVin,
  countVentasByVehiculo,
  create,
  update,
  remove
};

