const { pool } = require('../config/db');

async function findAll({ estado = '' } = {}) {
  let query = `
    SELECT f.*, 
           v.fecha_venta, v.precio_venta,
           veh.vin, veh.version, mdl.nombre AS modelo_nombre,
           c.nombre AS cliente_nombre, c.apellidos AS cliente_apellidos
    FROM financiamientos f
    INNER JOIN ventas v ON f.id_venta = v.id_venta
    INNER JOIN vehiculos veh ON v.id_vehiculo = veh.id_vehiculo
    INNER JOIN modelos mdl ON veh.id_modelo = mdl.id_modelo
    INNER JOIN clientes c ON v.id_cliente = c.id_cliente
  `;
  const params = [];

  if (estado) {
    query += ' WHERE f.estado = ?';
    params.push(estado);
  }

  query += ' ORDER BY f.id_financiamiento DESC';
  const [rows] = await pool.execute(query, params);
  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute(
    `SELECT f.*, 
            v.fecha_venta, v.precio_venta,
            veh.vin, veh.version, mdl.nombre AS modelo_nombre,
            c.nombre AS cliente_nombre, c.apellidos AS cliente_apellidos
     FROM financiamientos f
     INNER JOIN ventas v ON f.id_venta = v.id_venta
     INNER JOIN vehiculos veh ON v.id_vehiculo = veh.id_vehiculo
     INNER JOIN modelos mdl ON veh.id_modelo = mdl.id_modelo
     INNER JOIN clientes c ON v.id_cliente = c.id_cliente
     WHERE f.id_financiamiento = ?`,
    [Number(id)]
  );
  return rows[0] || null;
}

async function create({ id_venta, entidad_financiera, plazo_meses, tasa_interes_anual, cuota_mensual, monto_financiado, estado }) {
  const [result] = await pool.execute(
    `INSERT INTO financiamientos (id_venta, entidad_financiera, plazo_meses, tasa_interes_anual, cuota_mensual, monto_financiado, estado)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      Number(id_venta),
      entidad_financiera || 'BMW Financial Services',
      Number(plazo_meses),
      Number(tasa_interes_anual),
      Number(cuota_mensual),
      Number(monto_financiado),
      estado || 'Aprobado'
    ]
  );
  return findById(result.insertId);
}

async function update(id, { entidad_financiera, plazo_meses, tasa_interes_anual, cuota_mensual, monto_financiado, estado }) {
  await pool.execute(
    `UPDATE financiamientos
     SET entidad_financiera = ?, plazo_meses = ?, tasa_interes_anual = ?, cuota_mensual = ?, monto_financiado = ?, estado = ?
     WHERE id_financiamiento = ?`,
    [
      entidad_financiera || 'BMW Financial Services',
      Number(plazo_meses),
      Number(tasa_interes_anual),
      Number(cuota_mensual),
      Number(monto_financiado),
      estado || 'Aprobado',
      Number(id)
    ]
  );
  return findById(id);
}

async function remove(id) {
  const [result] = await pool.execute('DELETE FROM financiamientos WHERE id_financiamiento = ?', [Number(id)]);
  return result.affectedRows > 0;
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove
};
