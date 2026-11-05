const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const REQUIRED_TABLES = ['modelos', 'vehiculos', 'clientes', 'vendedores', 'ventas'];

const DEMO_MODELOS = [
  {
    nombre: 'BMW X5 M',
    tipo_carroceria: 'SUV de Alto Rendimiento (SAV M)',
    combustible: 'Gasolina V8 M TwinPower Turbo',
    transmision: 'Automática M Sport / M Steptronic',
    descripcion: 'Mención Especial BMW M GmbH: Sports Activity Vehicle de altas prestaciones que incluye el legendario BMW X5 M E70 (2012) de 555 HP con V8 4.4L biturbo, escape cuádruple M y tracción integral deportiva.'
  },
  {
    nombre: 'BMW M3 Sedán',
    tipo_carroceria: 'Sedán Deportivo M',
    combustible: 'Gasolina M TwinPower Turbo',
    transmision: 'Automática M Steptronic 8 vel.',
    descripcion: 'Berlina deportiva icónica de BMW M GmbH (G80) con motor de 6 cilindros en línea de 510 HP, techo en fibra de carbono CFRP y tracción M xDrive.'
  },
  {
    nombre: 'BMW M4 Coupé',
    tipo_carroceria: 'Coupé',
    combustible: 'Gasolina TwinPower Turbo',
    transmision: 'Automática M Steptronic 8 vel.',
    descripcion: 'Coupé de alto rendimiento desarrollado por BMW M GmbH con motor de 6 cilindros en línea y chasis deportivo de precisión.'
  },
  {
    nombre: 'BMW M5',
    tipo_carroceria: 'Berlina Ejecutiva M',
    combustible: 'Gasolina V8 M TwinPower Turbo',
    transmision: 'Automática M Steptronic 8 vel.',
    descripcion: 'Superberlina ejecutiva de referencia mundial con motor V8 M TwinPower Turbo de 625 HP, frenos M carbono-cerámicos y tracción M xDrive configurable.'
  },
  {
    nombre: 'BMW X6 M',
    tipo_carroceria: 'SUV Coupé Deportivo (SAC M)',
    combustible: 'Gasolina V8 M TwinPower Turbo',
    transmision: 'Automática M Steptronic 8 vel.',
    descripcion: 'Sports Activity Coupé Competition firmado por BMW M GmbH con silueta fastback atlética, chasis adaptativo M Professional y 625 HP.'
  },
  {
    nombre: 'BMW Serie 3',
    tipo_carroceria: 'Sedán',
    combustible: 'Gasolina',
    transmision: 'Automática Steptronic 8 vel.',
    descripcion: 'Sedán deportivo ejecutivo con equilibrio dinámico, tecnología BMW Curved Display y tracción trasera o xDrive.'
  },
  {
    nombre: 'BMW X5',
    tipo_carroceria: 'SUV (SAV)',
    combustible: 'Híbrido Ligero (MHEV)',
    transmision: 'Automática Steptronic Sport 8 vel.',
    descripcion: 'Sports Activity Vehicle de lujo con amplio espacio interior, suspensión adaptativa y tracción integral inteligente xDrive.'
  },
  {
    nombre: 'BMW i4',
    tipo_carroceria: 'Gran Coupé',
    combustible: '100% Eléctrico',
    transmision: 'Automática de 1 velocidad',
    descripcion: 'Gran Coupé totalmente eléctrico con tecnología BMW eDrive de quinta generación y versiones de alto desempeño i4 M50.'
  },
  {
    nombre: 'BMW X3',
    tipo_carroceria: 'SUV (SAV)',
    combustible: 'Gasolina',
    transmision: 'Automática Steptronic 8 vel.',
    descripcion: 'SUV versátil premium diseñado para conducción urbana y viajes largos con sistemas avanzados de asistencia.'
  },
  {
    nombre: 'BMW Serie 5',
    tipo_carroceria: 'Sedán Ejecutivo',
    combustible: 'Híbrido Enchufable (PHEV)',
    transmision: 'Automática Steptronic 8 vel.',
    descripcion: 'Berlina ejecutiva de referencia con confort acústico superior, electrificación eficiente y acabados de lujo.'
  }
];

