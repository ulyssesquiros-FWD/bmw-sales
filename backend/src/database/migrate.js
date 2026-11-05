const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function parseSqlStatements(sqlContent) {
  const withoutBlockComments = sqlContent.replace(/\/\*[\s\S]*?\*\//g, '');
  const withoutLineComments = withoutBlockComments
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n');

  return withoutLineComments
    .split(';')
    .map((stmt) => stmt.trim())
    .filter((stmt) => stmt.length > 0);
}

async function ensureMigrationsTable(connection) {
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id_migracion INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      nombre_migracion VARCHAR(255) NOT NULL,
      ejecutada_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT uq_schema_migrations_nombre UNIQUE (nombre_migracion)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

async function getExecutedMigrations(connection) {
  const [rows] = await connection.execute(
    'SELECT nombre_migracion FROM schema_migrations ORDER BY id_migracion ASC'
  );
  return new Set(rows.map((r) => r.nombre_migracion));
}

async function verifyTableExists(connection, databaseName, tableName) {
  const [rows] = await connection.execute(
    `SELECT TABLE_NAME AS tableName
     FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = ? AND LOWER(TABLE_NAME) = LOWER(?)`,
    [databaseName, tableName]
  );
  return rows.length > 0;
}

async function runMigrations() {
  const host = process.env.DB_HOST || 'localhost';
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD ?? '';
  const database = process.env.DB_NAME || 'bmw_premium_motors';

  const migrationsDir = path.join(__dirname, 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    throw new Error(`No existe el directorio de migraciones: ${migrationsDir}`);
  }

  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b));

  console.log('============================================================');
  console.log(' BMW Premium Motors - Ejecución de Migraciones Incrementales');
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

    console.log('[OK] Conexión establecida con MySQL.');

    // 1. Crear tabla de control de migraciones si no existe
    await ensureMigrationsTable(connection);
    console.log("[OK] Tabla de control 'schema_migrations' verificada.");

    // 2. Consultar migraciones ya aplicadas
    const executed = await getExecutedMigrations(connection);
    let appliedCount = 0;
    let skippedCount = 0;

    // 3. Ejecutar únicamente las migraciones pendientes
    for (const fileName of migrationFiles) {
      if (executed.has(fileName)) {
        console.log(`  [OMITIDA] '${fileName}' ya fue ejecutada anteriormente (idempotente).`);
        skippedCount++;
        continue;
      }

      const filePath = path.join(migrationsDir, fileName);
      const sqlContent = fs.readFileSync(filePath, 'utf8');
      const statements = parseSqlStatements(sqlContent);

      console.log(`  [EJECUTANDO] Aplicando migración '${fileName}'...`);
      for (const stmt of statements) {
        await connection.query(stmt);
      }

      await connection.execute(
        'INSERT INTO schema_migrations (nombre_migracion) VALUES (?)',
        [fileName]
      );
      console.log(`  [REGISTRADA] Migración '${fileName}' aplicada y registrada correctamente.`);
      appliedCount++;
    }

    // 4. Verificar explícitamente que la tabla 'usuarios' exista junto con las 5 tablas del Día 1
    const usuariosExists = await verifyTableExists(connection, database, 'usuarios');
    if (!usuariosExists) {
      throw new Error("Verificación fallida: la tabla 'usuarios' no existe tras ejecutar las migraciones.");
    }

    const day1Tables = ['modelos', 'vehiculos', 'clientes', 'vendedores', 'ventas'];
    for (const t of day1Tables) {
      const exists = await verifyTableExists(connection, database, t);
      if (!exists) {
        throw new Error(
          `La tabla empresarial '${t}' aún no existe. Ejecute primero 'npm run db:init' y luego 'npm run db:migrate'.`
        );
      }
    }

    console.log("\n[VERIFICACIÓN] La tabla 'usuarios' existe y está operativa.");
    console.log(`[VERIFICACIÓN] Tablas empresariales intactas: ${day1Tables.join(', ')}.`);
    console.log(`[RESUMEN] Migraciones aplicadas: ${appliedCount} | Ya existentes: ${skippedCount}.`);
    console.log('============================================================');

    return { appliedCount, skippedCount, usuariosExists };
  } catch (error) {
    console.error('\n============================================================');
    console.error(' [ERROR] Falló la ejecución de migraciones incrementales');
    console.error('============================================================');
    console.error(`Detalle (${error.code || 'ERROR'}): ${error.message}`);
    process.exitCode = 1;
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('[INFO] Conexión a MySQL cerrada correctamente.');
    }
  }
}

if (require.main === module) {
  runMigrations().catch(() => {
    process.exit(1);
  });
}

module.exports = { runMigrations };

