const crypto = require('crypto');
const path = require('path');
const mammoth = require('mammoth');
const { extractText: extractPdfText, renderPageAsImage } = require('unpdf');
const { pool } = require('../config/db');
const localEmbeddingService = require('./localEmbeddingService');
const visionService = require('./visionService');

const CHUNK_SIZE = 1500;
const CHUNK_OVERLAP = 200;
const TOP_K = 6;
const MAX_VISION_PDF_PAGES = 5;

/**
 * Extrae texto siguiendo el flujo oficial:
 * 1. Imagen directa -> GPT-4o Vision.
 * 2. PDF -> extractor tradicional (`unpdf`); si no tiene texto extraíble (escaneado),
 *    convierte páginas a imagen y usa GPT-4o Vision.
 * 3. DOCX (`mammoth`) / TXT (`utf8`).
 */
async function extractTextFromBuffer(buffer, filename = '', mimetype = '') {
  const ext = path.extname(filename).toLowerCase().replace('.', '');
  const mime = String(mimetype || '').toLowerCase();

  if (visionService.isImageDocument(filename, mime)) {
    const visionRes = await visionService.extractTextFromImagesWithVision({
      base64Images: [buffer],
      mimeType: mime || `image/${ext === 'jpg' ? 'jpeg' : ext || 'png'}`,
      filename
    });
    return {
      tipo_archivo: 'imagen',
      rawText: visionRes.text,
      metodo_extraccion: 'gpt-4o-vision'
    };
  }

  if (ext === 'pdf' || mime === 'application/pdf') {
    const pdfRes = await extractPdfText(new Uint8Array(buffer), { mergePages: true });
    const nativeText = String(pdfRes?.text || '').trim();
    const totalPages = Number(pdfRes?.totalPages || 1);

    if (!visionService.needsVisualExtraction(nativeText, totalPages)) {
      return {
        tipo_archivo: 'pdf',
        rawText: nativeText,
        metodo_extraccion: 'texto_nativo'
      };
    }

    // PDF escaneado sin texto extraíble -> convertir páginas necesarias a imagen y usar GPT-4o Vision
    const pagesToRender = Math.min(totalPages, MAX_VISION_PDF_PAGES);
    const pageImages = [];
    for (let pageNum = 1; pageNum <= pagesToRender; pageNum++) {
      try {
        const imgBuf = await renderPageAsImage(new Uint8Array(buffer), pageNum, {
          scale: 1.5
        });
        pageImages.push(Buffer.from(imgBuf));
      } catch (renderErr) {
        throw new Error(
          `El PDF "${filename}" parece escaneado y requiere renderizado visual para GPT-4o Vision: ${renderErr.message}`
        );
      }
    }

    const visionRes = await visionService.extractTextFromImagesWithVision({
      base64Images: pageImages,
      mimeType: 'image/png',
      filename
    });

    return {
      tipo_archivo: 'pdf',
      rawText: visionRes.text,
      metodo_extraccion: 'gpt-4o-vision'
    };
  }

  if (
    ext === 'docx' ||
    mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return {
      tipo_archivo: 'docx',
      rawText: String(result?.value || ''),
      metodo_extraccion: 'texto_nativo'
    };
  }

  return {
    tipo_archivo: 'txt',
    rawText: buffer.toString('utf8'),
    metodo_extraccion: 'texto_nativo'
  };
}

