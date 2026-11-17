const path = require('path');
const { google } = require('googleapis');
const cron = require('node-cron');
const crypto = require('crypto');
const { pool } = require('../config/db');
const empresaModel = require('../models/empresaModel');
const ragService = require('./ragService');
const tokenCryptoService = require('./tokenCryptoService');

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.docx', '.txt', '.md', '.png', '.jpg', '.jpeg', '.webp']);
const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;

// Almacén en memoria de estados OAuth anti-CSRF (vincular state aleatorio -> { id_empresa, id_usuario })
const pendingOAuthStates = new Map();
let scheduledCronTask = null;

function getOAuthEnvConfig() {
  const clientId = (process.env.GOOGLE_CLIENT_ID || '').trim();
  const clientSecret = (process.env.GOOGLE_CLIENT_SECRET || '').trim();
  const redirectUri = (
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/drive/oauth/callback'
  ).trim();
  const scopes = (process.env.GOOGLE_DRIVE_SCOPES || 'https://www.googleapis.com/auth/drive.readonly')
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    clientId,
    clientSecret,
    redirectUri,
    scopes,
    isConfigured: Boolean(
      clientId &&
        clientSecret &&
        !clientId.toLowerCase().includes('placeholder') &&
        !clientSecret.toLowerCase().includes('placeholder')
    )
  };
}

function createOAuth2Client() {
  const cfg = getOAuthEnvConfig();
  if (!cfg.isConfigured) {
    const err = new Error(
      'Google Drive OAuth 2.0 no está configurado en el servidor (faltan GOOGLE_CLIENT_ID o GOOGLE_CLIENT_SECRET en backend/.env).'
    );
    err.code = 'GOOGLE_OAUTH_NOT_CONFIGURED';
    err.statusCode = 400;
    throw err;
  }
  return new google.auth.OAuth2(cfg.clientId, cfg.clientSecret, cfg.redirectUri);
}

function cleanupExpiredStates() {
  const now = Date.now();
  for (const [key, val] of pendingOAuthStates.entries()) {
    if (val.expiresAt <= now) pendingOAuthStates.delete(key);
  }
}

/**
 * Genera un `state` criptográfico aleatorio ligado a la empresa y usuario admin autenticados
 * para prevenir CSRF durante el callback de OAuth 2.0.
 */
function generateOAuthState({ id_empresa, id_usuario }) {
  cleanupExpiredStates();
  const state = crypto.randomBytes(24).toString('hex');
  pendingOAuthStates.set(state, {
    id_empresa: Number(id_empresa),
    id_usuario: Number(id_usuario),
    expiresAt: Date.now() + OAUTH_STATE_TTL_MS
  });
  return state;
}

/**
 * Valida y consume (un solo uso) el parámetro `state` recibido en /api/drive/oauth/callback.
 */
function verifyAndConsumeOAuthState(state) {
  cleanupExpiredStates();
  if (!state || typeof state !== 'string') {
    const err = new Error('Parámetro state OAuth faltante o inválido.');
    err.statusCode = 400;
    throw err;
  }
  const entry = pendingOAuthStates.get(state);
  if (!entry || entry.expiresAt <= Date.now()) {
    pendingOAuthStates.delete(state);
    const err = new Error('Token anti-CSRF (state) de Google OAuth inválido o expirado.');
    err.statusCode = 400;
    throw err;
  }
  pendingOAuthStates.delete(state);
  return entry;
}

function generateAuthorizationUrl({ id_empresa, id_usuario }) {
  const cfg = getOAuthEnvConfig();
  const oauth2Client = createOAuth2Client();
  const state = generateOAuthState({ id_empresa, id_usuario });

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: cfg.scopes,
    state,
    include_granted_scopes: true
  });

  return { authUrl, state, scopes: cfg.scopes, redirectUri: cfg.redirectUri };
}

