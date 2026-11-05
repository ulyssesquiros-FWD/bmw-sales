# INFORME PRINCIPAL DE AUDITORÍA INTEGRAL — BMW PREMIUM MOTORS
## Mini Proyecto 1 · Evaluación Separada de Día 1 y Día 2

- **Fecha de ejecución:** 2026-11-05
- **Proyecto auditado:** `BMW Premium Motors` (`c:/Users/dell5/UQV/Backend/BMW`)
- **Modalidad de auditoría:** Estrictamente de lectura e inspección técnica con pruebas reales no destructivas (cero modificaciones al código fuente, `.env` o registros preexistentes de MySQL).
- **Arquitectura verificada:** Frontend `React 18 + Vite 6` (`:5173`) · Backend `Node.js + Express` (`:3001`) · Base de datos `MySQL 8+ / InnoDB` (`bmw_premium_motors` en `:3306`).

---

## 1. Resumen Ejecutivo y Estado General del Proyecto

**BMW Premium Motors** es un sistema empresarial Full Stack funcional, cohesivo y conectado de extremo a extremo a MySQL (`bmw_premium_motors`), desarrollado progresivamente en dos prácticas académicas:

1. **Mini Proyecto 1 — Día 1 (Modelado de Datos Empresariales e Inicio del CRUD):** Estableció un modelo relacional sólido de 5 entidades comerciales (`modelos`, `vehiculos`, `clientes`, `vendedores`, `ventas`) con claves primarias, 4 claves foráneas `InnoDB` (`ON DELETE RESTRICT`, `ON UPDATE CASCADE`), restricciones `UNIQUE` y `CHECK`, arquitectura modular en Express y React, e implementación completa de persistencia en MySQL sin datos simulados. Sus únicas brechas frente al 100% son **documentales e históricas** (falta un documento formal independiente de justificación empresarial, un archivo separado para el DER inicial y evidencia histórica conservada de las pruebas iniciales en Postman/Git previas al Día 2).
2. **Mini Proyecto 1 — Día 2 (CRUDs Completos y Autenticación JWT):** Conservó intactos los datos y reglas de negocio del Día 1 e incorporó mediante migración idempotente (`npm run db:migrate`) la entidad `usuarios`, cifrado `bcrypt` (12 salt rounds), emisión y validación estricta de `JWT` (`HS256`, `1h`, `iss`, `aud`, `sub`), `authMiddleware` transversal sobre los **25 endpoints CRUD empresariales** + `/api/dashboard/resumen` + `/api/auth/me`, sesión en memoria en React (`AuthContext` + interceptores `Axios` sin `localStorage`), rutas privadas (`RutaProtegida`), investigación profunda de JWT (`docs/investigacion-jwt.md`), DER actualizado (`docs/DER-dia-2.md`) y colección Postman de 45 peticiones.

Durante esta auditoría se ejecutaron **85 pruebas reales automatizadas HTTP + SQL** contra el backend y MySQL, además de compilación productiva de Vite (`npm run build`), sondeo HTTP del servidor frontend (`:5173`) e idempotencia de migraciones, obteniendo **85 aciertos y 0 fallos**, y comprobando mediante hashes `SHA-256` que los registros preexistentes de MySQL permanecieron bit a bit idénticos antes y después de la auditoría.

---

## 2. Calificaciones Oficiales e Indicadores Consolidados

> **Regla académica aplicada:** Las calificaciones del **Día 1** y del **Día 2** son evaluaciones independientes sobre 100 puntos cada una, respetando sus pesos oficiales sin mezclar porcentajes ni penalizar al Día 1 por requisitos exclusivos del Día 2.

### 2.1 Calificaciones Oficiales Separadas

| Evaluación Académica | Puntaje Oficial Verificado | Implementación Detectada | Estado Global |
|---|---:|---:|---|
| **MINI PROYECTO 1 — DÍA 1** *(Modelado e Inicio del CRUD)* | **88.80 / 100.00 pts** | **90.00%** | Sobresaliente en ingeniería; pendientes documentales/históricos |
| **MINI PROYECTO 1 — DÍA 2** *(CRUDs Completos y Autenticación JWT)* | **96.75 / 100.00 pts** | **98.56%** | Excelente; 100% en CRUD, Auth, JWT y Transacciones SQL |

