# ADRs del proyecto

Este directorio recoge las decisiones arquitectónicas relevantes del sistema BMW Premium Motors.

- [ADR-0001: DeepSeek como proveedor generativo para BMW Genius AI y PolicyBot](./0001-modelo-y-proveedor-de-ia.md)
- [ADR-0002: Qué decide la IA y qué decide la persona](./0002-que-decide-la-ia.md)
- [ADR-0003: MySQL único y dónde viven los datos](./0003-donde-viven-los-datos.md)
- [ADR-0004: Arquitectura SaaS multiempresa (PolicyBot)](./0004-arquitectura-multiempresa-rag-policybot.md)
- [ADR-0005: Reemplazo de Claude/Voyage por DeepSeek y GPT-4o Vision](./0005-proveedores-ia-claude-voyage-coexistencia-deepseek.md)
- [ADR-0006: Consolidación en MySQL único (reemplaza estrategia híbrida pgvector)](./0006-almacenamiento-vectorial-hibrido-mysql-pgvector.md)
- [ADR-0007: Embeddings neuronales locales con multilingual-e5-small (384 dims)](./0007-embeddings-locales-multilingual-e5-small.md)

Las decisiones documentadas aquí deben consultarse antes de cambiar la arquitectura, la infraestructura, la gestión de datos o las automations con IA.
