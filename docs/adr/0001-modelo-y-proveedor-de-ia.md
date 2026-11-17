# ADR-0001: DeepSeek es el proveedor generativo principal para BMW Genius AI y PolicyBot RAG

- Estado: Aceptado (Actualizado 2026-11-16)
- Fecha original: 2026-11-13
- Decide: Equipo técnico del proyecto y responsable de negocio del concesionario

## Contexto

El sistema soporta dos asistentes con necesidades complementarias: **BMW Genius AI** (consultas internas de inventario, ventas, finanzas y taller del concesionario) y **PolicyBot** (asistente SaaS multiempresa con RAG sobre documentos corporativos y Google Drive). Para simplificar la infraestructura, reducir costos y evitar múltiples proveedores de texto generativo, se consolida la generación textual en **DeepSeek** mediante servicios desacoplados que mantienen aislados contextos, permisos y conversaciones.

## Decisión

- **Proveedor principal de IA generativa:** DeepSeek API (`POST https://api.deepseek.com/chat/completions`, formato compatible con OpenAI).
- **Modelo configurable:** `DEEPSEEK_MODEL` en `backend/.env` (valor oficial: `deepseek-flash`; endpoint base configurable vía `DEEPSEEK_BASE_URL=https://api.deepseek.com`).
- **Cliente compartido (`backend/src/services/deepseekService.js`):**
  - Centraliza la conexión HTTP (`createChatCompletion` y `streamChatCompletion` SSE con `AbortSignal`).
  - **BMW Genius AI (`backend/src/services/aiService.js`)** consume el cliente con el snapshot en vivo de BMW en MySQL.
  - **PolicyBot RAG (`backend/src/controllers/chatController.js`)** consume el cliente en streaming SSE usando exclusivamente los 6 fragmentos recuperados de la empresa del JWT y exigiendo citas `[Fuente: archivo, Fragmento #N]`.
- **Procesamiento visual complementario (`backend/src/services/visionService.js`):** Se utiliza **OpenAI GPT-4o Vision** (`gpt-4o`) únicamente para interpretar PDFs escaneados sin texto extraíble o imágenes de documentos, nunca para el chat conversacional ni para embeddings.

## Alternativas descartadas

- Mantener un segundo proveedor generativo paralelo para chat RAG: descartado por duplicación de costos y complejidad operativa (ver reemplazo en ADR-0005).
- Llamar a DeepSeek o OpenAI desde el navegador: descartado porque expondría las API Keys.

## Consecuencias

Ambos módulos reutilizan un cliente seguro en el servidor con control de timeouts, streaming abortable y registro de tokens, manteniendo separación estricta entre los datos de BMW y los documentos de cada empresa en PolicyBot.

## Cómo se verifica

- `backend/src/services/deepseekService.js` — cliente compartido y streaming SSE PolicyBot.
- `backend/src/services/aiService.js` — contexto BMW Genius AI consumiendo `deepseekService`.
- `backend/src/services/visionService.js` — extracción visual con `gpt-4o` solo cuando falta texto nativo.
- `backend/.env.example` — variables `DEEPSEEK_API_KEY`, `DEEPSEEK_BASE_URL`, `DEEPSEEK_MODEL`, `OPENAI_API_KEY`, `OPENAI_VISION_MODEL`.
