# ADR-0005: Reemplazo de proveedores externos por DeepSeek (`deepseek-flash`) y OpenAI GPT-4o Vision

- Estado: Superseded / Actualizado (2026-11-16) — Sustituye Claude y Voyage AI por DeepSeek + GPT-4o Vision + E5 local
- Fecha: 2026-11-16
- Decide: Equipo técnico y dirección de arquitectura

## Contexto histórico y reemplazo

Inicialmente este ADR planteó utilizar Anthropic Claude y Voyage AI para PolicyBot. Para simplificar la arquitectura, reutilizar el proveedor ya adoptado en el proyecto (`ADR-0001`), reducir dependencias pagadas y procesar documentos escaneados de forma especializada, se reemplazaron dichas integraciones.

## Decisión definitiva

1. **Proveedor generativo único (DeepSeek):** Tanto BMW Genius AI como PolicyBot RAG utilizan DeepSeek (`POST https://api.deepseek.com/chat/completions`, modelo configurable `DEEPSEEK_MODEL=deepseek-flash`) a través del servicio unificado `backend/src/services/deepseekService.js`.
2. **Procesamiento visual especializado (OpenAI GPT-4o Vision):** Se incorpora `backend/src/services/visionService.js` (`OPENAI_VISION_MODEL=gpt-4o`) **exclusivamente** cuando un PDF está escaneado (sin texto nativo extraíble) o cuando se sube una imagen de documento/tabla. No se utiliza OpenAI para el chat de PolicyBot ni para embeddings.
3. **Eliminación de Anthropic Claude y Voyage AI:** Se desinstaló `@anthropic-ai/sdk` y se eliminaron `claudeService.js` y `voyageService.js`, trasladando los embeddings a inferencia neuronal local ONNX (`ADR-0007`).

## Consecuencias

Se reduce la complejidad de mantenimiento de SDKs y claves externas, conservando separación estricta de secretos (`DEEPSEEK_API_KEY` independiente de `OPENAI_API_KEY`) exclusivamente en el backend.
