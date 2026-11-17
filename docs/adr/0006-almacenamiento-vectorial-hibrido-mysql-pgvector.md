# ADR-0006: Consolidación en MySQL único (reemplaza estrategia híbrida PostgreSQL + pgvector)

- Estado: Superseded / Actualizado (2026-11-16) — MySQL es la única base de datos del sistema
- Fecha: 2026-11-16
- Decide: Equipo técnico del proyecto

## Contexto histórico y reemplazo

Inicialmente se contempló una estrategia dual con PostgreSQL + `pgvector` (vectores de 1024 dimensiones) conviviendo con MySQL (`bmw_premium_motors`). Para simplificar el despliegue, evitar operar un segundo motor de base de datos y no alterar el entorno MySQL productivo de BMW Premium Motors, se consolidó toda la persistencia en MySQL.

## Decisión definitiva

1. **MySQL único (`bmw_premium_motors`):** Se eliminaron `pg`, `pgvector`, `pgVectorClient.js` y los scripts DDL de PostgreSQL. Todas las tablas de BMW y PolicyBot viven en MySQL a través de `backend/src/config/db.js`.
2. **Estrategia de almacenamiento JSON y ranking en Node.js:**
   - La tabla `fragmentos` almacena los vectores generados por `Xenova/multilingual-e5-small` en formato JSON de **384 dimensiones**, junto con las columnas `embedding_model`, `embedding_dimensions`, `embedding_version`, `indexed_at` e índice `FULLTEXT idx_fragmentos_contenido_ft`.
   - MySQL no se presenta como motor con índice vectorial HNSW nativo en esta solución: `ragService.js` filtra obligatoriamente los fragmentos en SQL por `WHERE f.id_empresa = ? AND f.embedding_dimensions = 384`, calcula la similitud coseno en Node.js y devuelve los 6 más relevantes (`TOP_K = 6`).
3. **Migración y reindexación:** `005_policybot_e5_384_oauth_drive.sql` y `ragService.reindexObsoleteEmbeddings()` regeneraron los vectores heredados de 1024 dimensiones a 384 dimensiones sin perder textos originales.