const DEMO_CLIENTES = [
  {
    nombre: 'Alejandro',
    apellidos: 'Mendoza Vargas',
    identificacion: '1020458910',
    telefono: '+57 310 455 8921',
    correo: 'alejandro.mendoza@empresarial.com',
    direccion: 'Av. El Poblado #14-85, Edificio Torre Empresarial'
  },
  {
    nombre: 'Valeria',
    apellidos: 'Castillo Ríos',
    identificacion: '1032887412',
    telefono: '+57 315 782 3409',
    correo: 'v.castillo@inversionescr.com',
    direccion: 'Calle 93B #18-45, Oficina 602'
  },
  {
    nombre: 'Sebastián',
    apellidos: 'Herrera Duarte',
    identificacion: '79845612',
    telefono: '+57 300 912 6743',
    correo: 'sherrera@arquitecturahd.com',
    direccion: 'Cra. 7 #116-50, Apto 1104'
  },
  {
    nombre: 'Camila',
    apellidos: 'Navarro Restrepo',
    identificacion: '1018493025',
    telefono: '+57 320 634 1188',
    correo: 'camila.navarro@meditech.org',
    direccion: 'Transversal 23 #95-12, Conjunto Bosques'
  },
  {
    nombre: 'Ricardo',
    apellidos: 'Montoya Salazar',
    identificacion: '80134987',
    telefono: '+57 311 298 5501',
    correo: 'rmontoya@grupomontoya.co',
    direccion: 'Km 5 Vía Las Palmas, Condominio Alto Verde'
  }
];

const DEMO_VENDEDORES = [
  {
    nombre: 'Carlos Andrés',
    apellidos: 'Pineda Gómez',
    telefono: '+57 316 500 1101',
    correo: 'carlos.pineda@bmwpremiummotors.com',
    fecha_contratacion: '2021-03-15'
  },
  {
    nombre: 'Laura Sofía',
    apellidos: 'Lozano Mejía',
    telefono: '+57 316 500 1102',
    correo: 'laura.lozano@bmwpremiummotors.com',
    fecha_contratacion: '2022-07-01'
  },
  {
    nombre: 'Mateo',
    apellidos: 'Cárdenas Velásquez',
    telefono: '+57 316 500 1103',
    correo: 'mateo.cardenas@bmwpremiummotors.com',
    fecha_contratacion: '2023-01-20'
  },
  {
    nombre: 'Daniela',
    apellidos: 'Ospina Arango',
    telefono: '+57 316 500 1104',
    correo: 'daniela.ospina@bmwpremiummotors.com',
    fecha_contratacion: '2024-02-10'
  }
];

