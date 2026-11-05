# AUDITORÍA TÉCNICA Y ACADÉMICA — MINI PROYECTO 1 · DÍA 2
## BMW Premium Motors: CRUDs Completos, Relaciones Transaccionales y Autenticación JWT

- **Fecha de auditoría:** 2026-11-05
- **Proyecto auditado:** `BMW Premium Motors` (`c:/Users/dell5/UQV/Backend/BMW`)
- **Puertos verificados:** Backend `3001` · Frontend `5173` · MySQL `3306` (`bmw_premium_motors`)
- **Alcance de esta evaluación:** Cumplimiento integral del **Día 2** (25 endpoints CRUD empresariales protegidos, relaciones e integridad transaccional, entidad `usuarios`, `bcrypt`, `JWT`, `authMiddleware`, React `AuthContext`, rutas privadas, investigación JWT, DER actualizado, Postman y `README.md`).

---

## 1. Auditoría de los 25 Endpoints CRUD Empresariales (Criterio A — 30 pts)

Se inspeccionó el código de `routes/`, `controllers/` y `models/`, y se ejecutó una batería automatizada en vivo contra Express + MySQL (`bmw_premium_motors`). Los **25 endpoints CRUD empresariales** existen, están protegidos por `authMiddleware`, emplean consultas SQL parametrizadas (`pool.execute`), validan entradas con `express-validator` y retornan códigos semánticos reales (`200`, `201`, `400`, `401`, `404`, `409`):

| Entidad | `GET /` (Listar) | `GET /:id` (Detalle) | `POST /` (Crear) | `PUT /:id` (Actualizar) | `DELETE /:id` (Eliminar) | JOINs Descriptivos Verificados |
|---|---|---|---|---|---|---|
| **Modelos** (`/api/modelos`) | `200` Verificado | `200` / `404` Verificado | `201` / `400` / `409` Verificado | `200` / `404` / `409` Verificado | `200` / `409` Verificado | Conteo `total_vehiculos` y `vehiculos_disponibles`; lista de unidades en `GET /:id` |
| **Vehículos** (`/api/vehiculos`) | `200` Verificado | `200` / `404` Verificado | `201` / `400` / `409` Verificado | `200` / `404` / `409` Verificado | `200` / `409` Verificado | `INNER JOIN modelos` (`modelo_nombre`, `tipo_carroceria`, `combustible`, `transmision`) + `LEFT JOIN ventas` |
| **Clientes** (`/api/clientes`) | `200` Verificado | `200` / `404` Verificado | `201` / `400` / `409` Verificado | `200` / `404` / `409` Verificado | `200` / `409` Verificado | Conteo `total_compras` y detalle de vehículos adquiridos en `GET /:id` |
| **Vendedores** (`/api/vendedores`) | `200` Verificado | `200` / `404` Verificado | `201` / `400` / `409` Verificado | `200` / `404` / `409` Verificado | `200` / `409` Verificado | Cálculo `total_ventas`, `ingresos_generados` y ventas cerradas en `GET /:id` |
| **Ventas** (`/api/ventas`) | `200` Verificado | `200` / `404` Verificado | `201` / `400` / `409` Verificado | `200` / `404` / `409` Verificado | `200` / `404` Verificado | Quíntuple relación `INNER JOIN` (`ventas` + `vehiculos` + `modelos` + `clientes` + `vendedores`) |

*(No existe ningún dato simulado ni mock estático sustituyendo la persistencia en MySQL).*

---

## 2. Auditoría de Autenticación, `bcrypt`, JWT y Middleware (Criterio B — 25 pts)

### 2.1 Tabla `usuarios` y Migración Incremental
- Verificada en `information_schema.COLUMNS`: `id_usuario` (`int unsigned auto_increment PRI`), `nombre` (`varchar(100) NOT NULL`), `correo` (`varchar(120) NOT NULL UNI` vía `uq_usuarios_correo`), `password_hash` (`varchar(255) NOT NULL`) y `fecha_creacion` (`timestamp DEFAULT CURRENT_TIMESTAMP`).
- Gestionada mediante `backend/src/database/migrate.js` (`npm run db:migrate`) y `001_create_usuarios.sql`, con control de historial en `schema_migrations`. Probada en vivo con resultado idempotente (`appliedCount: 0, skippedCount: 1`) sin alterar tablas ni registros previos.

