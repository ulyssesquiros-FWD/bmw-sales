# INFORME DE PRUEBAS REALES Y EVIDENCIAS — BMW PREMIUM MOTORS
## Registro de Ejecución Segura, Resultados HTTP/SQL e Inmutabilidad de MySQL

- **Fecha y hora de ejecución:** `2026-11-05` (`15:13:00 UTC` / `09:13:00 -06:00`)
- **Entorno auditado:** Windows · Node.js · Express (`127.0.0.1:3001`) · Vite v6.4.5 (`127.0.0.1:5173`) · MySQL 8+ (`localhost:3306`, esquema `bmw_premium_motors`).
- **Garantía de seguridad:** No se modificó `.env`, no se imprimieron secretos (`DB_PASSWORD`, `JWT_SECRET`, `password_hash`) y no se alteró ni eliminó ningún registro preexistente.

---

## 1. Resumen General de Ejecución de Pruebas

| Batería de Prueba | Ejecutadas | Exitosas | Fallidas | No Ejecutadas | Estado |
|---|---:|---:|---:|---:|---|
| **1. Escaneo estático de configuración, Postman y seguridad en React** | 3 | 3 | 0 | 0 | **100% ÉXITO** |
| **2. Compilación de producción Frontend (`vite build`)** | 1 | 1 | 0 | 0 | **100% ÉXITO** |
| **3. Sondeo HTTP en vivo del servidor Vite (`:5173`)** | 2 | 2 | 0 | 0 | **100% ÉXITO** |
| **4. Idempotencia de migraciones (`npm run db:migrate`) e `information_schema`** | 2 | 2 | 0 | 0 | **100% ÉXITO** |
| **5. Batería automatizada en vivo de Endpoints REST, Seguridad JWT y Transacciones SQL** | 85 | 85 | 0 | 0 | **100% ÉXITO** |
| **6. Verificación criptográfica `SHA-256` de inmutabilidad de MySQL (Pre vs. Post)** | 7 tablas | 7 tablas | 0 | 0 | **IDÉNTICO BIT A BIT** |
| **7. Pruebas interactivas E2E de clics en navegador real / Pruebas históricas Día 1** | 0 | — | — | 3 | **NO EJECUTADAS** *(ver Sección 5)* |
| **TOTAL DE VERIFICACIONES EJECUTADAS** | **100** | **100** | **0** | **3** | **0 FALLOS** |

---

## 2. Comandos Utilizados y Resultados Obtenidos

### 2.1 Verificación de Historial Git y Metadatos de Archivos
- **Comandos ejecutados:**
  ```powershell
  Get-ChildItem -Path "c:\Users\dell5\UQV\Backend\BMW" -Recurse -Force ...
  git status; git log --oneline -n 20
  ```
- **Resultado:**
  - `git status` devolvió `fatal: not a git repository: .git` (evidencia real de que falta `git init`).
  - Las marcas de tiempo NTFS confirmaron archivos originales del Día 1 (`04/11/2026`, incluyendo `schema.sql`, `initDatabase.js`, controladores y modelos empresariales) y ampliaciones del Día 2 (`05/11/2026`, incluyendo `001_create_usuarios.sql`, `migrate.js`, `tokenService.js`, `authMiddleware.js`, `AuthContext.jsx`, `Login.jsx` y `Registro.jsx`).

### 2.2 Compilación Productiva y Arranque de Vite (`Frontend`)
- **Comando de compilación:**
  ```powershell
  Set-Location frontend; npm run build
  ```
- **Resultado (`exit code 0`):**
  - `vite v6.4.5 building for production...`
  - `✓ 1686 modules transformed.`
  - Artefactos generados sin errores: `dist/index.html` (`0.44 kB`), `dist/assets/*.css` (`30.69 kB`) y `dist/assets/*.js` (`365.09 kB`) en `5.19 s`.
- **Sondeo HTTP al servidor de desarrollo (`http://127.0.0.1:5173`):**
  - `GET /` → `HTTP 200` (`<div id="root"></div>` presente).
  - `GET /login` → `HTTP 200` (fallback SPA operativo en React Router).
- **Auditoría estática de almacenamiento de sesión en `frontend/src/`:**
  - **0 llamadas ejecutables** a `localStorage` o `sessionStorage` en los 41 archivos fuente de React.