/**
 * Intercambia el authorization code por tokens OAuth, consulta el correo Google autorizado
 * y almacena ambos tokens cifrados con AES-256-GCM vinculados exclusivamente a id_empresa.
 */
async function handleOAuthCallback({ code, state }) {
  if (!code || typeof code !== 'string') {
    const err = new Error('Authorization code de Google faltante.');
    err.statusCode = 400;
    throw err;
  }

  const statePayload = verifyAndConsumeOAuthState(state);
  const { id_empresa, id_usuario } = statePayload;
  const oauth2Client = createOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);

  if (!tokens?.access_token) {
    throw new Error('Google OAuth no devolvió un access_token válido.');
  }

  oauth2Client.setCredentials(tokens);

  let googleEmail = null;
  try {
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const about = await drive.about.get({ fields: 'user(emailAddress,displayName)' });
    googleEmail = about?.data?.user?.emailAddress || null;
  } catch (err) {
    console.warn('[GDRIVE-OAUTH] No se pudo leer correo del usuario en drive.about:', err.message);
  }

  const encryptedAccess = tokenCryptoService.encryptToken(tokens.access_token);
  const encryptedRefresh = tokens.refresh_token
    ? tokenCryptoService.encryptToken(tokens.refresh_token)
    : null;
  const expiryDate = tokens.expiry_date ? Number(tokens.expiry_date) : Date.now() + 3500 * 1000;
  const cfg = getOAuthEnvConfig();

  const [existing] = await pool.execute(
    'SELECT id_conexion, refresh_token_encrypted FROM google_drive_connections WHERE id_empresa = ?',
    [id_empresa]
  );

  if (existing.length > 0) {
    const finalRefresh = encryptedRefresh || existing[0].refresh_token_encrypted;
    await pool.execute(
      `UPDATE google_drive_connections
       SET conectado_por = ?,
           google_email = COALESCE(?, google_email),
           access_token_encrypted = ?,
           refresh_token_encrypted = ?,
           token_expiry_date = ?,
           scopes = ?,
           estado = 'conectado'
       WHERE id_empresa = ?`,
      [
        id_usuario,
        googleEmail,
        encryptedAccess,
        finalRefresh,
        expiryDate,
        cfg.scopes.join(' '),
        id_empresa
      ]
    );
  } else {
    await pool.execute(
      `INSERT INTO google_drive_connections
         (id_empresa, conectado_por, google_email, access_token_encrypted, refresh_token_encrypted, token_expiry_date, scopes, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'conectado')`,
      [
        id_empresa,
        id_usuario,
        googleEmail,
        encryptedAccess,
        encryptedRefresh,
        expiryDate,
        cfg.scopes.join(' ')
      ]
    );
  }

  await pool.execute(
    "UPDATE empresas SET google_drive_sync_status = 'oauth_conectado' WHERE id_empresa = ?",
    [id_empresa]
  );

  return { id_empresa, google_email: googleEmail, estado: 'conectado' };
}

/**
 * Obtiene un OAuth2Client autenticado para una empresa específica y renueva automáticamente
 * el access_token con el refresh_token cifrado si está próximo a vencer (< 2 minutos).
 */