function cleanText(rawText) {
  return String(rawText || '')
    .replace(/\u0000/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

/**
 * Fragmentación RAG: 1500 caracteres por fragmento con 200 caracteres de solapamiento.
 */
function chunkText(text, chunkSize = CHUNK_SIZE, overlap = CHUNK_OVERLAP) {
  const cleaned = cleanText(text);
  if (!cleaned) return [];

  if (cleaned.length <= chunkSize) {
    return [
      {
        indice_fragmento: 0,
        contenido: cleaned,
        char_inicio: 0,
        char_fin: cleaned.length
      }
    ];
  }

  const chunks = [];
  let start = 0;
  let index = 0;

  while (start < cleaned.length) {
    let end = Math.min(start + chunkSize, cleaned.length);
    if (end < cleaned.length) {
      const lastSpace = cleaned.lastIndexOf(' ', end);
      if (lastSpace > start + Math.floor(chunkSize * 0.75)) {
        end = lastSpace;
      }
    }

    const slice = cleaned.slice(start, end).trim();
    if (slice.length > 0) {
      chunks.push({
        indice_fragmento: index,
        contenido: slice,
        char_inicio: start,
        char_fin: end
      });
      index++;
    }

    if (end >= cleaned.length) break;
    start = Math.max(start + 1, end - overlap);
  }

  return chunks;
}

function computeContentHash(textOrBuffer) {
  return crypto.createHash('sha256').update(textOrBuffer).digest('hex');
}

/**
 * Pipeline RAG completo en MySQL:
 * Limpieza -> Fragmentación (1500/200) -> Embeddings locales multilingual-e5-small (384 dims, prefijo passage:) -> MySQL
 */
async function indexDocument({ id_documento, id_empresa, rawText, metodo_extraccion = null }) {
  const cleanedText = cleanText(rawText);
  if (!cleanedText) {
    await pool.execute(
      `UPDATE documentos
       SET estado_indexacion = 'error', error_detalle = 'El documento no contiene texto extraíble.'
       WHERE id_documento = ? AND id_empresa = ?`,
      [Number(id_documento), Number(id_empresa)]
    );
    throw new Error('El documento no contiene texto extraíble.');
  }

  const chunks = chunkText(cleanedText, CHUNK_SIZE, CHUNK_OVERLAP);
  const batchResult = await localEmbeddingService.generateBatchEmbeddings(
    chunks.map((c) => c.contenido),
    'passage'
  );

  const chunksWithEmbeddings = chunks.map((chunk, idx) => {
    const embedding = batchResult.embeddings[idx];
    localEmbeddingService.validateEmbeddingDimensions(embedding, localEmbeddingService.EMBEDDING_DIMENSIONS);
    return { ...chunk, embedding };
  });

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.execute('DELETE FROM fragmentos WHERE id_documento = ? AND id_empresa = ?', [
      Number(id_documento),
      Number(id_empresa)
    ]);

    for (const chunk of chunksWithEmbeddings) {
      await connection.execute(
        `INSERT INTO fragmentos (
           id_documento, id_empresa, indice_fragmento, contenido, char_inicio, char_fin,
           embedding, embedding_dim, embedding_model, embedding_dimensions, embedding_version, indexed_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          Number(id_documento),
          Number(id_empresa),
          chunk.indice_fragmento,
          chunk.contenido,
          chunk.char_inicio,
          chunk.char_fin,
          JSON.stringify(chunk.embedding),
          batchResult.dimensions,
          batchResult.model,
          batchResult.dimensions,
          batchResult.version
        ]
      );
    }

    const updateMetodo = metodo_extraccion ? ', metodo_extraccion = ?' : '';
    const updateParams = [
      cleanedText,
      computeContentHash(cleanedText),
      chunksWithEmbeddings.length,
      ...(metodo_extraccion ? [metodo_extraccion] : []),
      Number(id_documento),
      Number(id_empresa)
    ];

    await connection.execute(
      `UPDATE documentos
       SET contenido_texto = ?,
           contenido_hash = ?,
           total_fragmentos = ?,
           estado_indexacion = 'indexado',
           error_detalle = NULL
           ${updateMetodo}
       WHERE id_documento = ? AND id_empresa = ?`,
      updateParams
    );

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    await pool.execute(
      `UPDATE documentos SET estado_indexacion = 'error', error_detalle = ? WHERE id_documento = ? AND id_empresa = ?`,
      [String(err.message || 'Error al indexar').slice(0, 500), Number(id_documento), Number(id_empresa)]
    );
    throw err;
  } finally {
    connection.release();
  }

  return {
    id_documento: Number(id_documento),
    id_empresa: Number(id_empresa),
    total_fragmentos: chunksWithEmbeddings.length,
    dimensions: batchResult.dimensions,
    embedding_model: batchResult.model,
    embedding_version: batchResult.version,
    embedding_provider: batchResult.provider
  };
}

/**
 * Identifica y regenera todos los documentos cuyos fragmentos conserven embeddings obsoletos
 * (por ejemplo, de 1024 dimensiones) a 384 dimensiones con multilingual-e5-small sin borrar textos originales.
 */
async function reindexObsoleteEmbeddings(idEmpresa = null) {
  const params = [
    localEmbeddingService.EMBEDDING_DIMENSIONS,
    localEmbeddingService.EMBEDDING_DIMENSIONS,
    localEmbeddingService.EMBEDDING_MODEL
  ];
  let empresaFilter = '';
  if (idEmpresa !== null) {
    empresaFilter = 'AND d.id_empresa = ?';
    params.push(Number(idEmpresa));
  }

  const [obsoleteDocs] = await pool.execute(
    `SELECT DISTINCT d.id_documento, d.id_empresa, d.nombre_archivo, d.contenido_texto, d.metodo_extraccion
     FROM documentos d
     INNER JOIN fragmentos f ON f.id_documento = d.id_documento
     WHERE (
       f.embedding_dimensions <> ?
       OR f.embedding_dim <> ?
       OR f.embedding_model <> ?
     )
     ${empresaFilter}`,
    params
  );

  let reindexedCount = 0;
  for (const doc of obsoleteDocs) {
    if (!doc.contenido_texto) continue;
    await indexDocument({
      id_documento: doc.id_documento,
      id_empresa: doc.id_empresa,
      rawText: doc.contenido_texto,
      metodo_extraccion: doc.metodo_extraccion || 'texto_nativo'
    });
    reindexedCount++;
  }

  return { reindexedCount };
}

/**
 * Recuperación semántica en MySQL aislada obligatoriamente por id_empresa:
 * 1. Genera embedding de 384 dims de la pregunta (`query: ...`).
 * 2. Consulta únicamente fragmentos de id_empresa con embedding_dimensions = 384.
 * 3. Opcionalmente evalúa relevancia léxica/FULLTEXT auxiliar junto con similitud coseno en Node.js.
 * 4. Devuelve los TOP 6 fragmentos ordenados por similitud coseno descendente.
 */
async function retrieveRelevantChunks({ id_empresa, queryText, topK = TOP_K }) {
  const queryEmbedding = await localEmbeddingService.generateQueryEmbedding(queryText);

  // Filtrado multiempresa obligatorio ANTES de calcular similitud coseno
  const [rows] = await pool.execute(
    `SELECT
       f.id_fragmento,
       f.id_documento,
       d.nombre_archivo,
       d.origen,
       d.metodo_extraccion,
       f.indice_fragmento,
       f.contenido,
       f.embedding,
       f.embedding_dimensions,
       f.embedding_model
     FROM fragmentos f
     INNER JOIN documentos d ON d.id_documento = f.id_documento
     WHERE f.id_empresa = ?
       AND d.estado_indexacion = 'indexado'
       AND f.embedding_dimensions = ?`,
    [Number(id_empresa), localEmbeddingService.EMBEDDING_DIMENSIONS]
  );

  const scored = rows.map((row) => {
    let vector = row.embedding;
    if (typeof vector === 'string') {
      try {
        vector = JSON.parse(vector);
      } catch {
        vector = [];
      }
    }
    const similitud = localEmbeddingService.calculateCosineSimilarity(queryEmbedding, vector);
    return {
      id_fragmento: row.id_fragmento,
      id_documento: row.id_documento,
      nombre_archivo: row.nombre_archivo,
      origen: row.origen,
      metodo_extraccion: row.metodo_extraccion,
      indice_fragmento: row.indice_fragmento,
      contenido: row.contenido,
      similitud: Number(similitud.toFixed(6))
    };
  });

  scored.sort((a, b) => b.similitud - a.similitud);

  return {
    chunks: scored.slice(0, Number(topK)),
    embeddingProvider: 'huggingface-transformers-local-onnx',
    embeddingModel: localEmbeddingService.EMBEDDING_MODEL,
    embeddingDimensions: localEmbeddingService.EMBEDDING_DIMENSIONS,
    vectorBackend: 'mysql-json-384-cosine-ranking'
  };
}

module.exports = {
  CHUNK_SIZE,
  CHUNK_OVERLAP,
  TOP_K,
  extractTextFromBuffer,
  cleanText,
  chunkText,
  computeContentHash,
  indexDocument,
  reindexObsoleteEmbeddings,
  retrieveRelevantChunks
};