### 2.3 Auditoría de MySQL, Migración Idempotente y 85 Pruebas HTTP/SQL en Vivo
- **Ejecución sobre instancia real Express en puerto `3001` conectada a `bmw_premium_motors` (`localhost:3306`):**
  1. **Conexión y `JWT_SECRET`:** `connected: true`, `algorithm: "HS256"`, `expiresIn: "1h"`, `secretLengthValid: true` (`128` caracteres en `backend/.env` sin exponer su valor).
  2. **Migración incremental (`runMigrations()` / `npm run db:migrate`):** `appliedCount: 0`, `skippedCount: 1`, `usuariosExists: true`. Comprobado como **100% idempotente** y respetuoso de las tablas previas.
  3. **Inspección de `information_schema`:** 7 tablas en motor `InnoDB` con colación `utf8mb4_unicode_ci` (`modelos`, `vehiculos`, `clientes`, `vendedores`, `ventas`, `usuarios`, `schema_migrations`), 4 claves foráneas con `DELETE_RULE = RESTRICT` y `UPDATE_RULE = CASCADE`, 6 restricciones `UNIQUE` de negocio y 3 restricciones `CHECK` (`chk_vehiculos_vin_len`, `chk_vehiculos_precio_positivo`, `chk_ventas_precio_positivo`).

---

## 3. Desglose Completo de las 85 Pruebas HTTP + SQL Exitosas

| Rango de IDs | Categoría Auditada | Casos Probados en Vivo | Códigos Observados | Resultado |
|---|---|---|---:|---|
| **`#1`** | **Salud Pública** | `GET /api/health` sin token verificando `status: "UP"` y `tables_ready: true` | `200` | **1 / 1 OK** |
| **`#2` – `#28`** | **Protección sin Token (27 rutas)** | Peticiones sin cabecera `Authorization` a `GET /api/auth/me`, `GET /api/dashboard/resumen` y los **25 endpoints CRUD** (`modelos`, `vehiculos`, `clientes`, `vendedores`, `ventas`) | `401` (`x27`) | **27 / 27 OK** |
| **`#29` – `#36`** | **Registro, `bcrypt` y Login** | Registro válido (`201` + verificación SQL `$2b$12$` y ausencia de `password_hash`), correo duplicado (`400`), clave `<8` chars (`400`), clave `>72` bytes UTF-8 (`400`), clave errónea (`401`), correo inexistente (`401`), login válido (`200` + verificación de claims `HS256`, `ttl=3600s`, payload limpio) y `GET /api/auth/me` (`200`) | `201`, `400`, `401`, `200` | **8 / 8 OK** |
| **`#37` – `#40`** | **Ataques y Expiración JWT** | Firma manipulada (`401`), **token legítimamente firmado pero expirado (`expiresIn: '-30s'`)** (`401`), ataque `alg: "none"` (`401`) y token con `sub: 999999` inexistente en MySQL (`401`) | `401` (`x4`) | **4 / 4 OK** |
| **`#41`** | **Dashboard Protegido** | `GET /api/dashboard/resumen` con Bearer token válido (`moneda: "USD"`, `total_vehiculos: 13`) | `200` | **1 / 1 OK** |
| **`#42` – `#48` + `#83`** | **CRUD Completo `modelos`** | Crear modelo temporal (`201`), nombre duplicado (`409`), campos vacíos (`400`), listar (`200`), detalle por ID (`200`), ID inexistente (`404`), actualizar (`200`) y eliminar tras liberar hijos (`200`) | `201`, `409`, `400`, `200`, `404` | **8 / 8 OK** |
| **`#49` – `#56` + `#82`** | **CRUD Completo `vehiculos` y Reglas** | Crear vehículo temporal (`201`), bloqueo manual `estado: "Vendido"` (`400`), `id_modelo` inexistente (`400`), VIN duplicado (`409`), listar con `JOIN` (`200`), detalle (`200`), ID inexistente (`404`), actualizar (`200`) y eliminar (`200`) | `201`, `400`, `409`, `200`, `404` | **9 / 9 OK** |
| **`#57` – `#62` + `#84`** | **CRUD Completo `clientes`** | Crear cliente temporal (`201`), identificación duplicada (`409`), listar con `total_compras` (`200`), detalle (`200`), ID inexistente (`404`), actualizar (`200`) y eliminar (`200`) | `201`, `409`, `200`, `404` | **7 / 7 OK** |
| **`#63` – `#68` + `#85`** | **CRUD Completo `vendedores`** | Crear vendedor temporal (`201`), correo duplicado (`409`), listar con ingresos (`200`), detalle (`200`), ID inexistente (`404`), actualizar (`200`) y eliminar (`200`) | `201`, `409`, `200`, `404` | **7 / 7 OK** |
| **`#69` – `#75` + `#80` – `#81`** | **CRUD Transaccional `ventas`** | Rechazo de vehículo `Reservado` (`409`), `id_cliente` inexistente (`400`), venta exitosa cambiando vehículo a `Vendido` (`201`), rechazo de segunda venta sobre vehículo `Vendido` (`409`), listar con quíntuple `JOIN` (`200`), detalle (`200`), ID inexistente (`404`), `PUT /ventas/:id` intercambiando unidades (`veh1 -> Disponible`, `veh2 -> Vendido`, `200`) y `DELETE /ventas/:id` restaurando `veh2 -> Disponible` (`200`) | `409`, `400`, `201`, `200`, `404` | **9 / 9 OK** |
| **`#76` – `#79`** | **Integridad Referencial (`409`)** | Bloqueo de eliminación de modelo con vehículos (`409`), vehículo con venta (`409`), cliente con venta (`409`) y vendedor con venta (`409`) | `409` (`x4`) | **4 / 4 OK** |

