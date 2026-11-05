const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

(async () => {
  const c = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bmw_premium_motors'
  });

  const [disponibles] = await c.query(`
    SELECT id_vehiculo, precio, version 
    FROM vehiculos 
    WHERE id_vehiculo NOT IN (SELECT id_vehiculo FROM ventas) AND estado = 'Disponible' 
    LIMIT 3
  `);
  const [clientes] = await c.query('SELECT id_cliente, nombre FROM clientes ORDER BY id_cliente DESC LIMIT 3');
  const [vendedores] = await c.query('SELECT id_vendedor, nombre FROM vendedores ORDER BY id_vendedor DESC LIMIT 3');

  for (let i = 0; i < disponibles.length; i++) {
    const v = disponibles[i];
    const cli = clientes[i];
    const vend = vendedores[i];
    await c.query('UPDATE vehiculos SET estado = "Vendido" WHERE id_vehiculo = ?', [v.id_vehiculo]);
    const [res] = await c.query(
      `INSERT INTO ventas (id_vehiculo, id_cliente, id_vendedor, fecha_venta, precio_venta, observaciones, created_at, updated_at) 
       VALUES (?, ?, ?, '2026-03-18', ?, ?, NOW(), NOW())`,
      [v.id_vehiculo, cli.id_cliente, vend.id_vendedor, v.precio, `Entrega oficial en showroom corporativo con paquete de bienvenida BMW M. Adquirido por ${cli.nombre}.`]
    );
    const monto = Number(v.precio) * 0.70;
    const cuota = (monto * 1.15) / 36;
    await c.query(
      `INSERT INTO financiamientos (id_venta, entidad_financiera, plazo_meses, tasa_interes_anual, cuota_mensual, monto_financiado, estado) 
       VALUES (?, 'BMW Financial Services Premier', 36, 8.99, ?, ?, 'Aprobado')`,
      [res.insertId, cuota.toFixed(2), monto.toFixed(2)]
    );
    console.log(`[VENTAS] Venta registrada para ${v.version} (Venta ID: ${res.insertId})`);
  }

  await c.end();
})().catch(console.error);