const DEMO_VEHICULOS = [
  {
    modeloNombre: 'BMW X5 M',
    vin: '5YMGY0C58CLX52012',
    version: 'E70 V8 4.4L 555 HP Edición Especial',
    anio: 2012,
    color: 'Titanium Silver Metallic',
    kilometraje: 42800,
    precio: 48900.00,
    estadoInicial: 'Disponible',
    imagen_url: '/vehicles/x5m-2012-front.jpg'
  },
  {
    modeloNombre: 'BMW M3 Sedán',
    vin: 'WBS43AY07RFM30510',
    version: 'Competition M xDrive (G80)',
    anio: 2025,
    color: 'Gris Brooklyn M Metalizado',
    kilometraje: 0,
    precio: 96500.00,
    estadoInicial: 'Disponible',
    imagen_url: '/vehicles/m3-g80-front.jpg'
  },
  {
    modeloNombre: 'BMW M4 Coupé',
    vin: 'WBS43AZ06RCM77210',
    version: 'Competition M xDrive',
    anio: 2025,
    color: 'Verde Isla de Man',
    kilometraje: 0,
    precio: 112000.00,
    estadoInicial: 'Disponible',
    imagen_url: '/vehicles/m4-g82-front.jpg'
  },
  {
    modeloNombre: 'BMW M5',
    vin: 'WBS83CH09RCM50625',
    version: 'Competition M xDrive 625 HP',
    anio: 2025,
    color: 'Azul Marina Bay Metalizado',
    kilometraje: 1450,
    precio: 129800.00,
    estadoInicial: 'Disponible',
    imagen_url: '/vehicles/m5-front.jpg'
  },
  {
    modeloNombre: 'BMW X6 M',
    vin: '5YM23ET04R9X60888',
    version: 'Competition V8 625 HP',
    anio: 2025,
    color: 'Gris Dravit Metalizado',
    kilometraje: 0,
    precio: 134500.00,
    estadoInicial: 'Reservado',
    imagen_url: '/vehicles/x6m-front.jpg'
  },
  {
    modeloNombre: 'BMW i4',
    vin: 'WBY73AW05RFT88550',
    version: 'M50 xDrive Gran Coupé (544 HP)',
    anio: 2025,
    color: 'Blanco Mineral Metalizado',
    kilometraje: 0,
    precio: 76400.00,
    estadoInicial: 'Disponible',
    imagen_url: '/vehicles/i4-front.jpg'
  },
  {
    modeloNombre: 'BMW Serie 3',
    vin: 'WBA5R1C05RFK10234',
    version: '330i M Sport',
    anio: 2025,
    color: 'Blanco Alpino',
    kilometraje: 0,
    precio: 56900.00,
    estadoInicial: 'Disponible',
    imagen_url: '/vehicles/serie3-white-front.jpg'
  },
  {
    modeloNombre: 'BMW Serie 3',
    vin: 'WBA5R7C02RFK10891',
    version: 'M340i xDrive',
    anio: 2025,
    color: 'Azul Portimao Metalizado',
    kilometraje: 1200,
    precio: 68500.00,
    estadoInicial: 'Disponible',
    imagen_url: '/vehicles/serie3-blue-front.jpg'
  },
  {
    modeloNombre: 'BMW X5',
    vin: '5UXCR6C08R9L44512',
    version: 'xDrive40i M Sport',
    anio: 2025,
    color: 'Negro Zafiro Metalizado',
    kilometraje: 0,
    precio: 84900.00,
    estadoInicial: 'Disponible',
    imagen_url: '/vehicles/x5-g05-front.jpg'
  },
  {
    modeloNombre: 'BMW X5',
    vin: '5UXJU4C01R9L44980',
    version: 'M60i xDrive',
    anio: 2024,
    color: 'Gris Brooklyn M',
    kilometraje: 4850,
    precio: 108500.00,
    estadoInicial: 'Reservado',
    imagen_url: '/vehicles/x5-g05-front.jpg'
  },
  {
    modeloNombre: 'BMW i4',
    vin: 'WBY73AW09RFT88301',
    version: 'eDrive40 Gran Coupé',
    anio: 2025,
    color: 'Blanco Mineral Metalizado',
    kilometraje: 0,
    precio: 64200.00,
    estadoInicial: 'Disponible',
    imagen_url: '/vehicles/i4-front.jpg'
  },
  {
    modeloNombre: 'BMW X3',
    vin: '5UX53DP04R9N31045',
    version: 'xDrive30i Línea Luxury',
    anio: 2024,
    color: 'Gris Sophisto Brillante',
    kilometraje: 6200,
    precio: 58400.00,
    estadoInicial: 'Disponible',
    imagen_url: '/vehicles/x3-front.jpg'
  },
  {
    modeloNombre: 'BMW Serie 5',
    vin: 'WBA53FJ07RCP90418',
    version: '530e M Sport PHEV',
    anio: 2025,
    color: 'Azul Tanzanita II',
    kilometraje: 0,
    precio: 74800.00,
    estadoInicial: 'Reservado',
    imagen_url: '/vehicles/serie5-front.jpg'
  }
];

