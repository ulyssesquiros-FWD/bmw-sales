const { pool } = require('../config/db');
const { asyncHandler } = require('../middleware/errorHandler');

const getDashboardResumen = asyncHandler(async (req, res) => {
  const [[vehiculosStats]] = await pool.execute(`
    SELECT
      COUNT(*) AS total_vehiculos,
      COALESCE(SUM(CASE WHEN estado = 'Disponible' THEN 1 ELSE 0 END), 0) AS vehiculos_disponibles,
      COALESCE(SUM(CASE WHEN estado = 'Reservado' THEN 1 ELSE 0 END), 0) AS vehiculos_reservados,
      COALESCE(SUM(CASE WHEN estado = 'Vendido' THEN 1 ELSE 0 END), 0) AS vehiculos_vendidos
    FROM vehiculos
  `);

  const [[{ total_modelos }]] = await pool.execute('SELECT COUNT(*) AS total_modelos FROM modelos');
  const [[{ total_clientes }]] = await pool.execute('SELECT COUNT(*) AS total_clientes FROM clientes');
  const [[{ total_vendedores }]] = await pool.execute('SELECT COUNT(*) AS total_vendedores FROM vendedores');

  const [[ventasStats]] = await pool.execute(`
    SELECT
      COUNT(*) AS cantidad_ventas,
      COALESCE(SUM(precio_venta), 0) AS ingresos_ventas
    FROM ventas
  `);

  const [vehiculosRecientes] = await pool.execute(`
    SELECT
      v.id_vehiculo,
      v.vin,
      v.version,
      v.anio,
      v.color,
      v.kilometraje,
      v.precio,
      v.estado,
      v.imagen_url,
      v.created_at,
      m.nombre AS modelo_nombre,
      m.tipo_carroceria
    FROM vehiculos v
    INNER JOIN modelos m ON m.id_modelo = v.id_modelo
    ORDER BY v.created_at DESC, v.id_vehiculo DESC
    LIMIT 6
  `);

  const [ventasRecientes] = await pool.execute(`
    SELECT
      vt.id_venta,
      vt.fecha_venta,
      vt.precio_venta,
      vt.created_at,
      v.vin AS vehiculo_vin,
      v.version AS vehiculo_version,
      v.anio AS vehiculo_anio,
      m.nombre AS modelo_nombre,
      CONCAT(c.nombre, ' ', c.apellidos) AS cliente_nombre_completo,
      CONCAT(vd.nombre, ' ', vd.apellidos) AS vendedor_nombre_completo
    FROM ventas vt
    INNER JOIN vehiculos v ON v.id_vehiculo = vt.id_vehiculo
    INNER JOIN modelos m ON m.id_modelo = v.id_modelo
    INNER JOIN clientes c ON c.id_cliente = vt.id_cliente
    INNER JOIN vendedores vd ON vd.id_vendedor = vt.id_vendedor
    ORDER BY vt.fecha_venta DESC, vt.id_venta DESC
    LIMIT 6
  `);

  const [destacadoRows] = await pool.execute(`
    SELECT
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
      m.nombre AS modelo_nombre,
      m.tipo_carroceria,
      m.combustible,
      m.transmision
    FROM vehiculos v
    INNER JOIN modelos m ON m.id_modelo = v.id_modelo
    ORDER BY
      CASE
        WHEN m.nombre = 'BMW X5 M' AND v.anio = 2012 THEN 0
        WHEN m.nombre LIKE '%M%' THEN 1
        ELSE 2
      END ASC,
      v.id_vehiculo ASC
    LIMIT 1
  `);

  res.status(200).json({
    ok: true,
    data: {
      moneda: 'USD',
      indicadores: {
        total_modelos: Number(total_modelos || 0),
        total_vehiculos: Number(vehiculosStats.total_vehiculos || 0),
        vehiculos_disponibles: Number(vehiculosStats.vehiculos_disponibles || 0),
        vehiculos_reservados: Number(vehiculosStats.vehiculos_reservados || 0),
        vehiculos_vendidos: Number(vehiculosStats.vehiculos_vendidos || 0),
        total_clientes: Number(total_clientes || 0),
        total_vendedores: Number(total_vendedores || 0),
        cantidad_ventas: Number(ventasStats.cantidad_ventas || 0),
        ingresos_ventas: Number(ventasStats.ingresos_ventas || 0)
      },
      vehiculo_destacado: destacadoRows[0] || null,
      vehiculos_recientes: vehiculosRecientes,
      ventas_recientes: ventasRecientes
    }
  });
});

module.exports = {
  getDashboardResumen
};