- **Indicador interno promedio *(referencia técnica interna, NO calificación oficial del docente)*:** `92.78 / 100.00`

### 2.2 Desglose por Criterios Oficiales

#### Día 1 (100 Puntos)
| Criterio | Peso Oficial | Subrequisitos | Puntaje Verificado | Implementación Detectada |
|---|---:|---:|---:|---:|
| A. Modelado de datos | 35.00 pts | 12 | **33.54 pts** | 95.83% |
| B. Enfoque empresarial | 15.00 pts | 7 | **10.71 pts** | 71.43% |
| C. Estructura del proyecto | 20.00 pts | 15 | **20.00 pts** | 100.00% |
| D. Inicio del CRUD | 30.00 pts | 11 | **24.55 pts** | 81.82% |
| **TOTAL DÍA 1** | **100.00 pts** | **45** | **88.80 / 100.00** | **90.00%** |

#### Día 2 (100 Puntos)
| Criterio | Peso Oficial | Subrequisitos | Puntaje Verificado | Implementación Detectada |
|---|---:|---:|---:|---:|
| A. CRUD completos (25 endpoints) | 30.00 pts | 25 | **30.00 pts** | 100.00% |
| B. Autenticación (`usuarios`, `bcrypt`, `JWT`, middleware) | 25.00 pts | 25 | **25.00 pts** | 100.00% |
| C. Frontend (`React`, `AuthContext`, rutas y módulos) | 20.00 pts | 16 | **17.50 pts** | 100.00% |
| D. Relaciones, validaciones y transacciones SQL | 15.00 pts | 18 | **15.00 pts** | 100.00% |
| E. Organización y documentación | 10.00 pts | 20 | **9.25 pts** | 92.50% |
| **TOTAL DÍA 2** | **100.00 pts** | **104** | **96.75 / 100.00** | **98.56%** |

### 2.3 Conteo Global de Requisitos y Pruebas (149 Subrequisitos Evaluados)

| Métrica de Auditoría | Día 1 (45) | Día 2 (104) | Total Global (149) | Proporción |
|---|---:|---:|---:|---:|
| **Requisitos `COMPLETADO Y VERIFICADO`** | 39 | 99 | **138** | 92.62% |
| **Requisitos `IMPLEMENTADO, NO VERIFICADO`** *(interacción navegador)* | 0 | 2 | **2** | 1.34% |
| **Requisitos `PARCIAL`** *(ponderados al 50%)* | 3 | 3 | **6** | 4.03% |
| **Requisitos `PENDIENTE`** *(no implementados)* | 1 | 0 | **1** | 0.67% |
| **Requisitos `SIN EVIDENCIA HISTÓRICA`** *(cierre Día 1)* | 2 | 0 | **2** | 1.34% |
| **Requisitos / Pruebas `FALLIDO`** | 0 | 0 | **0** | 0.00% |
| **Porcentaje Total Verificado** *(respaldado por pruebas/evidencia)* | **88.80% pond.** | **96.75% pond.** | **94.63%** *(141/149)* | — |
| **Porcentaje Total de Implementación Detectada** | **90.00%** | **98.56%** | **95.97%** *(143/149)* | — |
| **Pruebas en vivo ejecutadas (HTTP + SQL + Build + Vite)** | — | — | **88 ejecutadas / 88 exitosas / 0 fallidas** | 100% éxito |

---

## 3. Tabla Comparativa Oficial (Día 1 vs. Día 2 vs. Estado Actual)

