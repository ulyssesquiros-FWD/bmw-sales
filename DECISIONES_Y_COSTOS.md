# Decisiones Técnicas y Análisis de Costos — PolicyBot (MySQL + DeepSeek + GPT-4o Vision + E5 Local)

---

## 1. Decisiones Técnicas Definitivas

1. **Unificación en DeepSeek (`deepseek-flash`):** Consolidar BMW Genius AI y PolicyBot RAG en [`deepseekService.js`](file:///C:/Users/dell5/UQV/Backend/BMW/backend/src/services/deepseekService.js) elimina la necesidad de mantener SDKs y suscripciones separadas manteniendo contextos e historiales aislados por aplicación y `id_empresa`.
2. **Embeddings 100% locales sin costo por token (`Xenova/multilingual-e5-small`):** La ejecución local ONNX con `@huggingface/transformers` genera vectores de 384 dimensiones reales en español utilizando los prefijos oficiales `passage:` y `query:`, con costo de API de **$0.00 USD** tanto en indexación masiva como en búsquedas.
3. **GPT-4o Vision bajo demanda estricta:** [`visionService.js`](file:///C:/Users/dell5/UQV/Backend/BMW/backend/src/services/visionService.js) solo se invoca cuando un documento es una imagen o un PDF escaneado sin texto extraíble (menos de 25 caracteres legibles por página), evitando costos de visión artificial en PDFs nativos, DOCX o TXT.
4. **MySQL único con ranking coseno en Node.js:** Se descarta operar un segundo motor de base de datos. Cada consulta SQL filtra `WHERE f.id_empresa = ? AND f.embedding_dimensions = 384`, carga únicamente los fragmentos de la empresa autenticada, calcula la similitud coseno en Node.js y entrega los 6 mejores (`TOP_K = 6`) a DeepSeek.
5. **Seguridad OAuth 2.0 y Anti-Prompt Injection:** Los tokens de Google Drive se cifran con `AES-256-GCM`, el flujo OAuth valida un `state` aleatorio de un solo uso y todo contexto documental se encapsula como dato no confiable (`<contexto_documental_no_confiable>`).

---

## 2. Análisis de Costos Mensuales Estimados (Referencial — Pendiente de confirmar facturación final)

- **Embeddings (`Xenova/multilingual-e5-small` local):** **$0.00 USD / mes** (cómputo local en servidor Node.js, caché en disco).
- **Base de datos vectorial (MySQL existente):** **$0.00 USD adicionales** (reutiliza `bmw_premium_motors`).
- **Chat Generativo RAG (DeepSeek `deepseek-flash`):**
  - Consumo promedio por pregunta: ~2,400 tokens de entrada (system prompt + Top-6 fragmentos + historial) y ~300 tokens de salida.
  - Plan **Gratis** (200 preguntas/mes): consumo estimado de ~$0.05 – $0.15 USD/mes según tarifa vigente de DeepSeek (`Pendiente de confirmar` precio exacto de `deepseek-flash`).
  - Plan **Pro** (10,000 preguntas/mes máximo): consumo estimado de ~$2.50 – $7.50 USD/mes al 100% del tope mensual.
- **OpenAI GPT-4o Vision:** Costo variable aplicable **únicamente** por página escaneada o imagen enviada (`Pendiente de confirmar` volumen de documentos escaneados por cliente).

Este cambio de arquitectura reduce drásticamente el costo por documento indexado a **$0.00 USD** y el costo por consulta RAG frente a soluciones comerciales externas.