async function getAuthenticatedDriveClientForEmpresa(idEmpresa, { oauthClientFactory = createOAuth2Client } = {}) {
  const [rows] = await pool.execute(
    `SELECT * FROM google_drive_connections WHERE id_empresa = ? AND estado = 'conectado'`,
    [Number(idEmpresa)]
  );

  const conn = rows[0];
  if (!conn || !conn.access_token_encrypted) {
    const err = new Error(
      'Esta empresa no tiene una cuenta de Google Drive conectada mediante OAuth 2.0.'
    );
    err.statusCode = 400;
    err.code = 'DRIVE_OAUTH_NOT_CONNECTED';
    throw err;
  }

  const accessToken = tokenCryptoService.decryptToken(conn.access_token_encrypted);
  const refreshToken = conn.refresh_token_encrypted
    ? tokenCryptoService.decryptToken(conn.refresh_token_encrypted)
    : null;

  const oauth2Client = oauthClientFactory();
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken || undefined,
    expiry_date: conn.token_expiry_date ? Number(conn.token_expiry_date) : undefined
  });

  const needsRefresh =
    !conn.token_expiry_date || Number(conn.token_expiry_date) <= Date.now() + 2 * 60 * 1000;

  if (needsRefresh && refreshToken) {
    try {
      const refreshed = await oauth2Client.refreshAccessToken();
      const creds = refreshed.credentials || {};
      if (creds.access_token) {
        const newEncryptedAccess = tokenCryptoService.encryptToken(creds.access_token);
        const newEncryptedRefresh = creds.refresh_token
          ? tokenCryptoService.encryptToken(creds.refresh_token)
          : conn.refresh_token_encrypted;
        const newExpiry = creds.expiry_date ? Number(creds.expiry_date) : Date.now() + 3500 * 1000;

        await pool.execute(
          `UPDATE google_drive_connections
           SET access_token_encrypted = ?, refresh_token_encrypted = ?, token_expiry_date = ?, estado = 'conectado'
           WHERE id_empresa = ?`,
          [newEncryptedAccess, newEncryptedRefresh, newExpiry, Number(idEmpresa)]
        );
        oauth2Client.setCredentials(creds);
      }
    } catch (refreshErr) {
      await pool.execute(
        "UPDATE google_drive_connections SET estado = 'expirado' WHERE id_empresa = ?",
        [Number(idEmpresa)]
      );
      const err = new Error(
        `No se pudo renovar el token OAuth de Google Drive: ${refreshErr.message}`
      );
      err.statusCode = 401;
      throw err;
    }
  }

  return {
    drive: google.drive({ version: 'v3', auth: oauth2Client }),
    oauth2Client,
    connection: conn
  };
}