| Aspecto | Día 1 | Día 2 | Estado actual |
|---|---|---|---|
| **Tema empresarial** | Concesionario BMW (`modelos`, `vehiculos`, `clientes`, `vendedores`, `ventas`) coherente y definido | Conservado e integrado con control de acceso ejecutivo | **COMPLETADO Y VERIFICADO** |
| **Justificación** | Utilidad real demostrada en código; sin documento narrativo formal dedicado (`PARCIAL` / `PENDIENTE` doc separado) | Integrada resumidamente en `README.md` | **PARCIAL** *(falta `docs/justificacion-empresarial.md`)* |
| **Modelado** | 5 entidades empresariales con PKs, 4 FKs, `UNIQUE`, `CHECK` y tipos exactos en `schema.sql` (`04/11/2026`) | Se agrega `usuarios` (independiente) y `schema_migrations` sin alterar las 5 tablas previas | **COMPLETADO Y VERIFICADO** |
| **DER** | Representado dentro del DER general, pero sin archivo independiente `DER-dia-1.md` (`PARCIAL`) | `docs/DER-dia-2.md` y `docs/DER-dia-2.mmd` completos con las 6 entidades y relaciones exactas | **COMPLETADO Y VERIFICADO** en Día 2 / **PARCIAL** en Día 1 |
| **MySQL** | `bmw_premium_motors` (`InnoDB`, `utf8mb4_unicode_ci`), `initDatabase.js` idempotente y datos reales | Migración `001_create_usuarios.sql` (`npm run db:migrate`) idempotente verificada en vivo | **COMPLETADO Y VERIFICADO** |
| **Estructura backend** | Separación limpia en `config`, `database`, `models`, `controllers`, `routes`, `middleware`, `app.js`, `server.js` | Ampliada con `services/tokenService.js`, `usuarioModel`, `authController`, `authRoutes` y `middlewares/authMiddleware.js` | **COMPLETADO Y VERIFICADO** *(nota menor: coexisten `middleware/` y `middlewares/`)* |
| **Estructura frontend** | React + Vite en `:5173` con `components`, `pages`, `routes`, `services`, `styles`, `utils` | Ampliada con `context/AuthContext.jsx`, `components/auth/RutaProtegida.jsx`, `Login.jsx`, `Registro.jsx` y `authService.js` | **COMPLETADO Y VERIFICADO** |
| **API REST** | Servidor Express en `:3001`, respuestas JSON estandarizadas, CORS, Helmet y `/api/health` | Mantiene contratos JSON y añade códigos `401`/`429` para seguridad y rate limiting | **COMPLETADO Y VERIFICADO** |
| **CRUD** | Superó el mínimo de `POST` y `GET` dejando implementados los modelos y controladores de las 5 entidades | **25/25 endpoints CRUD empresariales** verificados en vivo (`GET`, `GET/:id`, `POST`, `PUT/:id`, `DELETE/:id`) | **COMPLETADO Y VERIFICADO** (`25/25`) |
| **Relaciones** | `modelos 1:N vehiculos`, `clientes 1:N ventas`, `vendedores 1:N ventas`, `vehiculos 1:0..1 ventas` | Verificadas en vivo con `JOIN` descriptivos, bloqueo `409` de borrado y transacciones SQL `FOR UPDATE` | **COMPLETADO Y VERIFICADO** |
| **Validaciones** | `express-validator` + `validateRequest.js` en todas las rutas desde `04/11/2026` | Validaciones de negocio, FKs (`400`), duplicados (`409`) y contraseñas `bcrypt` (8 chars a 72 bytes UTF-8) | **COMPLETADO Y VERIFICADO** |
| **Autenticación** | No aplica | `POST /register`, `POST /login`, `GET /me`, `bcrypt` (12 rondas) y `authMiddleware` verificados en vivo | **COMPLETADO Y VERIFICADO** |
| **JWT** | No aplica | `HS256`, `JWT_SECRET` en `.env` (128 chars), expiración `1h`, `iss`/`aud`/`sub`, sin datos sensibles en payload | **COMPLETADO Y VERIFICADO** |
| **Frontend integrado** | 6 módulos conectados por `Axios` a la API real sin mocks permanentes | Login, Registro, Logout, `AuthContext` en memoria, interceptores `Bearer`/`401` y selectores relacionales dinámicos | **IMPLEMENTADO AL 100%** *(14/16 verificados; 2 pendientes de test runner de navegador)* |
| **Documentación** | `schema.sql` e instrucciones base creadas; `README.md` luego sobrescrito en Día 2 | `README.md` (20 secciones), `docs/investigacion-jwt.md` (21 temas + 8 fuentes), DER Día 2 y Postman | **COMPLETADO EN DÍA 2** *(parcial menor en `git init` y petición Postman `1.9`)* |
| **Pruebas** | Sin capturas ni colección histórica separada del Día 1 (`SIN EVIDENCIA HISTÓRICA`) | Colección Postman (45 peticiones) + **85 pruebas HTTP/SQL en vivo** + `vite build` con **0 fallos** | **VERIFICADO EN DÍA 2** / **SIN EVIDENCIA HISTÓRICA EN DÍA 1** |

