# ADR-0004: Arquitectura SaaS multiempresa (PolicyBot) sobre MySQL y BMW Premium Motors

- Estado: Aceptado (Actualizado 2026-11-16)
- Fecha original: 2026-11-16
- Decide: Equipo técnico del proyecto y responsable de negocio

## Contexto

El repositorio combina BMW Premium Motors (concesionario oficial) y el SaaS multiempresa PolicyBot RAG sobre Google Drive. Se requiere garantizar aislamiento multi-tenant completo, control por roles (`admin`, `colaborador`), cuotas SaaS (`Gratis` / `Pro`) y conexión OAuth 2.0 por empresa sin duplicar bases de datos.

## Decisión

1. **Aislamiento estricto por `empresa_id` derivado del JWT en MySQL (`bmw_premium_motors`):**
   - Tablas `planes`, `empresas`, `usuarios` (con `id_empresa` y `rol`), `documentos`, `fragmentos`, `mensajes` y `google_drive_connections`.
   - Toda consulta de documentos, fragmentos vectoriales, Drive OAuth, colaboradores e historial filtra obligatoriamente por `req.user.empresa_id` en el backend.
2. **Roles y cuotas SaaS:**
   - `roleMiddleware.js` restringe carga/borrado/reindexación documental, Drive OAuth/Sync y administración de plan/usuarios a `admin` (respondiendo `HTTP 403` a `colaborador`).
   - Planes `Gratis` (10 docs / 200 preguntas mensuales) y `Pro` (500 docs / 10,000 preguntas mensuales) con bloqueo `HTTP 429` al agotar la cuota mensual.
3. **Google Drive mediante OAuth 2.0 por empresa:**
   - Reemplaza el antiguo esquema de cuenta de servicio: cada empresa conecta su propia cuenta Google con `state` anti-CSRF, scopes mínimos (`drive.readonly`) y tokens cifrados con `AES-256-GCM` en `google_drive_connections`.

## Cómo se verifica

- `backend/src/database/migrations/004_policybot_multitenant_rag.sql` y `005_policybot_e5_384_oauth_drive.sql`.
- `backend/src/services/googleDriveService.js` y `backend/src/services/tokenCryptoService.js`.
- `backend/tests/acceptancePolicyBot.test.js` y `backend/tests/securityAndRagPolicyBot.test.js`.
