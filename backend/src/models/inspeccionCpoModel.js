const { pool } = require('../config/db');

async function findAll() {
  const [rows] = await pool.execute(`
    SELECT 
      i.*,
      v.version AS vehiculo_version,
      v.vin,
      v.color,
      v.anio,
      mdl.nombre AS modelo_nombre
    FROM inspecciones_cpo i
    INNER JOIN vehiculos v ON i.id_vehiculo = v.id_vehiculo
    INNER JOIN modelos mdl ON v.id_modelo = mdl.id_modelo
    ORDER BY i.id_inspeccion DESC
  `);
  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute(`
    SELECT 
      i.*,
      v.version AS vehiculo_version,
      v.vin,
      mdl.nombre AS modelo_nombre
    FROM inspecciones_cpo i
    INNER JOIN vehiculos v ON i.id_vehiculo = v.id_vehiculo
    INNER JOIN modelos mdl ON v.id_modelo = mdl.id_modelo
    WHERE i.id_inspeccion = ?
  `, [id]);
  return rows[0] || null;
}

async function create(data) {
  const [result] = await pool.execute(`
    INSERT INTO inspecciones_cpo (folio_inspeccion, id_vehiculo, tecnico_certificador, puntos_revisados_total, puntos_aprobados, estado_motor_transmision, estado_suspension_frenos, estado_carroceria_pintura, aprobado_certificacion_cpo, fecha_inspeccion, dictamen)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    data.folio_inspeccion, data.id_vehiculo, data.tecnico_certificador,
    data.puntos_revisados_total || 110, data.puntos_aprobados || 110,
    data.estado_motor_transmision || 'Excelente',
    data.estado_suspension_frenos || 'Excelente',
    data.estado_carroceria_pintura || 'Impecable',
    data.aprobado_certificacion_cpo !== undefined ? data.aprobado_certificacion_cpo : true,
    data.fecha_inspeccion, data.dictamen || null
  ]);
  return findById(result.insertId);
}

module.exports = { findAll, findById, create };