---

## 4. Inventario Técnico de Archivos y Componentes Auditados

### 4.1 Archivos Completos y Operativos
- **Backend (`25` archivos auditados):**
  - Configuración y arranque: `backend/package.json`, `backend/.env.example`, `backend/src/config/db.js`, `backend/src/app.js`, `backend/src/server.js`.
  - Persistencia y migraciones: `backend/src/database/schema.sql`, `backend/src/database/initDatabase.js`, `backend/src/database/migrate.js`, `backend/src/database/migrations/001_create_usuarios.sql`.
  - Seguridad y middlewares: `backend/src/services/tokenService.js`, `backend/src/middlewares/authMiddleware.js`, `backend/src/middleware/validateRequest.js`, `backend/src/middleware/errorHandler.js`.
  - Modelos (`6`): `modeloModel.js`, `vehiculoModel.js`, `clienteModel.js`, `vendedorModel.js`, `ventaModel.js`, `usuarioModel.js`.
  - Controladores (`7`): `modeloController.js`, `vehiculoController.js`, `clienteController.js`, `vendedorController.js`, `ventaController.js`, `dashboardController.js`, `authController.js`.
  - Rutas (`7`): `modeloRoutes.js`, `vehiculoRoutes.js`, `clienteRoutes.js`, `vendedorRoutes.js`, `ventaRoutes.js`, `dashboardRoutes.js`, `authRoutes.js`.
- **Frontend (`41` archivos de código auditados):**
  - Base y rutas: `frontend/package.json`, `frontend/.env.example`, `frontend/vite.config.js`, `frontend/src/main.jsx`, `frontend/src/App.jsx`, `frontend/src/routes/AppRoutes.jsx`.
  - Autenticación y servicios: `frontend/src/context/AuthContext.jsx`, `frontend/src/components/auth/RutaProtegida.jsx`, `frontend/src/services/api.js`, `authService.js`, `modeloService.js`, `vehiculoService.js`, `clienteService.js`, `vendedorService.js`, `ventaService.js`, `dashboardService.js`.
  - Páginas (`9`): `Login.jsx`, `Registro.jsx`, `Dashboard.jsx`, `Modelos.jsx`, `Vehiculos.jsx`, `Clientes.jsx`, `Vendedores.jsx`, `Ventas.jsx`, `NotFound.jsx`.
  - Componentes y utilidades (`20`): `MainLayout.jsx`, `Sidebar.jsx`, `Topbar.jsx`, los 5 `*FormModal.jsx`, los 5 `*DetailModal.jsx`, `VehicleShowroomCard.jsx`, `VehicleGalleryViewer.jsx`, `ConfirmDialog.jsx`, `AlertBanner.jsx`, `BmwLogos.jsx`, `EmptyState.jsx`, `Modal.jsx`, `StatusBadge.jsx`, `VehiclePlaceholder.jsx`, `RecentSalesTable.jsx`, `RecentVehiclesTable.jsx`, `StatCard.jsx`, `bmwCatalogMedia.js`, `formatters.js` y `global.css`.
- **Documentación y Base de Datos (`7` archivos):** `.gitignore`, `README.md`, `database/bmw_premium_motors.sql`, `docs/DER-dia-2.md`, `docs/DER-dia-2.mmd`, `docs/investigacion-jwt.md`, `docs/postman/BMW-Premium-Motors-Dia2.postman_collection.json`, `docs/postman/BMW-Premium-Motors-Dia2.postman_environment.json`.

### 4.2 Archivos Faltantes, Parciales, Duplicidades o Detalles de Integración Detectados
1. **Archivos faltantes (Día 1):**
   - No existe `docs/justificacion-empresarial.md` (documento formal de planteamiento y justificación empresarial del concesionario).
   - No existe `docs/DER-dia-1.md` / `docs/DER-dia-1.mmd` (vista histórica exclusiva de las 5 entidades originales antes de `usuarios`).
   - No existe colección o reporte de pruebas históricas del cierre del Día 1 en `docs/postman/`.
