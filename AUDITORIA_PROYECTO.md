# Auditoría del Proyecto Existente — Adaptación Definitiva PolicyBot

**Fecha de actualización:** 2026-11-16  
**Repositorio base:** `BMW Premium Motors` (rama `feature/ai-governance-pack`)  
**Objetivo:** Evolucionar el proyecto existente hacia el SaaS multiempresa **PolicyBot** consolidado sobre **MySQL único**, **DeepSeek**, **OpenAI GPT-4o Vision**, **Hugging Face `multilingual-e5-small` local (384 dims)** y **Google Drive OAuth 2.0**.

---

## 1. Arquitectura Consolidada

- **Backend:** Node.js + Express 4, 26 controladores originales de BMW Premium Motors + 4 módulos multiempresa PolicyBot (`empresa`, `documentos`, `drive`, `chat`).
- **Base de datos única:** MySQL 8.0 (`bmw_premium_motors`) mediante [`backend/src/config/db.js`](file:///C:/Users/dell5/UQV/Backend/BMW/backend/src/config/db.js), conservando las 24 tablas de BMW y agregando `planes`, `empresas`, `documentos`, `fragmentos`, `mensajes` y `google_drive_connections`.
- **IA Generativa:** DeepSeek (`deepseek-flash`, configurable vía `DEEPSEEK_MODEL`) compartido de forma desacoplada por BMW Genius AI y PolicyBot ([`deepseekService.js`](file:///C:/Users/dell5/UQV/Backend/BMW/backend/src/services/deepseekService.js)).
- **Procesamiento Visual:** OpenAI `gpt-4o` Vision ([`visionService.js`](file:///C:/Users/dell5/UQV/Backend/BMW/backend/src/services/visionService.js)) reservado únicamente para PDFs escaneados sin texto extraíble e imágenes documentales.
- **Embeddings Locales:** `@huggingface/transformers` (ONNX local) con `Xenova/multilingual-e5-small` (384 dimensiones, prefijos `passage:` y `query:`) en [`localEmbeddingService.js`](file:///C:/Users/dell5/UQV/Backend/BMW/backend/src/services/localEmbeddingService.js).
- **Google Drive:** Flujo web OAuth 2.0 por empresa (`state` anti-CSRF, tokens cifrados `AES-256-GCM`) y sincronización horaria con `node-cron`.

---

## 2. Matriz de Estado Actual de Requisitos

| Requisito | Estado actual | Detalle verificado |
|---|---|---|
| Autenticación y Roles (`admin` / `colaborador`) | **Implementado** | JWT HS256 con `empresa_id` y `rol`, `bcryptjs`, `roleMiddleware.js` (`HTTP 403` para colaborador). |
| Multiempresa en MySQL (`empresa_id`) | **Implementado** | Tablas `planes`, `empresas`, `usuarios`, `documentos`, `fragmentos`, `mensajes`, `google_drive_connections` aisladas desde JWT. |
| MySQL Único (vectores 384 dims JSON + ranking Node.js) | **Implementado** | Todos los fragmentos reindexados a 384 dims + columnas `embedding_model`, `embedding_dimensions`, `embedding_version`, `indexed_at` e índice FULLTEXT. |
| DeepSeek API (`deepseek-flash`) | **Implementado (API Key bloqueada en local)** | Integración OpenAI-compatible (`/chat/completions` + SSE + aborto) lista; la clave `****095e` en `backend/.env` devuelve HTTP 401 al consultar la API real. |
| OpenAI GPT-4o Vision (`gpt-4o`) | **Implementado (requiere `OPENAI_API_KEY`)** | Activado únicamente si falta texto nativo en PDF escaneado o si se sube imagen; pendiente de clave activa. |
| Embeddings Locales `multilingual-e5-small` (384 dims) | **Implementado y Verificado** | Inferencia neuronal ONNX real en Node.js con prefijos `passage:`/`query:`, pooling `mean`, `normalize: true` y caché local. |
| Carga de Documentos (PDF, DOCX, TXT e imágenes) | **Implementado** | `multer` + `unpdf` + `mammoth` + puente condicional `visionService`; rechazo `.exe` (`HTTP 400`). |
| Google Drive OAuth 2.0 (`AES-256-GCM`) | **Implementado (requiere credenciales OAuth)** | Endpoints `/oauth`, `/oauth/callback`, `/status`, `/connect-folder`, `/sync`, `/disconnect`, anti-CSRF y refresh automático implementados. |
| Streaming SSE + Citas + Prompt Injection + Cuotas (HTTP 429) | **Implementado y Verificado** | `/api/chat/stream` verifica cuotas (`Gratis`: 200, `Pro`: 10,000), cita `[Fuente, Fragmento #]`, neutraliza inyecciones y aborta al desconectar. |
| Regresión BMW Premium Motors (26 controladores) | **Implementado y Verificado** | 26/26 controladores responden `HTTP 200` sin alteraciones al concesionario. |
