const path = require('path');
const { pool } = require('../config/db');
const empresaModel = require('../models/empresaModel');
const ragService = require('../services/ragService');
const { asyncHandler } = require('../middleware/errorHandler');

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.docx', '.txt', '.md', '.png', '.jpg', '.jpeg', '.webp']);

function sanitizeFilename(name = '') {
  return path.basename(String(name || 'documento.txt').trim()).replace(/[^\w.\-áéíóúÁÉÍÓÚñÑ ]+/g, '_');
}

function isAllowedFilename(name = '') {
  const ext = path.extname(String(name || '').trim()).toLowerCase();
  return ALLOWED_EXTENSIONS.has(ext);
}

/**
 * GET /api/documentos
 * Lista documentos exclusivamente de la empresa del JWT.
 */
const getAll = asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT
       d.id_documento,
       d.id_empresa,
       d.subido_por,
       u.nombre AS subido_por_nombre,
       d.nombre_archivo,
       d.tipo_archivo,
       d.origen,
       d.drive_file_id,
       d.drive_modified_time,
       d.contenido_hash,
       d.tamano_bytes,
       d.total_fragmentos,
       d.estado_indexacion,
       d.metodo_extraccion,
       d.error_detalle,
       d.created_at,
       d.updated_at
     FROM documentos d
     LEFT JOIN usuarios u ON u.id_usuario = d.subido_por
     WHERE d.id_empresa = ?
     ORDER BY d.updated_at DESC, d.id_documento DESC`,
    [req.user.empresa_id]
  );

  return res.status(200).json({
    ok: true,
    data: rows
  });
});

/**
 * GET /api/documentos/:id
 * Obtiene un documento y sus fragmentos verificando pertenencia estricta a id_empresa.
 */
const getById = asyncHandler(async (req, res) => {
  const idDocumento = Number(req.params.id);
  if (!Number.isSafeInteger(idDocumento) || idDocumento <= 0) {
    return res.status(400).json({ ok: false, error: 'ID de documento inválido.' });
  }

  const [docs] = await pool.execute(
    `SELECT * FROM documentos WHERE id_documento = ? AND id_empresa = ?`,
    [idDocumento, req.user.empresa_id]
  );

  if (!docs[0]) {
    return res.status(404).json({ ok: false, error: 'Documento no encontrado en esta empresa.' });
  }

  const [fragmentos] = await pool.execute(
    `SELECT id_fragmento, indice_fragmento, contenido, char_inicio, char_fin, embedding_dim, created_at
     FROM fragmentos
     WHERE id_documento = ? AND id_empresa = ?
     ORDER BY indice_fragmento ASC`,
    [idDocumento, req.user.empresa_id]
  );

  return res.status(200).json({
    ok: true,
    data: {
      ...docs[0],
      fragmentos
    }
  });
});

/**
 * POST /api/documentos/upload (Solo admin)
 * Soporta archivo multipart (PDF, DOCX, TXT) o carga textual directa controlada.
 */
const uploadDocumento = asyncHandler(async (req, res) => {
  const idEmpresa = req.user.empresa_id;
  const empresa = await empresaModel.getEmpresaWithStats(idEmpresa);

  if (!empresa) {
    return res.status(404).json({ ok: false, error: 'Empresa no encontrada.' });
  }

  if (Number(empresa.total_documentos) >= Number(empresa.max_documentos)) {
    return res.status(403).json({
      ok: false,
      error: `Límite de documentos alcanzado para el plan ${empresa.plan_nombre} (${empresa.total_documentos}/${empresa.max_documentos}). Actualice a Plan Pro para cargar más documentos.`
    });
  }

  let nombreArchivo;
  let tipoArchivo;
  let rawText;
  let tamanoBytes;
  let metodoExtraccion = 'texto_nativo';

  if (req.file) {
    nombreArchivo = sanitizeFilename(req.file.originalname);
    if (!isAllowedFilename(nombreArchivo)) {
      return res.status(400).json({
        ok: false,
        error: 'Tipo de archivo no permitido. Solo se aceptan PDF, DOCX, TXT o imágenes PNG/JPG/WEBP.'
      });
    }
    const extracted = await ragService.extractTextFromBuffer(
      req.file.buffer,
      nombreArchivo,
      req.file.mimetype
    );
    tipoArchivo = extracted.tipo_archivo;
    rawText = extracted.rawText;
    metodoExtraccion = extracted.metodo_extraccion || 'texto_nativo';
    tamanoBytes = req.file.size || req.file.buffer.length;
  } else if (req.body && typeof req.body.contenido_texto === 'string') {
    nombreArchivo = sanitizeFilename(req.body.nombre_archivo || 'politica_corporativa.txt');
    if (!isAllowedFilename(nombreArchivo)) {
      return res.status(400).json({
        ok: false,
        error: 'Extensión de archivo no permitida. Solo PDF, DOCX o TXT.'
      });
    }
    const ext = path.extname(nombreArchivo).toLowerCase().replace('.', '');
    tipoArchivo = ext === 'pdf' || ext === 'docx' ? ext : 'txt';
    rawText = req.body.contenido_texto;
    tamanoBytes = Buffer.byteLength(rawText, 'utf8');
  } else {
    return res.status(400).json({
      ok: false,
      error: 'Debe adjuntar un archivo (PDF, DOCX, TXT o imagen) o enviar contenido_texto.'
    });
  }

  const cleanedText = ragService.cleanText(rawText);
  if (!cleanedText) {
    return res.status(400).json({
      ok: false,
      error: 'El documento está vacío o no contiene texto legible.'
    });
  }

  const contentHash = ragService.computeContentHash(cleanedText);

  const [insertRes] = await pool.execute(
    `INSERT INTO documentos
       (id_empresa, subido_por, nombre_archivo, tipo_archivo, origen, contenido_hash, tamano_bytes, contenido_texto, estado_indexacion, metodo_extraccion)
     VALUES (?, ?, ?, ?, 'manual', ?, ?, ?, 'pendiente', ?)`,
    [
      idEmpresa,
      req.user.id_usuario,
      nombreArchivo,
      tipoArchivo,
      contentHash,
      tamanoBytes,
      cleanedText,
      metodoExtraccion
    ]
  );

  const idDocumento = insertRes.insertId;
  const indexResult = await ragService.indexDocument({
    id_documento: idDocumento,
    id_empresa: idEmpresa,
    rawText: cleanedText,
    metodo_extraccion: metodoExtraccion
  });

  const [createdRows] = await pool.execute(
    'SELECT * FROM documentos WHERE id_documento = ? AND id_empresa = ?',
    [idDocumento, idEmpresa]
  );

  return res.status(201).json({
    ok: true,
    message: `Documento "${nombreArchivo}" cargado e indexado con ${indexResult.total_fragmentos} fragmento(s) (384 dims).`,
    data: {
      ...createdRows[0],
      embedding_model: indexResult.embedding_model,
      embedding_provider: indexResult.embedding_provider,
      dimensions: indexResult.dimensions
    }
  });
});

/**
 * POST /api/documentos/:id/reindex (Solo admin)
 */
const reindexDocumento = asyncHandler(async (req, res) => {
  const idDocumento = Number(req.params.id);
  const [docs] = await pool.execute(
    'SELECT * FROM documentos WHERE id_documento = ? AND id_empresa = ?',
    [idDocumento, req.user.empresa_id]
  );

  if (!docs[0]) {
    return res.status(404).json({ ok: false, error: 'Documento no encontrado en esta empresa.' });
  }

  const indexResult = await ragService.indexDocument({
    id_documento: idDocumento,
    id_empresa: req.user.empresa_id,
    rawText: docs[0].contenido_texto || ''
  });

  return res.status(200).json({
    ok: true,
    message: `Documento reindexado (${indexResult.total_fragmentos} fragmentos).`,
    data: indexResult
  });
});

/**
 * DELETE /api/documentos/:id (Solo admin)
 */
const deleteDocumento = asyncHandler(async (req, res) => {
  const idDocumento = Number(req.params.id);
  const [result] = await pool.execute(
    'DELETE FROM documentos WHERE id_documento = ? AND id_empresa = ?',
    [idDocumento, req.user.empresa_id]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ ok: false, error: 'Documento no encontrado en esta empresa.' });
  }

  return res.status(200).json({
    ok: true,
    message: 'Documento y fragmentos vectoriales eliminados correctamente.'
  });
});

module.exports = {
  getAll,
  getById,
  uploadDocumento,
  reindexDocumento,
  deleteDocumento
};