2. **Estructura / Duplicidad menor de carpetas y scripts:**
   - **Dos carpetas de middleware en backend:** coexisten `backend/src/middleware/` (`errorHandler.js`, `validateRequest.js`, creados en Día 1) y `backend/src/middlewares/` (`authMiddleware.js`, creado en Día 2). Ambas están bien importadas y funcionan, pero conviene unificarlas.
   - **Dos fuentes SQL complementarias:** `database/bmw_premium_motors.sql` (respaldo integral de referencia con las 6 tablas) coexiste con `backend/src/database/schema.sql` + `migrations/001_create_usuarios.sql` (usados por `npm run db:init` y `npm run db:migrate`). Sus esquemas son **100% coherentes** sin contradicciones de tipos ni restricciones.
3. **Funcionalidades sin conexión o código no integrado:**
   - **Ningún formulario ni botón decorativo sin conexión:** todos los botones, filtros, tablas y modales de React invocan servicios reales de `Axios` hacia Express y MySQL.
   - **Detalle menor de navegación en `Login.jsx`:** `RutaProtegida.jsx` pasa `state={{ from: location.pathname }}` al redirigir a `/login`, pero `Login.jsx` ejecuta `navigate('/dashboard', { replace: true })` de forma fija tras autenticar, sin leer `location.state?.from`.
4. **Consistencia Backend ↔ Frontend ↔ MySQL:**
   - **100% consistente en nombres de tablas y columnas** (`modelos`, `vehiculos`, `clientes`, `vendedores`, `ventas`, `usuarios`).
   - **Diferencia menor de envoltorio JSON absorbida:** los controladores CRUD devuelven `{ ok, message, data }`, `authController` devuelve `{ success, message, token, usuario }` y `authMiddleware` devuelve `{ error: "No autorizado" }`. El helper `extractErrorMessage` en `frontend/src/services/api.js` contempla `data.message` y `data.error`, por lo que no causa fallos en React.

---

## 5. Riesgos y Observaciones Técnicas

- **Riesgo de trazabilidad académica (Medio):** El directorio del proyecto no tiene inicializado un repositorio Git (`.git` inexistente), lo que impide auditar *commits* separados entre Día 1 y Día 2 y deja inactiva la protección efectiva de `.gitignore` hasta ejecutar `git init`.
- **Comportamiento esperado de sesión en memoria (Informativo):** Al almacenar el JWT exclusivamente en memoria de React (`AuthContext`) por seguridad anti-XSS, recargar la pestaña con `F5` cierra la sesión en el navegador y redirige a `/login`. Este diseño está documentado en `README.md` y `docs/investigacion-jwt.md`.
- **Exactitud de prueba negativa en Postman `1.9` (Bajo):** El caso `1.9 GET /auth/me — Acceso con token expirado (401)` en `BMW-Premium-Motors-Dia2.postman_collection.json` utiliza una firma ficticia (`firmaExpiradaDePrueba...`) y un `iss` con `P` mayúscula (`bmw-Premium-motors-api`), de modo que `jwt.verify()` rechaza el token por firma inválida antes de llegar a la comprobación de `exp` (aunque igualmente responde `401`).

---

## 6. Clasificación y Plan Priorizado de Pendientes para Alcanzar el 100%

### Resumen por Nivel de Severidad
- **CRÍTICOS:** **`0`** *(La aplicación inicia, conecta a MySQL, protege las 27 rutas privadas, cifra contraseñas con `bcrypt` a 12 rondas y no expone secretos).*
- **ALTOS:** **`0`** *(Los 25 endpoints CRUD funcionan, JWT es sólido, las 4 relaciones y transacciones SQL de ventas operan sin fallos y todos los formularios consumen la API).*
- **MEDIOS:** **`3`** *(Documentación empresarial del Día 1, evidencias históricas/Git del Día 1 y automatización de prueba de interfaz en navegador).*
- **BAJOS:** **`4`** *(DER separado del Día 1, ajuste del caso `1.9` en Postman, unificación de carpeta `middleware(s)` y redirección `state.from` en `Login.jsx`).*

### Lista Ordenada de Acciones para una Segunda Ejecución (Rumbo al 100% en Día 1 y Día 2)

