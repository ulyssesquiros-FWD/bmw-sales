const { pool } = require('../config/db');

async function findAll(search = '') {
  const params = [];
  let whereClause = '';

  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    whereClause = `WHERE m.nombre LIKE ? OR m.tipo_carroceria LIKE ? OR m.combustible LIKE ? OR m.transmision LIKE ?`;
    params.push(term, term, term, term);
  }

  const [rows] = await pool.execute(
    `SELECT
       m.id_modelo,
       m.nombre,
       m.tipo_carroceria,
       m.combustible,
       m.transmision,
       m.descripcion,
       m.created_at,
       m.updated_at,
       COUNT(v.id_vehiculo) AS total_vehiculos,
       SUM(CASE WHEN v.estado = 'Disponible' THEN 1 ELSE 0 END) AS vehiculos_disponibles
     FROM modelos m
     LEFT JOIN vehiculos v ON v.id_modelo = m.id_modelo
     ${whereClause}
     GROUP BY m.id_modelo
     ORDER BY m.nombre ASC`,
    params
  );

  return rows.map((r) => ({
    ...r,
    total_vehiculos: Number(r.total_vehiculos || 0),
    vehiculos_disponibles: Number(r.vehiculos_disponibles || 0)
  }));
}

async function findById(id) {
  const [rows] = await pool.execute(
    `SELECT
       m.id_modelo,
       m.nombre,
       m.tipo_carroceria,
       m.combustible,
       m.transmision,
       m.descripcion,
       m.created_at,
       m.updated_at
     FROM modelos m
     WHERE m.id_modelo = ?`,
    [id]
  );

  if (rows.length === 0) return null;

  const [vehiculos] = await pool.execute(
    `SELECT id_vehiculo, vin, version, anio, color, kilometraje, precio, estado, imagen_url
     FROM vehiculos
     WHERE id_modelo = ?
     ORDER BY created_at DESC`,
    [id]
  );

  return {
    ...rows[0],
    total_vehiculos: vehiculos.length,
    vehiculos
  };
}

async function existsById(id) {
  const [rows] = await pool.execute('SELECT id_modelo FROM modelos WHERE id_modelo = ?', [id]);
  return rows.length > 0;
}

async function findByNombre(nombre, excludeId = null) {
  if (excludeId !== null) {
    const [rows] = await pool.execute(
      'SELECT id_modelo FROM modelos WHERE LOWER(nombre) = LOWER(?) AND id_modelo <> ?',
      [nombre, excludeId]
    );
    return rows[0] || null;
  }
  const [rows] = await pool.execute(
    'SELECT id_modelo FROM modelos WHERE LOWER(nombre) = LOWER(?)',
    [nombre]
  );
  return rows[0] || null;
}

async function countVehiculosByModelo(id) {
  const [[row]] = await pool.execute(
    'SELECT COUNT(*) AS total FROM vehiculos WHERE id_modelo = ?',
    [id]
  );
  return Number(row.total || 0);
}

async function create({ nombre, tipo_carroceria, combustible, transmision, descripcion }) {
  const [result] = await pool.execute(
    `INSERT INTO modelos (nombre, tipo_carroceria, combustible, transmision, descripcion)
     VALUES (?, ?, ?, ?, ?)`,
    [nombre, tipo_carroceria, combustible, transmision, descripcion || null]
  );
  return findById(result.insertId);
}

async function update(id, { nombre, tipo_carroceria, combustible, transmision, descripcion }) {
  await pool.execute(
    `UPDATE modelos
     SET nombre = ?, tipo_carroceria = ?, combustible = ?, transmision = ?, descripcion = ?
     WHERE id_modelo = ?`,
    [nombre, tipo_carroceria, combustible, transmision, descripcion || null, id]
  );
  return findById(id);
}

async function remove(id) {
  const [result] = await pool.execute('DELETE FROM modelos WHERE id_modelo = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = {
  findAll,
  findById,
  existsById,
  findByNombre,
  countVehiculosByModelo,
  create,
  update,
  remove
};