const DEMO_VENTAS = [
  {
    vin: 'WBA5R7C02RFK10891',
    clienteIdentificacion: '1020458910',
    vendedorCorreo: 'carlos.pineda@bmwpremiummotors.com',
    fecha_venta: '2025-02-14',
    precio_venta: 67500.00,
    observaciones: 'Entrega ejecutiva con paquete de mantenimiento BMW Service Inclusive por 5 años.'
  },
  {
    vin: 'WBY73AW09RFT88301',
    clienteIdentificacion: '1032887412',
    vendedorCorreo: 'laura.lozano@bmwpremiummotors.com',
    fecha_venta: '2025-03-03',
    precio_venta: 63800.00,
    observaciones: 'Incluye cargador residencial BMW Wallbox Gen 3 e instalación certificada.'
  }
];

function parseSqlStatements(sqlContent) {
  const withoutLineComments = sqlContent
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n');

  return withoutLineComments
    .split(';')
    .map((stmt) => stmt.trim())
    .filter((stmt) => stmt.length > 0);
}

function extractTableName(statement) {
  const match = statement.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?`?([a-zA-Z0-9_]+)`?/i);
  return match ? match[1] : null;
}

async function getExistingTables(connection, dbName) {
  const [rows] = await connection.execute(
    `SELECT TABLE_NAME AS tableName
     FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = ?`,
    [dbName]
  );
  return new Set(rows.map((r) => r.tableName.toLowerCase()));
}