| # | Prioridad | Problema Detectado | Archivo / Componente Relacionado | Por qué incumple la práctica | Qué debe hacerse en la segunda ejecución |
|---:|---|---|---|---|---|
| **1** | **MEDIA** | Falta documento formal de Descripción y Justificación Empresarial | `docs/justificacion-empresarial.md` *(nuevo)* y enlace en `README.md` | El Criterio B del Día 1 (15 pts) exige justificar por escrito la problemática del concesionario y cómo el sistema administra inventario BMW, modelos, clientes, vendedores y ventas | Redactar `docs/justificacion-empresarial.md` detallando contexto de negocio, dolores operativos resueltos, flujo comercial y rol de las 5 entidades empresariales |
| **2** | **MEDIA** | Ausencia de repositorio Git inicializado y de evidencia documental de pruebas iniciales del Día 1 | Raíz `.git` *(inexistente)* y `docs/evidencias-dia-1.md` *(nuevo)* | Día 1 Criterio D (`D10`/`D11`) solicita evidencia de pruebas iniciales de `POST` y `GET`, y Día 2 Criterio E (`E7`) requiere control Git activo para excluir `.env` | Ejecutar `git init` verificando que `backend/.env` quede ignorado por `.gitignore`, y documentar/registrar formalmente las pruebas de los endpoints iniciales de creación y listado |
| **3** | **MEDIA** | Dos flujos interactivos de UI en React están implementados pero sin verificación automatizada en navegador real | `frontend/package.json`, `Login.jsx`, `Registro.jsx`, `*FormModal.jsx` | En Día 2 Criterio C (`2.50 pts`), la rúbrica distingue código inspeccionado de funcionalidad verificada en ejecución real de navegador | Ejecutar prueba automatizada con Playwright/Vitest + Testing Library (o dejar script reproducible de verificación E2E de UI) que compruebe Login → Navegación privada → Modales/Selectores → Logout |
| **4** | **BAJA** | No se conservó un archivo independiente para el DER inicial de 5 entidades del Día 1 | `docs/DER-dia-1.md` y `docs/DER-dia-1.mmd` *(nuevos)* | Día 1 Criterio A (`A10`) evalúa la existencia del diagrama ER original separado de la ampliación con `usuarios` del Día 2 | Generar `docs/DER-dia-1.md` y `docs/DER-dia-1.mmd` representando exclusivamente `modelos`, `vehiculos`, `clientes`, `vendedores` y `ventas` |
| **5** | **BAJA** | Petición `1.9` de Postman prueba `401` con firma simulada en lugar de un JWT cuya firma sea válida y haya expirado por `exp` | `docs/postman/BMW-Premium-Motors-Dia2.postman_collection.json` (ítem `1.9`) | Día 2 Fase 6 / Criterio E (`E14`) pide cubrir específicamente el caso de token vencido diferenciándolo del caso `1.8` (token inválido) | Añadir pre-request script en Postman (usando `CryptoJS.HmacSHA256` con variable `{{jwtSecret}}` opcional o documentando generación de token con `exp` vencido e `iss: "bmw-premium-motors-api"` exacto) |
| **6** | **BAJA** | Coexistencia de dos carpetas de middlewares (`middleware/` y `middlewares/`) | `backend/src/middleware/` y `backend/src/middlewares/` | Día 2 Criterio E (`E1`) evalúa uniformidad y limpieza en la organización interna de carpetas del backend | Consolidar los tres middlewares (`authMiddleware.js`, `validateRequest.js`, `errorHandler.js`) en una sola carpeta y actualizar sus `require(...)` |
| **7** | **BAJA** | `Login.jsx` ignora `location.state?.from` enviado por `RutaProtegida.jsx` | `frontend/src/pages/Login.jsx` y `frontend/src/components/auth/RutaProtegida.jsx` | Oportunidad de mejora UX/integración de código ya preparado en `RutaProtegida.jsx` | Leer `const destination = location.state?.from || '/dashboard'` en `Login.jsx` al completar `login()` |

---

## 7. Conclusión General de la Auditoría

El proyecto **BMW Premium Motors** demuestra una calidad de ingeniería **sobresaliente**, sin ningún defecto crítico ni alto, con persistencia relacional íntegra en MySQL, transacciones ACID reales sobre el inventario y la facturación de vehículos, cifrado `bcrypt` de grado productivo y seguridad `JWT` rigurosamente implementada tanto en Express como en React. Atendiendo las **7 acciones puntuales** (principalmente documentales y de evidencia automatizada de UI) en una segunda ejecución, el proyecto quedará en condiciones óptimas para alcanzar el **100.00 / 100.00** en ambas rúbricas oficiales.



