const { pool } = require('../config/db');
const empresaModel = require('../models/empresaModel');
const googleDriveService = require('../services/googleDriveService');
const tokenCryptoService = require('../services/tokenCryptoService');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * GET /api/drive/oauth (Solo admin)
 * Genera URL de consentimiento OAuth 2.0 de Google con state anti-CSRF.
 */
const startOAuth = asyncHandler(async (req, res) => {
  const oauthData = googleDriveService.generateAuthorizationUrl({
    id_empresa: req.user.empresa_id,
    id_usuario: req.user.id_usuario
  });

  if (req.query.redirect === '1') {
    return res.redirect(oauthData.authUrl);
  }

  return res.status(200).json({
    ok: true,
    data: {
      authUrl: oauthData.authUrl,
      scopes: oauthData.scopes,
      redirectUri: oauthData.redirectUri
    }
  });
});

/**
 * GET /api/drive/oauth/callback
 * Recibe `code` y `state`, valida CSRF, intercambia por tokens y los guarda cifrados con AES-256-GCM.
 */
const oauthCallback = asyncHandler(async (req, res) => {
  const { code, state, error } = req.query;
  const frontendOrigin = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',')[0].trim();

  if (error) {
    if (String(req.headers.accept || '').includes('application/json')) {
      return res.status(400).json({ ok: false, error: `Consentimiento OAuth rechazado: ${error}` });
    }
    return res.redirect(`${frontendOrigin}/policybot?drive_error=${encodeURIComponent(String(error))}`);
  }

  const result = await googleDriveService.handleOAuthCallback({
    code: String(code || ''),
    state: String(state || '')
  });

  if (String(req.headers.accept || '').includes('application/json')) {
    return res.status(200).json({
      ok: true,
      message: 'Cuenta de Google Drive conectada y tokens cifrados con AES-256-GCM.',
      data: result
    });
  }

  return res.redirect(`${frontendOrigin}/policybot?drive=connected`);
});

/**
 * GET /api/drive/status
 * Reporta estado real de conexión OAuth, cuenta conectada, carpeta y documentos sincronizados.
 * Nunca marca conectado=true si solo hay una carpeta o configuración guardada sin tokens OAuth.
 */
const getStatus = asyncHandler(async (req, res) => {
  const idEmpresa = req.user.empresa_id;
  const empresa = await empresaModel.getEmpresaWithStats(idEmpresa);
  if (!empresa) {
    return res.status(404).json({ ok: false, error: 'Empresa no encontrada.' });
  }

  const [connRows] = await pool.execute(
    `SELECT id_conexion, google_email, folder_id, folder_name, scopes, estado, ultima_sincronizacion
     FROM google_drive_connections
     WHERE id_empresa = ?`,
    [idEmpresa]
  );

  const conn = connRows[0] || null;
  const oauthConfig = googleDriveService.getOAuthEnvConfig();
  const isConnected = Boolean(conn && conn.estado === 'conectado');

  const [driveDocs] = await pool.execute(
    `SELECT id_documento, nombre_archivo, tipo_archivo, drive_file_id, drive_modified_time, total_fragmentos, estado_indexacion, metodo_extraccion, updated_at
     FROM documentos
     WHERE id_empresa = ? AND origen = 'google_drive'
     ORDER BY updated_at DESC`,
    [idEmpresa]
  );

  return res.status(200).json({
    ok: true,
    data: {
      oauth_configured: oauthConfig.isConfigured,
      encryption_configured: tokenCryptoService.isTokenEncryptionConfigured(),
      connected: isConnected,
      connection_state: conn?.estado || 'desconectado',
      google_email: isConnected ? conn.google_email : null,
      folder_id: conn?.folder_id || empresa.google_drive_folder_id || null,
      folder_name: conn?.folder_name || null,
      sync_status: empresa.google_drive_sync_status,
      ultima_sincronizacion: conn?.ultima_sincronizacion || empresa.ultima_sincronizacion,
      cron_horario: '0 * * * * (Cada hora)',
      documentos_drive: driveDocs
    }
  });
});

/**
 * POST /api/drive/connect-folder (Solo admin) y PUT /api/drive/config
 */
const connectFolder = asyncHandler(async (req, res) => {
  const folderId = req.body.folder_id || req.body.google_drive_folder_id || '';
  const folderName = req.body.folder_name || null;

  const data = await googleDriveService.connectFolder({
    id_empresa: req.user.empresa_id,
    folder_id: folderId,
    folder_name: folderName
  });

  return res.status(200).json({
    ok: true,
    message: data.oauth_connected
      ? 'Carpeta de Google Drive vinculada correctamente.'
      : 'ID de carpeta guardado. Conecte su cuenta de Google OAuth 2.0 para habilitar la sincronización.',
    data
  });
});

/**
 * POST /api/drive/sync (Solo admin)
 */
const syncNow = asyncHandler(async (req, res) => {
  const result = await googleDriveService.syncCompanyDriveFolder({
    id_empresa: req.user.empresa_id,
    id_usuario: req.user.id_usuario
  });

  return res.status(200).json({
    ok: true,
    message: `Sincronización OAuth completada (${result.nuevos} nuevos, ${result.actualizados} actualizados, ${result.sin_cambios} sin cambios, ${result.eliminados} eliminados).`,
    data: result
  });
});

/**
 * DELETE /api/drive/disconnect (Solo admin)
 */
const disconnect = asyncHandler(async (req, res) => {
  await googleDriveService.disconnectEmpresaDrive(req.user.empresa_id);
  return res.status(200).json({
    ok: true,
    message: 'Conexión OAuth con Google Drive desconectada correctamente.'
  });
});

module.exports = {
  startOAuth,
  oauthCallback,
  getStatus,
  connectFolder,
  syncNow,
  disconnect
};
