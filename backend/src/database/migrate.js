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

async function verifyColumnExists(connection, databaseName, tableName, columnName) {
  const [rows] = await connection.execute(
    `SELECT COLUMN_NAME AS columnName
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND LOWER(TABLE_NAME) = LOWER(?) AND LOWER(COLUMN_NAME) = LOWER(?)`,
    [databaseName, tableName, columnName]
  );
  return rows.length > 0;
}

async function ensureUsuariosTenantColumns(connection, databaseName) {
  const hasEmpresa = await verifyColumnExists(connection, databaseName, 'usuarios', 'id_empresa');
  if (!hasEmpresa) {
    console.log("  [MIGRACIÓN] Agregando columna 'id_empresa' a tabla 'usuarios'...");
    await connection.query(
      'ALTER TABLE usuarios ADD COLUMN id_empresa INT UNSIGNED NOT NULL DEFAULT 1 AFTER id_usuario'
    );
    await connection.query('ALTER TABLE usuarios ADD INDEX idx_usuarios_empresa (id_empresa)');
    const empresasExists = await verifyTableExists(connection, databaseName, 'empresas');
    if (empresasExists) {
      await connection.query(
        'ALTER TABLE usuarios ADD CONSTRAINT fk_usuarios_empresa FOREIGN KEY (id_empresa) REFERENCES empresas (id_empresa)'
      );
    }
  }

  const hasRol = await verifyColumnExists(connection, databaseName, 'usuarios', 'rol');
  if (!hasRol) {
    console.log("  [MIGRACIÓN] Agregando columna 'rol' a tabla 'usuarios'...");
    await connection.query(
      "ALTER TABLE usuarios ADD COLUMN rol ENUM('admin', 'colaborador') NOT NULL DEFAULT 'admin' AFTER password_hash"
    );
  }
}

async function verifyIndexExists(connection, databaseName, tableName, indexName) {
  const [rows] = await connection.execute(
    `SELECT INDEX_NAME AS indexName
     FROM information_schema.STATISTICS
     WHERE TABLE_SCHEMA = ? AND LOWER(TABLE_NAME) = LOWER(?) AND LOWER(INDEX_NAME) = LOWER(?)`,
    [databaseName, tableName, indexName]
  );
  return rows.length > 0;
}

async function ensurePolicyBotV2Columns(connection, databaseName) {
  const documentosExists = await verifyTableExists(connection, databaseName, 'documentos');
  if (documentosExists) {
    const hasMetodo = await verifyColumnExists(connection, databaseName, 'documentos', 'metodo_extraccion');
    if (!hasMetodo) {
      console.log("  [MIGRACIÓN] Agregando columna 'metodo_extraccion' a tabla 'documentos'...");
      await connection.query(
        "ALTER TABLE documentos ADD COLUMN metodo_extraccion VARCHAR(40) NOT NULL DEFAULT 'texto_nativo' AFTER estado_indexacion"
      );
    }
  }

  const fragmentosExists = await verifyTableExists(connection, databaseName, 'fragmentos');
  if (fragmentosExists) {
    const columnsToEnsure = [
      {
        name: 'embedding_model',
        sql: "ALTER TABLE fragmentos ADD COLUMN embedding_model VARCHAR(100) NOT NULL DEFAULT 'Xenova/multilingual-e5-small' AFTER embedding_dim"
      },
      {
        name: 'embedding_dimensions',
        sql: 'ALTER TABLE fragmentos ADD COLUMN embedding_dimensions SMALLINT UNSIGNED NOT NULL DEFAULT 384 AFTER embedding_model'
      },
      {
        name: 'embedding_version',
        sql: "ALTER TABLE fragmentos ADD COLUMN embedding_version VARCHAR(32) NOT NULL DEFAULT 'multilingual-e5-small-v1' AFTER embedding_dimensions"
      },
      {
        name: 'indexed_at',
        sql: 'ALTER TABLE fragmentos ADD COLUMN indexed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER embedding_version'
      }
    ];

    for (const col of columnsToEnsure) {
      const exists = await verifyColumnExists(connection, databaseName, 'fragmentos', col.name);
      if (!exists) {
        console.log(`  [MIGRACIÓN] Agregando columna '${col.name}' a tabla 'fragmentos'...`);
        await connection.query(col.sql);
      }
    }

    const hasFt = await verifyIndexExists(connection, databaseName, 'fragmentos', 'idx_fragmentos_contenido_ft');
    if (!hasFt) {
      console.log("  [MIGRACIÓN] Creando índice FULLTEXT 'idx_fragmentos_contenido_ft' en 'fragmentos'...");
      await connection.query('ALTER TABLE fragmentos ADD FULLTEXT INDEX idx_fragmentos_contenido_ft (contenido)');
    }
  }
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

    await ensureUsuariosTenantColumns(connection, database);
    await ensurePolicyBotV2Columns(connection, database);

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