async function fetchFilesFromDriveWithClient(drive, folderId) {
  const safeQueryFolder = String(folderId).replace(/'/g, '');
  const listRes = await drive.files.list({
    q: `'${safeQueryFolder}' in parents and trashed = false`,
    fields: 'files(id, name, mimeType, modifiedTime, size)',
    pageSize: 100
  });

  const files = listRes.data?.files || [];
  const results = [];

  for (const file of files) {
    let buffer = null;
    let fileName = file.name;
    let mimeType = file.mimeType;

    if (file.mimeType === 'application/vnd.google-apps.document') {
      const exp = await drive.files.export(
        { fileId: file.id, mimeType: 'text/plain' },
        { responseType: 'arraybuffer' }
      );
      buffer = Buffer.from(exp.data);
      if (!fileName.toLowerCase().endsWith('.txt')) fileName += '.txt';
      mimeType = 'text/plain';
    } else {
      const ext = path.extname(fileName).toLowerCase();
      if (!ALLOWED_EXTENSIONS.has(ext)) continue;
      const bin = await drive.files.get(
        { fileId: file.id, alt: 'media' },
        { responseType: 'arraybuffer' }
      );
      buffer = Buffer.from(bin.data);
    }

    results.push({
      driveFileId: file.id,
      name: fileName,
      mimeType,
      modifiedTime: file.modifiedTime || new Date().toISOString(),
      buffer
    });
  }

  return results;
}

/**
 * Sincroniza la carpeta de Google Drive autorizada vía OAuth 2.0 para una empresa.
 * Solo reindexa documentos nuevos o modificados; omite los intactos y borra los eliminados.
 */
async function syncCompanyDriveFolder({ id_empresa, id_usuario = null }) {
  const empresa = await empresaModel.getEmpresaWithStats(id_empresa);
  if (!empresa) {
    throw new Error('Empresa no encontrada.');
  }

  const [connRows] = await pool.execute(
    'SELECT * FROM google_drive_connections WHERE id_empresa = ?',
    [Number(id_empresa)]
  );
  const folderId = connRows[0]?.folder_id || empresa.google_drive_folder_id;

  if (!folderId) {
    const err = new Error('Debe configurar primero el ID de la carpeta de Google Drive.');
    err.statusCode = 400;
    throw err;
  }

  const { drive } = await getAuthenticatedDriveClientForEmpresa(id_empresa);
  const remoteFiles = await fetchFilesFromDriveWithClient(drive, folderId);

  const [existingRows] = await pool.execute(
    `SELECT id_documento, drive_file_id, drive_modified_time, contenido_hash, estado_indexacion
     FROM documentos
     WHERE id_empresa = ? AND origen = 'google_drive'`,
    [Number(id_empresa)]
  );

  const existingByDriveId = new Map(existingRows.map((row) => [row.drive_file_id, row]));
  const seenDriveIds = new Set();

  let currentDocCount = Number(empresa.total_documentos || 0);
  const maxDocs = Number(empresa.max_documentos || 10);

  let nuevos = 0;
  let actualizados = 0;
  let sin_cambios = 0;
  let eliminados = 0;
  let omitidos_por_limite = 0;

  for (const file of remoteFiles) {
    seenDriveIds.add(file.driveFileId);
    const extracted = await ragService.extractTextFromBuffer(file.buffer, file.name, file.mimeType);
    const cleanedText = ragService.cleanText(extracted.rawText);
    const newHash = ragService.computeContentHash(cleanedText);
    const existing = existingByDriveId.get(file.driveFileId);

    if (existing) {
      if (existing.contenido_hash === newHash && existing.estado_indexacion === 'indexado') {
        sin_cambios++;
        continue;
      }

      await pool.execute(
        `UPDATE documentos
         SET nombre_archivo = ?, tipo_archivo = ?, drive_modified_time = ?, tamano_bytes = ?, estado_indexacion = 'pendiente'
         WHERE id_documento = ? AND id_empresa = ?`,
        [
          file.name,
          extracted.tipo_archivo,
          file.modifiedTime,
          file.buffer.length,
          existing.id_documento,
          Number(id_empresa)
        ]
      );

      await ragService.indexDocument({
        id_documento: existing.id_documento,
        id_empresa: Number(id_empresa),
        rawText: cleanedText,
        metodo_extraccion: extracted.metodo_extraccion
      });
      actualizados++;
    } else {
      if (currentDocCount >= maxDocs) {
        omitidos_por_limite++;
        continue;
      }

      const [insertRes] = await pool.execute(
        `INSERT INTO documentos
           (id_empresa, subido_por, nombre_archivo, tipo_archivo, origen, drive_file_id, drive_modified_time, contenido_hash, tamano_bytes, estado_indexacion, metodo_extraccion)
         VALUES (?, ?, ?, ?, 'google_drive', ?, ?, ?, ?, 'pendiente', ?)`,
        [
          Number(id_empresa),
          id_usuario ? Number(id_usuario) : null,
          file.name,
          extracted.tipo_archivo,
          file.driveFileId,
          file.modifiedTime,
          newHash,
          file.buffer.length,
          extracted.metodo_extraccion
        ]
      );

      await ragService.indexDocument({
        id_documento: insertRes.insertId,
        id_empresa: Number(id_empresa),
        rawText: cleanedText,
        metodo_extraccion: extracted.metodo_extraccion
      });

      currentDocCount++;
      nuevos++;
    }
  }

  for (const existing of existingRows) {
    if (existing.drive_file_id && !seenDriveIds.has(existing.drive_file_id)) {
      await pool.execute('DELETE FROM documentos WHERE id_documento = ? AND id_empresa = ?', [
        existing.id_documento,
        Number(id_empresa)
      ]);
      eliminados++;
    }
  }

  await pool.execute(
    'UPDATE google_drive_connections SET ultima_sincronizacion = NOW() WHERE id_empresa = ?',
    [Number(id_empresa)]
  );
  await pool.execute(
    "UPDATE empresas SET google_drive_sync_status = 'sincronizado', ultima_sincronizacion = NOW() WHERE id_empresa = ?",
    [Number(id_empresa)]
  );

  return {
    ok: true,
    mode: 'google-drive-oauth-v3',
    status: 'sincronizado',
    folder_id: folderId,
    nuevos,
    actualizados,
    sin_cambios,
    eliminados,
    omitidos_por_limite,
    total_detectados: remoteFiles.length
  };
}

async function connectFolder({ id_empresa, folder_id, folder_name = null }) {
  const cleanFolderId = String(folder_id || '').trim();
  if (!cleanFolderId) {
    const err = new Error('Debe especificar un folder_id válido de Google Drive.');
    err.statusCode = 400;
    throw err;
  }

  const [connRows] = await pool.execute(
    'SELECT id_conexion FROM google_drive_connections WHERE id_empresa = ?',
    [Number(id_empresa)]
  );

  if (connRows.length > 0) {
    await pool.execute(
      'UPDATE google_drive_connections SET folder_id = ?, folder_name = ? WHERE id_empresa = ?',
      [cleanFolderId, folder_name ? String(folder_name).trim() : null, Number(id_empresa)]
    );
  }

  await pool.execute(
    `UPDATE empresas
     SET google_drive_folder_id = ?,
         google_drive_sync_status = CASE WHEN ? > 0 THEN 'carpeta_configurada' ELSE 'configurado_sin_oauth' END
     WHERE id_empresa = ?`,
    [cleanFolderId, connRows.length, Number(id_empresa)]
  );

  return {
    folder_id: cleanFolderId,
    folder_name: folder_name || null,
    oauth_connected: connRows.length > 0
  };
}

async function disconnectEmpresaDrive(idEmpresa) {
  await pool.execute('DELETE FROM google_drive_connections WHERE id_empresa = ?', [Number(idEmpresa)]);
  await pool.execute(
    `UPDATE empresas
     SET google_drive_folder_id = NULL,
         google_drive_sync_status = 'sin_configurar',
         ultima_sincronizacion = NULL
     WHERE id_empresa = ?`,
    [Number(idEmpresa)]
  );
}

/**
 * Cron automático horario (0 * * * *) para empresas con conexión OAuth activa y carpeta configurada.
 */
function startHourlySyncJob() {
  if (scheduledCronTask) return scheduledCronTask;

  scheduledCronTask = cron.schedule(
    '0 * * * *',
    async () => {
      try {
        const [connections] = await pool.execute(
          `SELECT g.id_empresa, COALESCE(g.folder_id, e.google_drive_folder_id) AS folder_id
           FROM google_drive_connections g
           INNER JOIN empresas e ON e.id_empresa = g.id_empresa
           WHERE g.estado = 'conectado'
             AND e.activo = 1
             AND COALESCE(g.folder_id, e.google_drive_folder_id) IS NOT NULL`
        );

        for (const conn of connections) {
          try {
            await syncCompanyDriveFolder({ id_empresa: conn.id_empresa });
          } catch (syncErr) {
            console.error(`[CRON-DRIVE] Error en empresa ${conn.id_empresa}:`, syncErr.message);
          }
        }
      } catch (err) {
        console.error('[CRON-DRIVE] Error en tarea horaria:', err.message);
      }
    },
    { scheduled: true }
  );

  return scheduledCronTask;
}

function stopHourlySyncJob() {
  if (scheduledCronTask) {
    scheduledCronTask.stop();
    scheduledCronTask = null;
  }
}

module.exports = {
  getOAuthEnvConfig,
  generateOAuthState,
  verifyAndConsumeOAuthState,
  generateAuthorizationUrl,
  handleOAuthCallback,
  getAuthenticatedDriveClientForEmpresa,
  syncCompanyDriveFolder,
  connectFolder,
  disconnectEmpresaDrive,
  startHourlySyncJob,
  stopHourlySyncJob
};
