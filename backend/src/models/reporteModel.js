const { pool } = require('../config/db');

async function getVentasPorPeriodo() {
  const [rows] = await pool.execute(`
    SELECT 
      DATE_FORMAT(v.fecha_venta, '%Y-%m') AS periodo,
      COUNT(v.id_venta) AS total_operaciones,
      SUM(v.precio_venta) AS ingresos_totales,
      AVG(v.precio_venta) AS ticket_promedio
    FROM ventas v
    GROUP BY DATE_FORMAT(v.fecha_venta, '%Y-%m')
    ORDER BY periodo DESC
  `);
  return rows;
}

async function getInventarioValorizado() {
  const [rows] = await pool.execute(`
    SELECT 
      m.nombre AS modelo,
      m.tipo_carroceria,
      COUNT(v.id_vehiculo) AS unidades_en_inventario,
      SUM(CASE WHEN v.estado = 'Disponible' THEN 1 ELSE 0 END) AS unidades_disponibles,
      SUM(CASE WHEN v.estado = 'Vendido' THEN 1 ELSE 0 END) AS unidades_vendidas,
      SUM(v.precio) AS valor_total_inventario_usd,
      AVG(v.precio) AS precio_promedio_usd
    FROM vehiculos v
    INNER JOIN modelos m ON v.id_modelo = m.id_modelo
    GROUP BY m.id_modelo, m.nombre, m.tipo_carroceria
    ORDER BY valor_total_inventario_usd DESC
  `);
  return rows;
}

async function getRendimientoAsesores() {
  const [rows] = await pool.execute(`
    SELECT 
      vend.id_vendedor,
      vend.nombre,
      vend.apellidos,
      vend.correo,
      vend.fecha_contratacion,
      COUNT(v.id_venta) AS total_ventas,
      COALESCE(SUM(v.precio_venta), 0) AS volumen_facturado_usd
    FROM vendedores vend
    LEFT JOIN ventas v ON vend.id_vendedor = v.id_vendedor
    GROUP BY vend.id_vendedor, vend.nombre, vend.apellidos, vend.correo, vend.fecha_contratacion
    ORDER BY volumen_facturado_usd DESC
  `);
  return rows;
}

async function getResumenFinanciero() {
  const [ventasStats] = await pool.execute(`
    SELECT 
      COUNT(*) AS total_ventas,
      COALESCE(SUM(precio_venta), 0) AS ingresos_brutos_usd,
      COALESCE(AVG(precio_venta), 0) AS promedio_venta_usd
    FROM ventas
  `);

  const [invStats] = await pool.execute(`
    SELECT 
      COUNT(*) AS total_unidades,
      COALESCE(SUM(CASE WHEN estado = 'Disponible' THEN precio ELSE 0 END), 0) AS valor_disponible_usd,
      COALESCE(SUM(CASE WHEN estado = 'Reservado' THEN precio ELSE 0 END), 0) AS valor_reservado_usd,
      COALESCE(SUM(CASE WHEN estado = 'Vendido' THEN precio ELSE 0 END), 0) AS valor_vendido_usd
    FROM vehiculos
  `);

  const [sucursalesCount] = await pool.execute('SELECT COUNT(*) AS total FROM sucursales');
  const [mantenimientosCount] = await pool.execute('SELECT COUNT(*) AS total FROM mantenimientos');
  const [garantiasCount] = await pool.execute('SELECT COUNT(*) AS total FROM garantias');

  return {
    ventas: ventasStats[0],
    inventario: invStats[0],
    modulos_adicionales: {
      sucursales: sucursalesCount[0].total,
      mantenimientos: mantenimientosCount[0].total,
      garantias: garantiasCount[0].total
    }
  };
}

module.exports = {
  getVentasPorPeriodo,
  getInventarioValorizado,
  getRendimientoAsesores,
  getResumenFinanciero
};

