const fs = require('fs');
const path = require('path');
const { pipeline, env } = require('@huggingface/transformers');

const EMBEDDING_MODEL = (process.env.EMBEDDING_MODEL || 'Xenova/multilingual-e5-small').trim();
const EMBEDDING_DIMENSIONS = Number(process.env.EMBEDDING_DIMENSIONS) || 384;
const EMBEDDING_VERSION = 'multilingual-e5-small-v1';
const CACHE_DIR = path.resolve(__dirname, '../../.cache/huggingface');
const MAX_SUBWINDOW_CHARS = 950;
const SUBWINDOW_OVERLAP = 100;

let extractorPromise = null;

function configureEnvironment() {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  env.cacheDir = CACHE_DIR;
  env.allowLocalModels = true;
  env.allowRemoteModels = true;
}

/**
 * Inicializa y mantiene en memoria (singleton) el pipeline ONNX de Xenova/multilingual-e5-small,
 * almacenando el modelo en caché local para evitar descargas repetidas.
 */
async function initializeEmbeddingModel() {
  if (!extractorPromise) {
    configureEnvironment();
    extractorPromise = pipeline('feature-extraction', EMBEDDING_MODEL, {
      dtype: 'q8'
    }).catch((err) => {
      extractorPromise = null;
      throw err;
    });
  }
  return extractorPromise;
}

/**
 * Valida que el vector generado corresponda exactamente a la dimensión configurada (384).
 */
function validateEmbeddingDimensions(vector, expectedDim = EMBEDDING_DIMENSIONS) {
  if (!Array.isArray(vector) || vector.length !== expectedDim) {
    throw new Error(
      `Dimensión de embedding inválida: se esperaban ${expectedDim} dimensiones y se recibieron ${Array.isArray(vector) ? vector.length : typeof vector}.`
    );
  }
  for (let i = 0; i < vector.length; i++) {
    if (!Number.isFinite(vector[i])) {
      throw new Error(`Componente no finito en la posición ${i} del embedding.`);
    }
  }
  return true;
}

function l2Normalize(vector) {
  let normSq = 0;
  for (let i = 0; i < vector.length; i++) {
    normSq += vector[i] * vector[i];
  }
  const norm = Math.sqrt(normSq);
  if (norm === 0) return vector;
  return vector.map((v) => Number((v / norm).toFixed(7)));
}

function splitLongPassageForModelWindow(cleanPassage) {
  if (cleanPassage.length <= MAX_SUBWINDOW_CHARS) {
    return [cleanPassage];
  }
  const windows = [];
  let start = 0;
  while (start < cleanPassage.length) {
    const end = Math.min(start + MAX_SUBWINDOW_CHARS, cleanPassage.length);
    const slice = cleanPassage.slice(start, end).trim();
    if (slice) windows.push(slice);
    if (end >= cleanPassage.length) break;
    start = Math.max(start + 1, end - SUBWINDOW_OVERLAP);
  }
  return windows;
}

async function runExtractorSingle(prefixedText) {
  const extractor = await initializeEmbeddingModel();
  const output = await extractor(prefixedText, {
    pooling: 'mean',
    normalize: true
  });
  const vec = Array.from(output.data, (v) => Number(Number(v).toFixed(7)));
  validateEmbeddingDimensions(vec, EMBEDDING_DIMENSIONS);
  return vec;
}

/**
 * Genera el embedding de 384 dimensiones para un fragmento documental usando el prefijo obligatorio `passage: `.
 * Si un fragmento excede la ventana óptima del modelo E5, promedia sub-ventanas normalizadas L2
 * conservando la referencia al fragmento original.
 */
async function generateDocumentEmbedding(text) {
  const clean = String(text || '').trim();
  if (!clean) {
    throw new Error('No se puede generar un embedding de documento para texto vacío.');
  }

  const windows = splitLongPassageForModelWindow(clean);
  if (windows.length === 1) {
    return runExtractorSingle(`passage: ${windows[0]}`);
  }

  const accum = new Float64Array(EMBEDDING_DIMENSIONS);
  for (const w of windows) {
    const subVec = await runExtractorSingle(`passage: ${w}`);
    for (let i = 0; i < EMBEDDING_DIMENSIONS; i++) {
      accum[i] += subVec[i];
    }
  }

  const averaged = Array.from(accum, (val) => val / windows.length);
  const normalized = l2Normalize(averaged);
  validateEmbeddingDimensions(normalized, EMBEDDING_DIMENSIONS);
  return normalized;
}

/**
 * Genera el embedding de 384 dimensiones para la consulta usando el prefijo obligatorio `query: `.
 */
async function generateQueryEmbedding(question) {
  const clean = String(question || '').trim();
  if (!clean) {
    throw new Error('No se puede generar un embedding de consulta para texto vacío.');
  }
  return runExtractorSingle(`query: ${clean}`);
}

/**
 * Genera embeddings en lote para fragmentos (`passage`) o consultas (`query`).
 */
async function generateBatchEmbeddings(texts = [], mode = 'passage') {
  const items = Array.isArray(texts) ? texts : [texts];
  const results = [];
  for (const item of items) {
    const vec = mode === 'query'
      ? await generateQueryEmbedding(item)
      : await generateDocumentEmbedding(item);
    results.push(vec);
  }
  return {
    embeddings: results,
    model: EMBEDDING_MODEL,
    dimensions: EMBEDDING_DIMENSIONS,
    version: EMBEDDING_VERSION,
    provider: 'huggingface-transformers-local-onnx'
  };
}

/**
 * Calcula similitud coseno entre dos vectores validados de 384 dimensiones.
 */
function calculateCosineSimilarity(vecA, vecB) {
  if (!Array.isArray(vecA) || !Array.isArray(vecB)) return 0;
  if (vecA.length !== EMBEDDING_DIMENSIONS || vecB.length !== EMBEDDING_DIMENSIONS) {
    return 0;
  }
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    const a = Number(vecA[i]) || 0;
    const b = Number(vecB[i]) || 0;
    dot += a * b;
    normA += a * a;
    normB += b * b;
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

module.exports = {
  EMBEDDING_MODEL,
  EMBEDDING_DIMENSIONS,
  EMBEDDING_VERSION,
  CACHE_DIR,
  initializeEmbeddingModel,
  generateDocumentEmbedding,
  generateQueryEmbedding,
  generateBatchEmbeddings,
  calculateCosineSimilarity,
  validateEmbeddingDimensions
};