### 2.2 Cifrado de Contraseñas con `bcrypt`
- `authController.js` aplica `bcrypt.hash(password, 12)` (**12 salt rounds**, verificado en MySQL con prefijo `$2b$12$...`).
- `authRoutes.js` exige mínimo **8 caracteres** y máximo **72 bytes UTF-8** (`Buffer.byteLength(value, 'utf8') <= 72`), previniendo el truncamiento silencioso del algoritmo Blowfish.
- En login se utiliza `bcrypt.compare()` y un hash señuelo precalculado (`DUMMY_PASSWORD_HASH`) cuando el correo no existe para mitigar enumeración temporal de usuarios.
- Ni `usuarioModel.findPublicById` ni ningún endpoint (`/register`, `/login`, `/me`) expone jamás `password_hash`.

### 2.3 Emisión y Verificación Criptográfica de JWT (`tokenService.js`)
- `validateJwtConfig()` se ejecuta al iniciar el servidor (`server.js` línea 19): rechaza el arranque si `JWT_SECRET` falta, tiene menos de 32 caracteres o coincide con *placeholders* débiles. En `backend/.env` se verificó una clave configurada de 128 caracteres (sin imprimir su valor).
- Emisión con `jwt.sign({}, secret, { algorithm: 'HS256', expiresIn: '1h', issuer: 'bmw-premium-motors-api', audience: 'bmw-premium-motors-client', subject: String(idUsuario) })`.
- Payload auditado en vivo: contiene exclusivamente `{ sub, iat, exp, aud, iss }` (`exp - iat = 3600` s), con **cero datos sensibles**.
- Verificación con `jwt.verify(token, secret, { algorithms: ['HS256'], issuer, audience })`, bloqueando ataques `alg: "none"`, firmas manipuladas y tokens expirados (`TokenExpiredError`).

### 2.4 Protección Transversal con `authMiddleware.js` y Rate Limiting
- `authMiddleware.js` valida cabecera `Authorization: Bearer <token>`, verifica el JWT, comprueba que `sub` sea un entero positivo y **consulta en MySQL que el usuario siga existiendo activamente**, inyectando `req.user` y respondiendo `HTTP 401 { "error": "No autorizado" }` ante cualquier fallo.
- Montado sobre los routers completos en `app.js` (`/api/modelos`, `/api/vehiculos`, `/api/clientes`, `/api/vendedores`, `/api/ventas`, `/api/dashboard`) y en `GET /api/auth/me`. Se verificó en vivo el rechazo `401` en los **27 endpoints protegidos**.
- Incluye `express-rate-limit` en `/api/auth/register` y `/api/auth/login`.

---

## 3. Auditoría de Frontend en React (Criterio C — 20 pts)

- **Compilación y servidor de desarrollo verificados:** `npm run build` compiló limpiamente **1,686 módulos** en `5.19 s` sin errores ni advertencias críticas; Vite levantó en `http://127.0.0.1:5173/` y `/login` devolviendo `HTTP 200` con soporte SPA.
- **Almacenamiento seguro en memoria (`AuthContext.jsx` + `services/api.js`):** El proyecto optó por mantener `token` y `usuario` exclusivamente en memoria de React (`useState`) sincronizados con una variable privada de módulo en `api.js`. Un escaneo estático sobre los archivos ejecutables de `frontend/src/` confirmó **0 usos de `localStorage` o `sessionStorage`**.
- **Interceptores Axios (`services/api.js`):**
  - *Request interceptor:* inyecta `Authorization: Bearer <token>` únicamente si el destino coincide con el origen autorizado de la API (`isAuthorizedApiTarget`), evitando fugas de tokens a terceros.
  - *Response interceptor:* detecta respuestas `HTTP 401` fuera de login/registro, limpia el token en memoria y dispara redirección automática a `/login` con aviso de sesión expirada.