---

## 4. Evidencia Criptográfica de No Destructividad en MySQL (`SHA-256`)

Todos los registros temporales identificados como auditoría (`BMW Audit M-*`, `WBAAUDIT*`, `AUD-*`, `asesor.audit.*`, `auditor.temporal.*`) fueron limpiados de forma controlada al concluir la suite. Se calculó el resumen `SHA-256` del contenido completo de cada tabla antes y después de la auditoría:

| Tabla en `bmw_premium_motors` | Filas Antes | Hash `SHA-256` Antes de Pruebas | Filas Después | Hash `SHA-256` Después de Pruebas | Integridad |
|---|---:|---|---:|---|---|
| `modelos` | 10 | `e9e5ac5e746a094db0a2c25631ab25ff9d4f2e0a630ce258f8c3da8327c4d974` | 10 | `e9e5ac5e746a094db0a2c25631ab25ff9d4f2e0a630ce258f8c3da8327c4d974` | **IDÉNTICO** |
| `vehiculos` | 13 | `87d39b7351d02f3fa6bde1d5203fc6a5fd78c0628eab8ce842496f494a9137b2` | 13 | `87d39b7351d02f3fa6bde1d5203fc6a5fd78c0628eab8ce842496f494a9137b2` | **IDÉNTICO** |
| `clientes` | 5 | `60fd780f98fefc68d8d8296e34c6c1f4e86a933d5b0d71ef289d51a50871b462` | 5 | `60fd780f98fefc68d8d8296e34c6c1f4e86a933d5b0d71ef289d51a50871b462` | **IDÉNTICO** |
| `vendedores` | 4 | `1bd6dc337f596bb41d23bf878402e4d0878141adeb633d7145a5a08e7344a0b0` | 4 | `1bd6dc337f596bb41d23bf878402e4d0878141adeb633d7145a5a08e7344a0b0` | **IDÉNTICO** |
| `ventas` | 2 | `6a2bacde5c3da275546274cf357f98fd05f61eecd4d1ccdabde3634782afe1e8` | 2 | `6a2bacde5c3da275546274cf357f98fd05f61eecd4d1ccdabde3634782afe1e8` | **IDÉNTICO** |
| `usuarios` | 1 | `cfc39c461404e4d75c5a1843b79da0438359243202eb21c1625f29f5c53539b3` | 1 | `cfc39c461404e4d75c5a1843b79da0438359243202eb21c1625f29f5c53539b3` | **IDÉNTICO** |
| `schema_migrations` | 1 | `3cda9e201d062f1ae187c06ea6e77bba0ed732022d7c98d2c821f8d4ab0f79a8` | 1 | `3cda9e201d062f1ae187c06ea6e77bba0ed732022d7c98d2c821f8d4ab0f79a8` | **IDÉNTICO** |

---

## 5. Pruebas No Ejecutadas y Limitaciones del Entorno

1. **Interacción DOM automatizada en navegador real (`D2-C15` y `D2-C16`):**
   - **Motivo:** `frontend/package.json` no incluye un motor de automatización de navegador o renderizado DOM (como Playwright, Cypress o Vitest + React Testing Library), y conforme a las reglas de esta primera auditoría estaba prohibido instalar paquetes nuevos o alterar `package.json`.
   - **Qué sí se verificó:** Compilación completa de los 1,686 módulos (`npm run build`), respuesta `HTTP 200` del servidor Vite en `:5173/` y `:5173/login`, inspección línea por línea de los 41 archivos de React y coincidencia exacta de contratos con los 30 endpoints del backend.
2. **Reproducción histórica de Postman al cierre del Día 1 (`D1-D10` y `D1-D11`):**
   - **Motivo:** Al no haberse inicializado Git (`git init`) durante el Día 1 y haberse actualizado las rutas en el Día 2 para exigir `authMiddleware`, no existe una instantánea histórica ni capturas fechadas el `04/11/2026` de las pruebas sin autenticación.