async function seedInitialData(connection) {
  let modelosInsertados = 0;
  let clientesInsertados = 0;
  let vendedoresInsertados = 0;
  let vehiculosInsertados = 0;
  let imagenesAsignadas = 0;
  let ventasInsertadas = 0;
  const newlyInsertedVins = new Set();

  await connection.beginTransaction();
  try {
    // 1. Modelos
    for (const m of DEMO_MODELOS) {
      const [existing] = await connection.execute(
        'SELECT id_modelo FROM modelos WHERE nombre = ?',
        [m.nombre]
      );
      if (existing.length === 0) {
        await connection.execute(
          `INSERT INTO modelos (nombre, tipo_carroceria, combustible, transmision, descripcion)
           VALUES (?, ?, ?, ?, ?)`,
          [m.nombre, m.tipo_carroceria, m.combustible, m.transmision, m.descripcion]
        );
        modelosInsertados++;
      }
    }

    // 2. Clientes
    for (const c of DEMO_CLIENTES) {
      const [existing] = await connection.execute(
        'SELECT id_cliente FROM clientes WHERE identificacion = ?',
        [c.identificacion]
      );
      if (existing.length === 0) {
        await connection.execute(
          `INSERT INTO clientes (nombre, apellidos, identificacion, telefono, correo, direccion)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [c.nombre, c.apellidos, c.identificacion, c.telefono, c.correo, c.direccion]
        );
        clientesInsertados++;
      }
    }

    // 3. Vendedores
    for (const v of DEMO_VENDEDORES) {
      const [existing] = await connection.execute(
        'SELECT id_vendedor FROM vendedores WHERE correo = ?',
        [v.correo]
      );
      if (existing.length === 0) {
        await connection.execute(
          `INSERT INTO vendedores (nombre, apellidos, telefono, correo, fecha_contratacion)
           VALUES (?, ?, ?, ?, ?)`,
          [v.nombre, v.apellidos, v.telefono, v.correo, v.fecha_contratacion]
        );
        vendedoresInsertados++;
      }
    }

    // 4. Vehículos (insertar nuevos e hidratar imagen_url si estaba vacía sin sobrescribir cambios del usuario)
    for (const veh of DEMO_VEHICULOS) {
      const [existing] = await connection.execute(
        'SELECT id_vehiculo, color, imagen_url FROM vehiculos WHERE vin = ?',
        [veh.vin]
      );
      if (existing.length === 0) {
        const [modeloRows] = await connection.execute(
          'SELECT id_modelo FROM modelos WHERE nombre = ?',
          [veh.modeloNombre]
        );
        if (modeloRows.length > 0) {
          await connection.execute(
            `INSERT INTO vehiculos (id_modelo, vin, version, anio, color, kilometraje, precio, estado, imagen_url)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              modeloRows[0].id_modelo,
              veh.vin,
              veh.version,
              veh.anio,
              veh.color,
              veh.kilometraje,
              veh.precio,
              veh.estadoInicial,
              veh.imagen_url
            ]
          );
          vehiculosInsertados++;
          newlyInsertedVins.add(veh.vin);
        }
      } else {
        if ((!existing[0].imagen_url || existing[0].imagen_url.trim() === '') && veh.imagen_url) {
          await connection.execute(
            'UPDATE vehiculos SET imagen_url = ? WHERE id_vehiculo = ?',
            [veh.imagen_url, existing[0].id_vehiculo]
          );
          imagenesAsignadas++;
        }
        if (veh.vin === '5YMGY0C58CLX52012' && existing[0].color === 'Azul Monte Carlo Metalizado') {
          await connection.execute(
            'UPDATE vehiculos SET color = ? WHERE id_vehiculo = ?',
            [veh.color, existing[0].id_vehiculo]
          );
        }
      }
    }

    // 5. Ventas iniciales (idempotente)
    const [[{ totalVentasExistentes }]] = await connection.execute(
      'SELECT COUNT(*) AS totalVentasExistentes FROM ventas'
    );

    for (const venta of DEMO_VENTAS) {
      const [vehRows] = await connection.execute(
        'SELECT id_vehiculo, estado FROM vehiculos WHERE vin = ? FOR UPDATE',
        [venta.vin]
      );
      if (vehRows.length === 0) continue;

      const vehiculo = vehRows[0];
      const [existingSale] = await connection.execute(
        'SELECT id_venta FROM ventas WHERE id_vehiculo = ?',
        [vehiculo.id_vehiculo]
      );

      if (existingSale.length === 0 && (newlyInsertedVins.has(venta.vin) || Number(totalVentasExistentes) === 0)) {
        if (vehiculo.estado === 'Disponible') {
          const [cliRows] = await connection.execute(
            'SELECT id_cliente FROM clientes WHERE identificacion = ?',
            [venta.clienteIdentificacion]
          );
          const [vendRows] = await connection.execute(
            'SELECT id_vendedor FROM vendedores WHERE correo = ?',
            [venta.vendedorCorreo]
          );

          if (cliRows.length > 0 && vendRows.length > 0) {
            await connection.execute(
              `INSERT INTO ventas (id_vehiculo, id_cliente, id_vendedor, fecha_venta, precio_venta, observaciones)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [
                vehiculo.id_vehiculo,
                cliRows[0].id_cliente,
                vendRows[0].id_vendedor,
                venta.fecha_venta,
                venta.precio_venta,
                venta.observaciones
              ]
            );
            await connection.execute(
              "UPDATE vehiculos SET estado = 'Vendido' WHERE id_vehiculo = ?",
              [vehiculo.id_vehiculo]
            );
            ventasInsertadas++;
          }
        }
      }
    }

    await connection.commit();
    return {
      modelosInsertados,
      clientesInsertados,
      vendedoresInsertados,
      vehiculosInsertados,
      imagenesAsignadas,
      ventasInsertadas
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  }
}

async function initDatabase() {
  const host = process.env.DB_HOST || 'localhost';
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD ?? '';
  const database = process.env.DB_NAME || 'bmw_premium_motors';

  const schemaPath = path.join(__dirname, 'schema.sql');
  if (!fs.existsSync(schemaPath)) {
    console.error(`[ERROR] No se encontró el archivo de esquema en: ${schemaPath}`);
    process.exit(1);
  }

  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  const statements = parseSqlStatements(schemaSql);

  console.log('============================================================');
  console.log(' BMW Premium Motors - Inicialización Automatizada de MySQL');
  console.log('============================================================');
  console.log(`[INFO] Conectando a MySQL en ${host}:${port} (Base de datos: ${database})...`);

  let connection;
  try {
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database,
      charset: 'utf8mb4'
    });

    console.log('[OK] Conexión establecida exitosamente con MySQL.');

    const tablesBefore = await getExistingTables(connection, database);

    console.log('\n[INFO] Ejecutando esquema SQL (backend/src/database/schema.sql)...');
    for (const stmt of statements) {
      const tableName = extractTableName(stmt);
      await connection.execute(stmt);
      if (tableName) {
        if (tablesBefore.has(tableName.toLowerCase())) {
          console.log(`  [OK] Tabla '${tableName}' verificada (ya existía; estructura y datos conservados).`);
        } else {
          console.log(`  [CREADA] Tabla '${tableName}' creada exitosamente con claves e índices.`);
        }
      }
    }

    const tablesAfter = await getExistingTables(connection, database);
    const missingTables = REQUIRED_TABLES.filter((t) => !tablesAfter.has(t));

    if (missingTables.length > 0) {
      throw new Error(`Faltan tablas requeridas después de ejecutar schema.sql: ${missingTables.join(', ')}`);
    }

    const [fkRows] = await connection.execute(
      `SELECT CONSTRAINT_NAME AS constraintName, TABLE_NAME AS tableName
       FROM information_schema.TABLE_CONSTRAINTS
       WHERE TABLE_SCHEMA = ? AND CONSTRAINT_TYPE = 'FOREIGN KEY'`,
      [database]
    );

    console.log(`\n[VERIFICACIÓN] Las 5 tablas principales existen y están operativas: ${REQUIRED_TABLES.join(', ')}.`);
    console.log(`[VERIFICACIÓN] Relaciones de integridad referencial activas: ${fkRows.length} claves foráneas verificadas.`);

    console.log('\n[INFO] Verificando e insertando datos iniciales de demostración (idempotente)...');
    const summary = await seedInitialData(connection);

    const totalInserted =
      summary.modelosInsertados +
      summary.vehiculosInsertados +
      summary.clientesInsertados +
      summary.vendedoresInsertados +
      summary.imagenesAsignadas +
      summary.ventasInsertadas;

    if (totalInserted > 0) {
      console.log(`  [SEED] Modelos nuevos insertados:    ${summary.modelosInsertados}`);
      console.log(`  [SEED] Clientes nuevos insertados:   ${summary.clientesInsertados}`);
      console.log(`  [SEED] Vendedores nuevos insertados: ${summary.vendedoresInsertados}`);
      console.log(`  [SEED] Vehículos nuevos insertados:  ${summary.vehiculosInsertados}`);
      if (summary.imagenesAsignadas > 0) {
        console.log(`  [SEED] Fotografías asignadas:        ${summary.imagenesAsignadas}`);
      }
      console.log(`  [SEED] Ventas nuevas insertadas:     ${summary.ventasInsertadas}`);
    } else {
      console.log('  [SEED] Los datos iniciales ya estaban registrados. No se generaron duplicados.');
    }

    console.log('\n============================================================');
    console.log(' [ÉXITO] Base de datos bmw_premium_motors lista para operar.');
    console.log('============================================================');
  } catch (error) {
    console.error('\n============================================================');
    console.error(' [ERROR] No se pudo completar la inicialización de MySQL');
    console.error('============================================================');

    if (error.code === 'ECONNREFUSED') {
      console.error(`No fue posible conectarse al servidor MySQL en ${host}:${port}.`);
      console.error('Verifique que el servicio de MySQL esté en ejecución.');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error(`Acceso denegado para el usuario '${user}' en ${host}.`);
      console.error('Verifique DB_USER y DB_PASSWORD en el archivo backend/.env.');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error(`La base de datos '${database}' aún no existe en MySQL.`);
      console.error('Ejecute primero en MySQL Workbench únicamente estas dos instrucciones:\n');
      console.error('  CREATE DATABASE IF NOT EXISTS bmw_premium_motors');
      console.error('  CHARACTER SET utf8mb4');
      console.error('  COLLATE utf8mb4_unicode_ci;\n');
      console.error('  USE bmw_premium_motors;\n');
      console.error('Después vuelva a ejecutar: npm run db:init');
    } else {
      console.error(`Detalle técnico (${error.code || 'ERROR'}): ${error.message}`);
    }

    process.exitCode = 1;
  } finally {
    if (connection) {
      await connection.end();
      console.log('[INFO] Conexión a MySQL cerrada correctamente.');
    }
  }
}

if (require.main === module) {
  initDatabase();
}

module.exports = { initDatabase };
