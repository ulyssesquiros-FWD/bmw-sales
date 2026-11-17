# ADR-0007: Embeddings neuronales locales con `@huggingface/transformers` y `Xenova/multilingual-e5-small`

- Estado: Aceptado
- Fecha: 2026-11-16
- Decide: Equipo técnico del proyecto

## Contexto

PolicyBot requiere recuperación semántica multilingüe (español) sin depender de APIs externas pagadas ni utilizar hashes o vectores deterministas sintéticos en producción.

## Decisión

Se implementa `backend/src/services/localEmbeddingService.js` utilizando **Hugging Face Transformers.js (`@huggingface/transformers`)** ejecutando ONNX localmente en Node.js:

- **Modelo:** `Xenova/multilingual-e5-small` (`dtype: 'q8'`), descargado una sola vez y almacenado en caché local en `backend/.cache/huggingface`.
- **Dimensión:** `384` dimensiones (`pooling: 'mean'`, `normalize: true`).
- **Prefijos obligatorios de la familia E5:**
  - Documentos / fragmentos: `passage: <contenido>`
  - Consultas de usuario: `query: <pregunta>`
- **Manejo de ventana de contexto:** Si un fragmento de 1500 caracteres supera el límite de tokens del modelo, `localEmbeddingService.js` divide internamente el texto en sub-ventanas superpuestas, genera cada vector con prefijo `passage: `, promedia y normaliza L2 el resultado a 384 dimensiones conservando la referencia al fragmento original.

## Alternativas descartadas

- Embeddings externos (Voyage AI / OpenAI Embeddings): descartados por costo y dependencia de red adicional en indexación.
- Vectores hash deterministas locales de 1024 dimensiones: descartados por carecer de comprensión semántica real en español.

## Cómo se verifica

- `backend/src/services/localEmbeddingService.js` (`initializeEmbeddingModel`, `generateDocumentEmbedding`, `generateQueryEmbedding`, `generateBatchEmbeddings`, `calculateCosineSimilarity`, `validateEmbeddingDimensions`).
- `backend/tests/officialSuite14.test.js` y `backend/tests/securityAndRagPolicyBot.test.js`.
