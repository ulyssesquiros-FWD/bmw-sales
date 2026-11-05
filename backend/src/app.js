const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { pool, verifyDatabaseConnection, dbConfig } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const modeloRoutes = require('./routes/modeloRoutes');
const vehiculoRoutes = require('./routes/vehiculoRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const vendedorRoutes = require('./routes/vendedorRoutes');
const ventaRoutes = require('./routes/ventaRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const sucursalRoutes = require('./routes/sucursalRoutes');
const accesorioRoutes = require('./routes/accesorioRoutes');
const proveedorRoutes = require('./routes/proveedorRoutes');
const garantiaRoutes = require('./routes/garantiaRoutes');
const mantenimientoRoutes = require('./routes/mantenimientoRoutes');
const financiamientoRoutes = require('./routes/financiamientoRoutes');
const pruebaManejoRoutes = require('./routes/pruebaManejoRoutes');
const seguroRoutes = require('./routes/seguroRoutes');
const auditoriaLogRoutes = require('./routes/auditoriaLogRoutes');
const reporteRoutes = require('./routes/reporteRoutes');
const cotizacionRoutes = require('./routes/cotizacionRoutes');
const facturaRoutes = require('./routes/facturaRoutes');
const pedidoFabricaRoutes = require('./routes/pedidoFabricaRoutes');
const inspeccionCpoRoutes = require('./routes/inspeccionCpoRoutes');
const campanaMarketingRoutes = require('./routes/campanaMarketingRoutes');
const encuestaSatisfaccionRoutes = require('./routes/encuestaSatisfaccionRoutes');
const almacenRefaccionRoutes = require('./routes/almacenRefaccionRoutes');
const reclamacionGarantiaRoutes = require('./routes/reclamacionGarantiaRoutes');
const authMiddleware = require('./middleware/authMiddleware');
const { AppError, notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Soporte para despliegues productivos detrás de proxy inverso TLS/HTTPS
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
  app.use((req, res, next) => {
    if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
      return next();
    }
    return res.status(403).json({
      ok: false,
      message: 'En producción se requiere conexión cifrada mediante HTTPS.'
    });
  });
}

// Cabeceras de seguridad HTTP con Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

// Configuración CORS estricta para el frontend autorizado
const configuredOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
const allowedOrigins = configuredOrigin
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

if (
  allowedOrigins.includes('http://localhost:5173') &&
  !allowedOrigins.includes('http://127.0.0.1:5173')
) {
  allowedOrigins.push('http://127.0.0.1:5173');
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new AppError('Origen no permitido por la política CORS.', 403));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Endpoint público de salud (sin exponer credenciales ni detalles internos sensibles)
app.get('/api/health', async (req, res) => {
  try {
    await verifyDatabaseConnection();
    const [tables] = await pool.execute(
      `SELECT TABLE_NAME AS tableName
       FROM information_schema.TABLES
       WHERE TABLE_SCHEMA = ?`,
      [dbConfig.database]
    );

    const existingSet = new Set(tables.map((t) => t.tableName.toLowerCase()));
    const required = ['modelos', 'vehiculos', 'clientes', 'vendedores', 'ventas', 'usuarios'];
    const tablesReady = required.every((t) => existingSet.has(t));

    return res.status(200).json({
      ok: true,
      status: tablesReady ? 'UP' : 'DEGRADED',
      service: 'BMW Premium Motors API',
      database: {
        connected: true,
        tables_ready: tablesReady
      },
      timestamp: new Date().toISOString()
    });
  } catch {
    return res.status(503).json({
      ok: false,
      status: 'DOWN',
      service: 'BMW Premium Motors API',
      database: {
        connected: false
      },
      message: 'Servicio temporalmente no disponible.',
      timestamp: new Date().toISOString()
    });
  }
});

// Rutas de autenticación (/register y /login públicas; /me protegida con authMiddleware)
app.use('/api/auth', authRoutes);

// Rutas empresariales protegidas obligatoriamente mediante JWT
app.use('/api/modelos', authMiddleware, modeloRoutes);
app.use('/api/vehiculos', authMiddleware, vehiculoRoutes);
app.use('/api/clientes', authMiddleware, clienteRoutes);
app.use('/api/vendedores', authMiddleware, vendedorRoutes);
app.use('/api/ventas', authMiddleware, ventaRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/sucursales', authMiddleware, sucursalRoutes);
app.use('/api/accesorios', authMiddleware, accesorioRoutes);
app.use('/api/proveedores', authMiddleware, proveedorRoutes);
app.use('/api/garantias', authMiddleware, garantiaRoutes);
app.use('/api/mantenimientos', authMiddleware, mantenimientoRoutes);
app.use('/api/financiamientos', authMiddleware, financiamientoRoutes);
app.use('/api/pruebas-manejo', authMiddleware, pruebaManejoRoutes);
app.use('/api/seguros', authMiddleware, seguroRoutes);
app.use('/api/auditoria-logs', authMiddleware, auditoriaLogRoutes);
app.use('/api/reportes', authMiddleware, reporteRoutes);
app.use('/api/cotizaciones', authMiddleware, cotizacionRoutes);
app.use('/api/facturas', authMiddleware, facturaRoutes);
app.use('/api/pedidos-fabrica', authMiddleware, pedidoFabricaRoutes);
app.use('/api/inspecciones-cpo', authMiddleware, inspeccionCpoRoutes);
app.use('/api/campanas-marketing', authMiddleware, campanaMarketingRoutes);
app.use('/api/encuestas-satisfaccion', authMiddleware, encuestaSatisfaccionRoutes);
app.use('/api/almacen-refacciones', authMiddleware, almacenRefaccionRoutes);
app.use('/api/reclamaciones-garantia', authMiddleware, reclamacionGarantiaRoutes);

// Manejo de rutas inexistentes y errores centralizados
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
