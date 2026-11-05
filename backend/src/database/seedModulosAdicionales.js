const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function seedModulosAdicionales() {
  const host = process.env.DB_HOST || 'localhost';
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD ?? '';
  const database = process.env.DB_NAME || 'bmw_premium_motors';

  const connection = await mysql.createConnection({ host, port, user, password, database });

  try {
    // 1. Sucursales
    const [sucursalesCount] = await connection.execute('SELECT COUNT(*) AS total FROM sucursales');
    if (sucursalesCount[0].total === 0) {
      await connection.execute(`
        INSERT INTO sucursales (nombre, ciudad, direccion, telefono, capacidad_vehiculos) VALUES
        ('BMW Múnich Luxury Flagship', 'Ciudad de México', 'Av. Presidente Masaryk 420, Polanco', '+52 55 5280 1234', 60),
        ('BMW M Performance Experience Center', 'Monterrey', 'Av. Ricardo Margáin Zozaya 555, San Pedro Garza García', '+52 81 8356 7890', 45),
        ('BMW Premium Motors Guadalajara Showroom', 'Guadalajara', 'Av. Patria 1890, Puerta de Hierro, Zapopan', '+52 33 3611 4321', 40)
      `);
      console.log('[SEED] Sucursales oficiales insertadas.');
    }

    // 2. Accesorios BMW M Performance
    const [accCount] = await connection.execute('SELECT COUNT(*) AS total FROM accesorios');
    if (accCount[0].total === 0) {
      await connection.execute(`
        INSERT INTO accesorios (nombre, categoria, codigo_parte, precio, stock, descripcion) VALUES
        ('Alerón Trasero en Fibra de Carbono M Performance', 'Aerodinámica M', 'BMW-MP-5162245', 1850.00, 8, 'Alerón de fibra de carbono real con acabado brillante para BMW Serie 3 G20 y M3 G80.'),
        ('Sistema de Escape Deportivo M Performance Titanium', 'Escape y Motor', 'BMW-MP-1830245', 4200.00, 4, 'Escape en titanio con colas en carbono y válvula activa para sonido deportivo.'),
        ('Juego de Rines Forjados 21 Pulgadas Estilo 808 M', 'Rines y Neumáticos', 'BMW-MP-3611808', 5600.00, 6, 'Rines forjados bicolores en Jet Black / Burnished para BMW X5 M y X6 M.'),
        ('Volante Deportivo M Performance en Alcántara con Display', 'Interior', 'BMW-MP-3230245', 2150.00, 5, 'Volante tapizado en Alcántara con costuras tricolor M e indicador OLED de revoluciones.'),
        ('Molduras de Entrada Iluminadas M Motorsport LED', 'Iluminación y Accesorios', 'BMW-MP-5147245', 480.00, 15, 'Molduras de estribo con proyección LED tricolor BMW M al abrir la puerta.')
      `);
      console.log('[SEED] Accesorios M Performance insertados.');
    }

    // 3. Proveedores
    const [provCount] = await connection.execute('SELECT COUNT(*) AS total FROM proveedores');
    if (provCount[0].total === 0) {
      await connection.execute(`
        INSERT INTO proveedores (razon_social, rfc_identificacion, contacto_nombre, correo, telefono, pais_origen) VALUES
        ('BMW AG Logistik & Teilezentrum Múnich', 'DE-BMW-80809', 'Dr. Klaus Becker', 'logistik.zentrum@bmwgroup.com', '+49 89 382 0', 'Alemania'),
        ('Brembo High Performance Brake Systems S.p.A.', 'IT-BRE-24040', 'Matteo Rossi', 'oem.bmw@brembo.it', '+39 035 605 111', 'Italia'),
        ('Michelin Pilot Sport Motorsport Distribution', 'FR-MICH-63040', 'Étienne Laurent', 'pilotsport.bmw@michelin.fr', '+33 4 73 32 20 00', 'Francia')
      `);
      console.log('[SEED] Proveedores BMW insertados.');
    }

    // 4. Garantías
    const [garCount] = await connection.execute('SELECT COUNT(*) AS total FROM garantias');
    if (garCount[0].total === 0) {
      const [vehiculos] = await connection.execute('SELECT id_vehiculo FROM vehiculos LIMIT 3');
      if (vehiculos.length > 0) {
        for (let i = 0; i < vehiculos.length; i++) {
          await connection.execute(`
            INSERT INTO garantias (id_vehiculo, tipo_garantia, cobertura_meses, kilometraje_limite, estado, fecha_inicio)
            VALUES (?, 'BMW Premium Selection Certified Pre-Owned', 36, 100000, 'Activa', '2026-01-15')
          `, [vehiculos[i].id_vehiculo]);
        }
        console.log('[SEED] Garantías certificadas insertadas.');
      }
    }

    // 5. Mantenimientos
    const [mantCount] = await connection.execute('SELECT COUNT(*) AS total FROM mantenimientos');
    if (mantCount[0].total === 0) {
      const [vehiculos] = await connection.execute('SELECT id_vehiculo FROM vehiculos LIMIT 2');
      const [clientes] = await connection.execute('SELECT id_cliente FROM clientes LIMIT 2');
      if (vehiculos.length > 0 && clientes.length > 0) {
        await connection.execute(`
          INSERT INTO mantenimientos (id_vehiculo, id_cliente, tipo_servicio, costo, fecha_servicio, estado, notas) VALUES
          (?, ?, 'Inspección Mayor BMW M & Cambio de Aceite TwinPower 0W-30', 850.00, '2026-02-10', 'Finalizado', 'Revisión computarizada ISTA+ sin códigos de falla. Filtros y bujías M renovadas.'),
          (?, ?, 'Mantenimiento Preventivo de Frenos M Sport', 620.00, '2026-03-01', 'Programado', 'Cambio preventivo de pastillas de freno cerámicas.')
        `, [vehiculos[0].id_vehiculo, clientes[0].id_cliente, vehiculos[1]?.id_vehiculo || vehiculos[0].id_vehiculo, clientes[1]?.id_cliente || clientes[0].id_cliente]);
        console.log('[SEED] Citas de mantenimiento BMW Service insertadas.');
      }
    }

    // 6. Pruebas de manejo
    const [pruebasCount] = await connection.execute('SELECT COUNT(*) AS total FROM pruebas_manejo');
    if (pruebasCount[0].total === 0) {
      const [vehiculos] = await connection.execute('SELECT id_vehiculo FROM vehiculos LIMIT 2');
      const [clientes] = await connection.execute('SELECT id_cliente FROM clientes LIMIT 2');
      const [vendedores] = await connection.execute('SELECT id_vendedor FROM vendedores LIMIT 1');
      if (vehiculos.length > 0 && clientes.length > 0 && vendedores.length > 0) {
        await connection.execute(`
          INSERT INTO pruebas_manejo (id_vehiculo, id_cliente, id_vendedor, fecha_prueba, duracion_minutos, estado, comentarios) VALUES
          (?, ?, ?, '2026-03-15 11:00:00', 45, 'Realizada', 'Excelente experiencia en ruta de autopista; cliente sumamente satisfecho con la aceleración.'),
          (?, ?, ?, '2026-03-20 16:30:00', 60, 'Agendada', 'Prueba programada con acompañamiento técnico en circuito urbano.')
        `, [vehiculos[0].id_vehiculo, clientes[0].id_cliente, vendedores[0].id_vendedor, vehiculos[1]?.id_vehiculo || vehiculos[0].id_vehiculo, clientes[1]?.id_cliente || clientes[0].id_cliente, vendedores[0].id_vendedor]);
        console.log('[SEED] Pruebas de manejo agendadas insertadas.');
      }
    }

    // 7. Seguros
    const [segurosCount] = await connection.execute('SELECT COUNT(*) AS total FROM seguros');
    if (segurosCount[0].total === 0) {
      const [vehiculos] = await connection.execute('SELECT id_vehiculo FROM vehiculos LIMIT 2');
      if (vehiculos.length > 0) {
        await connection.execute(`
          INSERT INTO seguros (id_vehiculo, aseguradora, numero_poliza, cobertura, prima_anual, fecha_vencimiento, estado) VALUES
          (?, 'GNP Seguros Premium', 'GNP-BMW-2026-9901', 'Amplia Plus con Cobertura de Llantas y Rines M', 2350.00, '2027-02-15', 'Vigente'),
          (?, 'Qualitas Alta Gama', 'QUA-BMW-2026-8842', 'Cobertura Total y Auto Sustituto BMW', 2100.00, '2027-03-01', 'Vigente')
        `, [vehiculos[0].id_vehiculo, vehiculos[1]?.id_vehiculo || vehiculos[0].id_vehiculo]);
        console.log('[SEED] Pólizas de seguro BMW Protection insertadas.');
      }
    }

    // 8. Financiamientos
    const [finCount] = await connection.execute('SELECT COUNT(*) AS total FROM financiamientos');
    if (finCount[0].total === 0) {
      const [ventas] = await connection.execute('SELECT id_venta, precio_venta FROM ventas LIMIT 1');
      if (ventas.length > 0) {
        const monto = Number(ventas[0].precio_venta) * 0.70;
        await connection.execute(`
          INSERT INTO financiamientos (id_venta, entidad_financiera, plazo_meses, tasa_interes_anual, cuota_mensual, monto_financiado, estado)
          VALUES (?, 'BMW Financial Services Select', 36, 9.85, 1680.00, ?, 'Aprobado')
        `, [ventas[0].id_venta, monto]);
        console.log('[SEED] Financiamiento de venta insertado.');
      }
    }

    // 9. Logs de auditoría
    const [logCount] = await connection.execute('SELECT COUNT(*) AS total FROM auditoria_logs');
    if (logCount[0].total === 0) {
      const [usuarios] = await connection.execute('SELECT id_usuario FROM usuarios LIMIT 1');
      const idUser = usuarios.length > 0 ? usuarios[0].id_usuario : null;
      await connection.execute(`
        INSERT INTO auditoria_logs (id_usuario, accion, entidad_afectada, id_registro, ip_origen, detalle) VALUES
        (?, 'INICIO_SESION', 'usuarios', ?, '127.0.0.1', 'Autenticación exitosa con credenciales válidas y generación de token JWT.'),
        (?, 'ACTUALIZACION_SISTEMA', 'sistema', 'MODULOS_17', '127.0.0.1', 'Ampliación exitosa a 17 controladores empresariales de BMW Premium Motors.')
      `, [idUser, idUser ? String(idUser) : '1', idUser]);
      console.log('[SEED] Registros de auditoría iniciales insertados.');
    }

    console.log('[EXITO] Seeding de módulos adicionales completado.');
  } finally {
    await connection.end();
  }
}

if (require.main === module) {
  seedModulosAdicionales().catch((err) => {
    console.error('Error en seed:', err);
    process.exit(1);
  });
}

module.exports = { seedModulosAdicionales };
