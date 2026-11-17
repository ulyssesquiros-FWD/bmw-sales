const path = require('path');

const OPENAI_CHAT_COMPLETIONS_URL = 'https://api.openai.com/v1/chat/completions';
const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp']);

function getVisionConfig() {
  const apiKey = (process.env.OPENAI_API_KEY || '').trim();
  const model = (process.env.OPENAI_VISION_MODEL || 'gpt-4o').trim();
  return {
    apiKey,
    model,
    isConfigured: Boolean(apiKey && !apiKey.toLowerCase().includes('placeholder'))
  };
}

function isVisionConfigured() {
  return getVisionConfig().isConfigured;
}

function isImageDocument(filename = '', mimetype = '') {
  const ext = path.extname(String(filename || '')).toLowerCase();
  const mime = String(mimetype || '').toLowerCase();
  return IMAGE_EXTENSIONS.has(ext) || mime.startsWith('image/');
}

/**
 * Determina si un PDF carece de texto extraíble suficiente (documento escaneado)
 * y requiere análisis visual mediante GPT-4o Vision.
 */
function needsVisualExtraction(extractedText = '', totalPages = 1) {
  const trimmed = String(extractedText || '').replace(/\s+/g, ' ').trim();
  const pages = Math.max(1, Number(totalPages) || 1);
  if (!trimmed) return true;
  return trimmed.length / pages < 25;
}

/**
 * Envía imágenes (páginas renderizadas de PDF escaneado o fotografías/capturas) a OpenAI GPT-4o Vision
 * exclusivamente para extracción de texto y tablas estructurales. Nunca se usa para chat RAG ni embeddings.
 */
async function extractTextFromImagesWithVision({
  base64Images = [],
  mimeType = 'image/png',
  filename = 'documento',
  signal = null
}) {
  const { apiKey, model, isConfigured } = getVisionConfig();
  if (!isConfigured) {
    const err = new Error(
      'OPENAI_API_KEY no está configurada. Se requiere para procesar documentos escaneados o imágenes con GPT-4o Vision.'
    );
    err.code = 'OPENAI_VISION_NOT_CONFIGURED';
    err.statusCode = 400;
    throw err;
  }

  if (!Array.isArray(base64Images) || base64Images.length === 0) {
    throw new Error('No se proporcionaron imágenes para analizar con GPT-4o Vision.');
  }

  const contentParts = [
    {
      type: 'text',
      text: `Extrae fielmente TODO el texto, artículos, montos, fechas y tablas visibles en el documento "${filename}". Devuelve únicamente texto estructurado limpio en el idioma original del documento, sin inventar contenido ni agregar comentarios externos.`
    }
  ];

  for (const img of base64Images) {
    const b64 = Buffer.isBuffer(img) ? img.toString('base64') : String(img).replace(/^data:image\/\w+;base64,/, '');
    contentParts.push({
      type: 'image_url',
      image_url: {
        url: `data:${mimeType};base64,${b64}`,
        detail: 'high'
      }
    });
  }

  const response = await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      max_tokens: 2500,
      messages: [
        {
          role: 'system',
          content:
            'Eres un extractor OCR documental de precisión para PolicyBot. Transcribe únicamente texto y tablas presentes en las imágenes.'
        },
        {
          role: 'user',
          content: contentParts
        }
      ]
    }),
    signal: signal || undefined
  });

  if (!response.ok) {
    const errText = await response.text();
    const err = new Error(`Error OpenAI GPT-4o Vision (HTTP ${response.status}): ${errText}`);
    err.statusCode = response.status;
    throw err;
  }

  const data = await response.json();
  const extractedText = String(data?.choices?.[0]?.message?.content || '').trim();

  return {
    text: extractedText,
    model: data?.model || model,
    usage: data?.usage || null,
    provider: 'openai-gpt-4o-vision'
  };
}

module.exports = {
  getVisionConfig,
  isVisionConfigured,
  isImageDocument,
  needsVisualExtraction,
  extractTextFromImagesWithVision
};