- **Vistas de Autenticación y Rutas (`Login.jsx`, `Registro.jsx`, `RutaProtegida.jsx`, `AppRoutes.jsx`):**
  - Formularios completos con validación cliente, estados de carga, `AlertBanner` de error y enlaces cruzados.
  - `<RutaProtegida />` envuelve el `<MainLayout />` y todas las páginas empresariales (`Dashboard`, `Modelos`, `Vehiculos`, `Clientes`, `Vendedores`, `Ventas`), impidiendo el montaje de vistas privadas sin sesión activa.
  - Cierre de sesión operativo tanto en `Topbar.jsx` como en `Sidebar.jsx`, limpiando token/usuario y redirigiendo a `/login`.
- **Módulos Empresariales y Selectores Relacionales:** Las 6 páginas empresariales implementan listados reales, búsqueda/filtros, modales de creación/edición (`*FormModal.jsx`), vistas de detalle (`*DetailModal.jsx`) y diálogo de confirmación de borrado (`ConfirmDialog.jsx`). Los selectores de modelos (`VehiculoFormModal.jsx`) y de vehículos disponibles, clientes y vendedores (`VentaFormModal.jsx` vía `Promise.all`) consumen directamente la API.
- **Distinción entre código inspeccionado y prueba en navegador:** Al no existir un *runner* automatizado de navegador/DOM (Playwright, Cypress o Vitest) en `frontend/package.json`, **14 de 16** subrequisitos de frontend quedaron `COMPLETADO Y VERIFICADO` (mediante compilación Vite, sondeo HTTP `:5173`, escaneo estático y verificación de contratos API) y **2 de 16** subrequisitos relativos a interacción humana/DOM en navegador real se registran rigurosamente como `IMPLEMENTADO, NO VERIFICADO`.

---

## 4. Relaciones, Reglas de Negocio y Transacciones SQL (Criterio D — 15 pts)

Todas las reglas empresariales fueron verificadas en código y probadas en vivo contra MySQL:
1. **Prohibición de marcar manualmente `Vendido`:** `POST /api/vehiculos` con `estado: "Vendido"` devolvió `HTTP 400`; `PUT /api/vehiculos/:id` intentando alterar el estado de un vehículo `Vendido` devolvió `HTTP 409`.
2. **Prohibición de vender unidades no disponibles:** `POST /api/ventas` sobre un vehículo `Reservado` devolvió `HTTP 409`; intentar una segunda venta sobre un vehículo `Vendido` devolvió `HTTP 409` (respaldado además por `uq_ventas_vehiculo` en MySQL).
3. **Transacciones SQL ACID con bloqueo pesimista (`ventaModel.js`):**
   - `createWithTransaction`: ejecuta `BEGIN`, bloquea la fila con `SELECT ... FOR UPDATE`, inserta la venta y actualiza `vehiculos.estado = 'Vendido'` antes de `COMMIT` (probado en vivo).
   - `updateWithTransaction`: al cambiar de vehículo en una venta, bloquea ambos vehículos en **orden determinista de ID** (previniendo *deadlocks*), libera el vehículo anterior a `'Disponible'` y marca el nuevo como `'Vendido'` (probado en vivo).
   - `deleteWithTransaction`: elimina la venta y restaura automáticamente el vehículo a `'Disponible'` dentro de la misma transacción (probado en vivo).
4. **Protección de integridad referencial (`HTTP 409`):** Intentar eliminar un modelo con vehículos, o un vehículo/cliente/vendedor con ventas asociadas, retornó `HTTP 409` explicativo en las cuatro pruebas en vivo.

---

## 5. Investigación JWT, DER Actualizado, Postman y Organización (Criterio E — 10 pts)

