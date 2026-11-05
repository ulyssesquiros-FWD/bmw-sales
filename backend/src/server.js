const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { validateJwtConfig } = require('./services/tokenService');
const app = require('./app');
const { pool, verifyDatabaseConnection, dbConfig } = require('./config/db');

const PORT = Number(process.env.PORT) || 3001;

async function startServer() {
  try {
    console.log('============================================================');
    console.log(' BMW Premium Motors - Iniciando Servidor Backend (Día 2)');
    console.log('============================================================');

    // Fallar de forma controlada al iniciar si JWT_SECRET falta o es inseguro
    validateJwtConfig();
    console.log('[OK] Configuración criptográfica JWT verificada.');

    console.log(
      `[INFO] Verificando conexión con MySQL (${dbConfig.host}:${dbConfig.port}/${dbConfig.database})...`
    );
    await verifyDatabaseConnection();
    console.log('[OK] Conexión al pool de MySQL verificada correctamente.');

    const server = app.listen(PORT, () => {
      console.log(`[OK] API REST protegida ejecutándose en http://localhost:${PORT}`);
      console.log(`[OK] Endpoint de salud: http://localhost:${PORT}/api/health`);
      console.log('============================================================');
    });

    const shutdown = async (signal) => {
      console.log(`\n[INFO] Señal ${signal} recibida. Cerrando servidor y conexiones MySQL...`);
      server.close(async () => {
        await pool.end();
        console.log('[OK] Recursos liberados correctamente.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('\n[ERROR CRÍTICO] El servidor no pudo iniciar de forma segura.');
    if (error.code === 'JWT_SECRET_MISSING' || error.code === 'JWT_SECRET_WEAK') {
      console.error(`- ${error.message}`);
      console.error(
        '- Genere una clave aleatoria ejecutando: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"'
      );
      console.error('- Asígnela a JWT_SECRET en backend/.env antes de iniciar el servidor.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error(`- Verifique que el servicio MySQL esté activo en ${dbConfig.host}:${dbConfig.port}.`);
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('- Credenciales rechazadas. Revise DB_USER y DB_PASSWORD en backend/.env.');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error(`- La base de datos '${dbConfig.database}' no existe aún.`);
      console.error('  Ejecute: npm run db:init y posteriormente npm run db:migrate');
    } else {
      console.error(`- Detalle (${error.code || 'ERROR'}): ${error.message}`);
    }
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
