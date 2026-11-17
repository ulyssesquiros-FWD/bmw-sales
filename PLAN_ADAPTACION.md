# Plan de Adaptación Definitivo — PolicyBot sobre BMW Premium Motors

Este documento describe la transición definitiva aplicada al proyecto existente para consolidarlo en **MySQL + DeepSeek + OpenAI GPT-4o Vision + Embeddings Locales E5 + Google Drive OAuth 2.0**.

---

## 1. Cambios Arquitectónicos Respecto a la Versión Inicial

| Aspecto | Diseño anterior (reemplazado) | Arquitectura definitiva implementada |
|---|---|---|
| Base de datos vectorial | Dual MySQL + PostgreSQL/`pgvector` (1024 dims) | **MySQL único (`bmw_premium_motors`)** con vectores JSON de 384 dims, metadatos, índice `FULLTEXT` y ranking coseno en Node.js (`ADR-0006`). |
| Proveedor generativo | Anthropic Claude | **DeepSeek (`deepseek-flash`)** compartido de forma desacoplada por BMW Genius AI y PolicyBot (`ADR-0001`, `ADR-0005`). |
| Procesamiento visual | No implementado | **OpenAI GPT-4o Vision (`gpt-4o`)** exclusivo para PDFs escaneados sin texto extraíble o imágenes (`visionService.js`). |
| Embeddings | Voyage AI / respaldo determinista 1024 dims | **Hugging Face `@huggingface/transformers` (`Xenova/multilingual-e5-small`)** en ONNX local de **384 dimensiones** (`ADR-0007`). |
| Google Drive | Cuenta de servicio JSON / carpeta espejo | **OAuth 2.0 Web Application** por empresa con `state` anti-CSRF, tokens cifrados `AES-256-GCM` en `google_drive_connections` y refresh automático. |

## 2. Dependencias Depuradas y Nuevas

- **Eliminadas de `backend/package.json`:** `@anthropic-ai/sdk`, `pg`, `pgvector`.
- **Instalada en `backend/package.json`:** `@huggingface/transformers` (`^4.3.2`).
- **Conservadas:** `mysql2`, `express`, `cors`, `helmet`, `jsonwebtoken`, `bcrypt`, `bcryptjs`, `dotenv`, `express-rate-limit`, `express-validator`, `multer`, `unpdf`, `mammoth`, `googleapis`, `node-cron`.

## 3. Cambios de Base de Datos (MySQL)

- Migración `005_policybot_e5_384_oauth_drive.sql` + actualización de `migrate.js`:
  - Nueva tabla `google_drive_connections` (tokens cifrados AES-256-GCM por `id_empresa`).
  - Nueva columna `documentos.metodo_extraccion` y tipo `imagen` en `documentos.tipo_archivo`.
  - Nuevas columnas en `fragmentos`: `embedding_model`, `embedding_dimensions`, `embedding_version`, `indexed_at` e índice `FULLTEXT (contenido)`.
  - Reindexación completa de todos los fragmentos existentes de 1024 dimensiones a 384 dimensiones (`0` vectores obsoletos restantes).

## 4. Guía de Configuración de Variables de Entorno (`.env.example`)

1. **Base de datos MySQL (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME=bmw_premium_motors`):** Credenciales de su instancia MySQL 8.0 local o productiva.
2. **Seguridad JWT (`JWT_SECRET`, `JWT_EXPIRES_IN=1h`):** Genere `JWT_SECRET` ejecutando `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`.
3. **DeepSeek (`DEEPSEEK_API_KEY`, `DEEPSEEK_BASE_URL=https://api.deepseek.com`, `DEEPSEEK_MODEL=deepseek-flash`):** Genere una clave en [platform.deepseek.com](https://platform.deepseek.com/). Se utiliza tanto para BMW Genius AI como para PolicyBot RAG.
4. **OpenAI Vision (`OPENAI_API_KEY`, `OPENAI_VISION_MODEL=gpt-4o`):** Obtenga la clave en [platform.openai.com](https://platform.openai.com/). Solo se consume cuando se suben imágenes o PDFs escaneados sin texto nativo.
5. **Embeddings locales (`EMBEDDING_PROVIDER=local`, `EMBEDDING_MODEL=Xenova/multilingual-e5-small`, `EMBEDDING_DIMENSIONS=384`):** Inferencia ONNX local sin API key externa; el modelo se cachea automáticamente en `backend/.cache/huggingface`.
6. **Google Drive OAuth 2.0 (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI=http://localhost:3001/api/drive/oauth/callback`, `GOOGLE_DRIVE_SCOPES=https://www.googleapis.com/auth/drive.readonly`):** Cree credenciales de *ID de cliente OAuth 2.0 (Aplicación web)* en Google Cloud Console habilitando la *Google Drive API* y agregando la URL de redirección exacta en orígenes/callbacks autorizados.
7. **Cifrado de tokens (`TOKEN_ENCRYPTION_KEY`):** Clave aleatoria de 64 caracteres hexadecimales (32 bytes) generada con `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` para cifrar los tokens de Google Drive con `AES-256-GCM` en MySQL.
