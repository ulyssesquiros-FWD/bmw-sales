# Resultados Reales de Pruebas — PolicyBot v2 & BMW Premium Motors

**Fecha de ejecución:** 2026-11-16  
**Rama:** `feature/ai-governance-pack`  
**Base de datos:** MySQL 8.0 (`bmw_premium_motors` en `127.0.0.1:3306`)

---

## 1. Suite de las 14 Pruebas Obligatorias (`node backend/tests/officialSuite14.test.js` + Regresión + Build)

| # | Prueba | Estado Real | Evidencia Directa Observada |
| :---: | :--- | :---: | :--- |
| **1** | DeepSeek responde realmente mediante su API | **BLOQUEADO** | Llamada real a `https://api.deepseek.com/chat/completions` devolvió `HTTP 401: Authentication Fails, Your api key: ****095e is invalid`. Requiere nueva `DEEPSEEK_API_KEY`. |
| **2** | Streaming de DeepSeek (`stream: true`) | **BLOQUEADO** | Llamada real SSE a DeepSeek devolvió `HTTP 401` por la misma clave inválida `****095e`. El cliente SSE abortable está verificado estructuralmente. |
| **3** | GPT-4o Vision analiza una imagen de prueba | **BLOQUEADO** | `OPENAI_API_KEY` no está configurada en `backend/.env`. |
| **4** | Embeddings locales de 384 dimensiones | **PASS** | `@huggingface/transformers` + `Xenova/multilingual-e5-small` (ONNX local) generó vectores reales de `384` dimensiones. |
| **5** | Recuperación semántica con documentos en español | **PASS** | Consulta de vacaciones en MySQL para Café Montaña devolvió Top-1 = `Politica_Vacaciones_Cafe_Montana.txt` (similitud coseno `0.869574`). |
| **6** | Similitud coseno correcta | **PASS** | Pregunta de vacaciones obtuvo mayor similitud con política de vacaciones (`0.8822`) que con política de hospedaje (`0.8223`). |
| **7** | Reindexación completa de embeddings antiguos | **PASS** | `0` fragmentos obsoletos restantes en MySQL (`embedding_dimensions = 384`, `embedding_model = 'Xenova/multilingual-e5-small'`). |
| **8** | Almacenamiento y recuperación en MySQL | **PASS** | Fragmentos de 384 dims persistidos y recuperados en `bmw_premium_motors` (`WHERE id_empresa = ?`). |
| **9** | Conexión OAuth real con Google | **BLOQUEADO** | `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` no están configurados en `backend/.env`. |
| **10** | Renovación de tokens Google | **PASS (unitaria) / BLOQUEADO (vivo)** | Cifrado `AES-256-GCM` en `google_drive_connections` y refresh automático verificados con mock unitario de `oauthClientFactory`; OAuth vivo bloqueado sin credenciales Google. |
| **11** | Aislamiento de documentos entre empresas | **PASS** | Café Montaña y Logística Pacífico 100% aisladas en consultas SQL y recuperación vectorial; acceso cruzado retorna `HTTP 404`. |
| **12** | Sincronización real de Drive | **BLOQUEADO** | Requiere flujo OAuth 2.0 real completado con cuenta Google y carpeta autorizada; sin OAuth conectado, `POST /api/drive/sync` rechaza correctamente con `HTTP 400`. |
| **13** | Regresión de los 26 controladores BMW | **PASS** | `node scratch/test_26_controllers.js`: **26 / 26 controladores** respondieron `HTTP 200` con sus registros intactos. |
| **14** | Build de React (`vite build`) | **PASS** | `npm run build --prefix frontend`: `1700 modules transformed`, `✓ built in 5.33s` (0 errores). |

---

## 2. Los 7 Escenarios de Aceptación PolicyBot (`node backend/tests/acceptancePolicyBot.test.js`)

- **Escenario 1 (Vacaciones + Fuente Top-1 E5 384 dims):** **PASS** (Café Montaña `18 días` citando `Politica_Vacaciones_Cafe_Montana.txt`; Logística Pacífico `24 días` citando `Manual_Vacaciones_Logistica_Pacifico.txt`, usando respaldo extractivo local tras fallar `HTTP 401` de `DEEPSEEK_API_KEY`).
- **Escenario 2 (Aislamiento Multiempresa):** **PASS** (`HTTP 404` en documento cruzado y cero fugas ante spoofing de `empresa_id`).
- **Escenario 3 (Sincronización Google Drive tras modificar documento):** **BLOQUEADO** (sin credenciales OAuth 2.0 reales ni cuenta Google conectada; el sistema ya no usa carpetas espejo locales ni cuentas de servicio).
- **Escenario 4 (Defensa contra Prompt Injection):** **PASS** (`Boletin_Sospechoso_Injection.txt` con `"365 días"` y `"JWT_SECRET"` neutralizado sin alterar respuesta ni filtrar secretos).
- **Escenario 5 (Control de Roles HTTP 403):** **PASS** (`colab@cafemontana.com` recibió `HTTP 403` en `POST /api/documentos/upload`, `GET /api/drive/oauth` y `POST /api/drive/sync`, y `HTTP 200` en chat).
- **Escenario 6 (Límite mensual del plan HTTP 429):** **PASS** (Plan Gratis de Café Montaña bloqueó la pregunta `#201` con `HTTP 429 Too Many Requests`).
- **Escenario 7 (Aborto de stream SSE en desconexión):** **PASS** (El cliente destruyó la conexión tras recibir `citations`; el backend abortó y registró `abortado = 1` en `mensajes`).

## 3. Seguridad y Validaciones Adicionales (`node backend/tests/securityAndRagPolicyBot.test.js`)

- **PASS:** Chunking `1500/200` verificado (6 fragmentos sobre 6851 chars) + sub-división de ventana E5 a `384` dims.
- **PASS:** Cifrado `AES-256-GCM` de tokens OAuth y parámetro `state` anti-CSRF de un solo uso verificados.
- **PASS:** Rechazo de archivo peligroso `.exe` (`HTTP 400`), cambio de plan por colaborador (`HTTP 403`) y borrado cross-tenant (`HTTP 404`).