- **Investigación JWT (`docs/investigacion-jwt.md`):** Documento técnico exhaustivo de 300 líneas que desarrolla los **21 puntos requeridos** (RFC 7519, JWS vs. JWE, `Header`/`Payload`/`Signature`, `jwt.sign` y `jwt.verify` con lista blanca de algoritmos/issuer/audience, expiración, rotación y detección de robo en Refresh Tokens, tabla comparativa `localStorage` vs. `sessionStorage` vs. memoria `React Context` vs. cookies `HttpOnly`, riesgos XSS y CSRF, flujo de `authMiddleware`, `JWT_SECRET`, HTTPS y decisiones aplicadas al proyecto) e incluye las **8 fuentes técnicas oficiales** con enlaces reales verificados.
- **DER Actualizado (`docs/DER-dia-2.md` y `docs/DER-dia-2.mmd`):** Incluye las 5 entidades comerciales y la nueva tabla independiente `usuarios`, coincidiendo exactamente con `bmw_premium_motors`.
- **Colección y Entorno Postman (`docs/postman/`):** Colección v2.1 importable con **45 peticiones** organizadas en 9 carpetas, variables dinámicas (`{{baseUrl}}`, `{{token}}`, `{{idModelo}}`, `{{idVehiculo}}`, `{{idCliente}}`, `{{idVendedor}}`, `{{idVenta}}`) y guardado automático del JWT en el script *Tests* de `1.4 POST /auth/login`.
  - **Observación técnica en petición `1.9`:** El ítem `1.9 GET /auth/me — Acceso con token expirado (401)` emplea un token estático con firma simulada (`firmaExpiradaDePrueba...`) e `iss` con `P` mayúscula (`bmw-Premium-motors-api`). Aunque devuelve `401`, `jwt.verify()` lo rechaza en el paso de firma antes de evaluar `exp`. *(En las pruebas en vivo de esta auditoría sí se generó un token firmado con la clave real y `expiresIn: '-30s'`, confirmando que el backend maneja correctamente `TokenExpiredError` con `401`)*.
- **Observaciones menores de organización:**
  1. Coexisten dos directorios de middlewares en el backend: `backend/src/middleware/` (`errorHandler.js`, `validateRequest.js`) y `backend/src/middlewares/` (`authMiddleware.js`).
  2. `.gitignore` excluye correctamente `.env`, `backend/.env` y `frontend/.env`, pero falta ejecutar `git init` en la raíz del proyecto para activar el control de versiones Git.

---

## 6. Calificación Oficial del Día 2 (Sobre 100 Puntos)

| Criterio Oficial | Peso Máximo | Subrequisitos Evaluados | Estado Detallado | Puntaje Verificado | Implementación Detectada |
|---|---:|---:|---|---:|---:|
| **A. CRUD completos** | 30.00 pts | 25 | 25 Completados y Verificados (25/25 endpoints) | **30.00 pts** | 100.00% |
| **B. Autenticación** | 25.00 pts | 25 | 25 Completados y Verificados | **25.00 pts** | 100.00% |
| **C. Frontend** | 20.00 pts | 16 | 14 Verificados · 2 Implementados no verificados en navegador | **17.50 pts** | 100.00% |
| **D. Relaciones y validaciones** | 15.00 pts | 18 | 18 Completados y Verificados | **15.00 pts** | 100.00% |
| **E. Organización y documentación** | 10.00 pts | 20 | 17 Verificados · 3 Parciales (`middleware/s`, `git init`, Postman `1.9`) | **9.25 pts** | 92.50% |
| **TOTAL DÍA 2** | **100.00 pts** | **104** | **99 Verif. · 2 Impl. No Verif. · 3 Parciales · 0 Pend.** | **96.75 / 100** | **98.56%** |

---

## 7. Conclusión del Día 2

El **Día 2** alcanza un nivel de madurez técnica sobresaliente (**`96.75 / 100` puntos verificados** y **`98.56%` de implementación detectada**), con **cero fallos funcionales** en las 85 pruebas reales ejecutadas sobre seguridad JWT, cifrado `bcrypt`, validaciones, integridad referencial y transacciones SQL ACID. Los **3.25 puntos** restantes corresponden únicamente a la verificación automatizada en navegador real de 2 flujos interactivos de UI (`2.50 pts`) y a tres detalles menores de organización/documentación (`0.75 pts`).