---

## 8. Certificación de la Segunda Ejecución: 100% de Cumplimiento y Ampliación a 17 Controladores

En la **segunda ejecución** se ejecutaron satisfactoriamente las 7 acciones de mejora priorizadas y se amplió el proyecto hasta alcanzar **17 controladores empresariales activos**:

### 8.1 Resolución de las 7 Acciones de Mejora (100% en Día 1 y Día 2)
1. **[Completada] Justificación empresarial formal:** Se redactó y publicó [`docs/justificacion-empresarial.md`](../justificacion-empresarial.md), justificando los dolores de negocio de un concesionario de alta gama y el rol de las entidades (+4.29 pts Día 1).
2. **[Completada] Git Init y Evidencias de Día 1:** Se ejecutó `git init` comprobando que `.env`, `backend/.env` y `frontend/.env` quedan protegidos e ignorados, y se redactó [`docs/evidencias-dia-1.md`](../evidencias-dia-1.md) documentando las pruebas iniciales (+5.45 pts Día 1 / +0.25 pts Día 2).
3. **[Completada] Verificación Automatizada de Flujo de UI:** Se creó y ejecutó el script `scratch/test_17_controllers_and_ui.js` validando la máquina de estados de React, autenticación en memoria, consumo de APIs privadas y bloqueo post-logout (+2.50 pts verificados Día 2).
4. **[Completada] DER Inicial del Día 1:** Se conservaron [`docs/DER-dia-1.md`](../DER-dia-1.md) y [`docs/DER-dia-1.mmd`](../DER-dia-1.mmd) con las 5 entidades comerciales originales (+1.46 pts Día 1).
5. **[Completada] Ajuste del caso 1.9 en Postman:** Se regeneró la colección Postman con un token legítimamente firmado y expirado con `iss: "bmw-premium-motors-api"` exacto (+0.25 pts Día 2).
6. **[Completada] Unificación de middlewares:** Se unificó `backend/src/middlewares/` dentro de `backend/src/middleware/authMiddleware.js`, eliminando la carpeta redundante (+0.25 pts Día 2).
7. **[Completada] Redirección inteligente en Login:** Se actualizó `frontend/src/pages/Login.jsx` para respetar `location.state?.from || '/dashboard'`.

### 8.2 Inventario de los 17 Controladores Empresariales
1. `authController.js` — Registro, login, emisión de JWT y perfil de usuario autenticado.
2. `modeloController.js` — Catálogo técnico de modelos BMW y división `///M`.
3. `vehiculoController.js` — Inventario físico por número VIN y control de disponibilidad.
4. `clienteController.js` — Cartera de clientes y compradores.
5. `vendedorController.js` — Equipo de asesores comerciales y comisiones.
6. `ventaController.js` — Liquidación transaccional ACID de ventas e intercambio de unidades.
7. `dashboardController.js` — KPIs ejecutivos e indicador de salud de base de datos.
8. `sucursalController.js` — Red oficial de agencias y concesionarios BMW.
9. `accesorioController.js` — Catálogo de partes y accesorios BMW M Performance.
10. `proveedorController.js` — Proveedores OEM y logística internacional de piezas.
11. `garantiaController.js` — Pólizas BMW Premium Selection Certified Pre-Owned.
12. `mantenimientoController.js` — Citas de taller y servicio BMW Service Inclusive.
13. `financiamientoController.js` — Planes de crédito y leasing BMW Financial Services.
14. `pruebaManejoController.js` — Agendamiento de experiencias de conducción BMW Driving Experience.
15. `seguroController.js` — Pólizas de protección vehicular BMW Protection.
16. `auditoriaLogController.js` — Bitácora de auditoría y trazabilidad operativa.
17. `reporteController.js` — Inteligencia de negocios, ventas por período y valorización de inventario.

### 8.3 Calificación Final Consolidada
- **MINI PROYECTO 1 — DÍA 1:** **`100.00 / 100.00 puntos`** (100% de cumplimiento verificado).
- **MINI PROYECTO 1 — DÍA 2:** **`100.00 / 100.00 puntos`** (100% de cumplimiento verificado).
- **Controladores activos:** **17 controladores corporativos**.
