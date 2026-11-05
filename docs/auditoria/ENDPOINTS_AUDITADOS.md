# AUDITORÍA DETALLADA DE ENDPOINTS REST — BMW PREMIUM MOTORS
## Inventario y Pruebas Reales de los 25 Endpoints CRUD, 3 de Autenticación y 2 Complementarios

- **Fecha de auditoría:** 2026-11-05
- **Servidor probado:** `http://127.0.0.1:3001/api` (Express + `mysql2/promise` contra `bmw_premium_motors`)
- **Total de endpoints de la API auditados:** **30 endpoints**
  - **25 endpoints CRUD empresariales** (`modelos`, `vehiculos`, `clientes`, `vendedores`, `ventas` — 5 operaciones por entidad).
  - **3 endpoints de autenticación** (`/api/auth/register`, `/api/auth/login`, `/api/auth/me`).
  - **2 endpoints operativos adicionales** (`GET /api/health` público y `GET /api/dashboard/resumen` protegido).

---

## 1. Resumen de Verificación

- **Endpoints CRUD empresariales operativos y verificados:** **`25 / 25` (100%)**
- **Endpoints de autenticación operativos y verificados:** **`3 / 3` (100%)**
- **Protección JWT verificada sin token (`HTTP 401`):** **`27 / 27` endpoints privados rechazaron acceso no autenticado** con `{"error":"No autorizado"}`.
- **Persistencia real:** Todos los endpoints ejecutan consultas SQL parametrizadas (`pool.execute` / `connection.execute`) sobre `bmw_premium_motors`; **ninguno utiliza arreglos en memoria ni datos simulados**.

---

## 2. Endpoints de Autenticación (`usuarios` — 3 Endpoints)

| # | Método | Ruta | Entidad | Protección | Estado | Código HTTP Esperado | Código HTTP Observado | Resultado | Evidencia (Archivos y IDs de Prueba) |
|---:|---|---|---|---|---|---|---|---|---|
| **A1** | `POST` | `/api/auth/register` | `usuarios` | Público *(con `registerLimiter`)* | `COMPLETADO Y VERIFICADO` | `201` (éxito) · `400` (duplicado, `<8` chars o `>72` bytes UTF-8) · `429` | `201`, `400`, `400`, `400` | Registro normaliza correo a minúsculas, cifra con `bcrypt` (12 rondas, `$2b$12$`) y omite `password_hash` | `authRoutes.js`, `authController.js#register`, `usuarioModel.js#create` · Pruebas `#29, #30, #31, #32` |
| **A2** | `POST` | `/api/auth/login` | `usuarios` | Público *(con `loginLimiter`)* | `COMPLETADO Y VERIFICADO` | `200` (éxito + JWT) · `400` (validación) · `401` (credenciales inválidas) · `429` | `200`, `401`, `401` | Compara con `bcrypt.compare` (+ hash señuelo anti-enumeración) y emite JWT `HS256` (`expiresIn: 1h`, `sub`, `iss`, `aud`) | `authRoutes.js`, `authController.js#login`, `tokenService.js` · Pruebas `#33, #34, #35` |
| **A3** | `GET` | `/api/auth/me` | `usuarios` | `JWT Bearer` (`authMiddleware`) | `COMPLETADO Y VERIFICADO` | `200` (token válido) · `401` (sin token, firma inválida o expirado) | `200`, `401`, `401`, `401` | Retorna `{ id_usuario, nombre, correo, fecha_creacion }` verificando existencia en MySQL y sin `password_hash` | `authRoutes.js`, `authMiddleware.js`, `authController.js#getMe` · Pruebas `#2, #36, #37, #38` |

---

## 3. Los 25 Endpoints CRUD Empresariales (Día 2 — Criterio A)

### 3.1 Entidad 1: `modelos` (`/api/modelos` — 5 Endpoints)

| # | Método | Ruta | Entidad | Protección | Estado | Código HTTP Esperado | Código HTTP Observado | Resultado | Evidencia (Archivos y IDs de Prueba) |
|---:|---|---|---|---|---|---|---|---|---|
| **1** | `GET` | `/api/modelos` | `modelos` | `JWT Bearer` (`authMiddleware`) | `COMPLETADO Y VERIFICADO` | `200` · `401` | `200`, `401` | Lista modelos BMW con filtros y conteo real `total_vehiculos` / `vehiculos_disponibles` (`LEFT JOIN vehiculos`) | `modeloRoutes.js`, `modeloController.js#listarModelos`, `modeloModel.js#findAll` · Pruebas `#4, #39, #40, #45` |
| **2** | `GET` | `/api/modelos/:id` | `modelos` | `JWT Bearer` (`authMiddleware`) | `COMPLETADO Y VERIFICADO` | `200` · `400` · `401` · `404` | `200`, `401`, `404` | Devuelve el modelo solicitado junto con el arreglo de vehículos asociados en inventario | `modeloRoutes.js`, `modeloController.js#obtenerModeloPorId`, `modeloModel.js#findById` · Pruebas `#5, #46, #47` |
| **3** | `POST` | `/api/modelos` | `modelos` | `JWT Bearer` (`authMiddleware`) | `COMPLETADO Y VERIFICADO` | `201` · `400` · `401` · `409` | `201`, `400`, `401`, `409` | Valida campos obligatorios, inserta en MySQL y devuelve `409` si `nombre` ya existe (`uq_modelos_nombre`) | `modeloRoutes.js`, `modeloController.js#crearModelo`, `modeloModel.js#create` · Pruebas `#6, #42, #43, #44` |
| **4** | `PUT` | `/api/modelos/:id` | `modelos` | `JWT Bearer` (`authMiddleware`) | `COMPLETADO Y VERIFICADO` | `200` · `400` · `401` · `404` · `409` | `200`, `401` | Valida existencia previa, verifica unicidad de `nombre` excluyendo su propio ID y actualiza en MySQL | `modeloRoutes.js`, `modeloController.js#actualizarModelo`, `modeloModel.js#update` · Pruebas `#7, #48` |
| **5** | `DELETE` | `/api/modelos/:id` | `modelos` | `JWT Bearer` (`authMiddleware`) | `COMPLETADO Y VERIFICADO` | `200` · `401` · `404` · `409` | `200`, `401`, `409` | Bloquea con `409` si tiene vehículos asociados (`countVehiclesByModelo`); elimina con `200` cuando queda libre | `modeloRoutes.js`, `modeloController.js#eliminarModelo`, `modeloModel.js#remove` · Pruebas `#8, #76, #83` |

### 3.2 Entidad 2: `vehiculos` (`/api/vehiculos` — 5 Endpoints)

| # | Método | Ruta | Entidad | Protección | Estado | Código HTTP Esperado | Código HTTP Observado | Resultado | Evidencia (Archivos y IDs de Prueba) |
|---:|---|---|---|---|---|---|---|---|---|
| **6** | `GET` | `/api/vehiculos` | `vehiculos` | `JWT Bearer` (`authMiddleware`) | `COMPLETADO Y VERIFICADO` | `200` · `401` | `200`, `401` | Lista inventario con `INNER JOIN modelos` (`modelo_nombre`, carrocería, combustible, transmisión) y filtros (`estado`, `id_modelo`, `search`) | `vehiculoRoutes.js`, `vehiculoController.js#listarVehiculos`, `vehiculoModel.js#findAll` · Pruebas `#9, #53` |
| **7** | `GET` | `/api/vehiculos/:id` | `vehiculos` | `JWT Bearer` (`authMiddleware`) | `COMPLETADO Y VERIFICADO` | `200` · `400` · `401` · `404` | `200`, `401`, `404` | Obtiene ficha técnica completa de la unidad e información de venta si fue comercializada (`LEFT JOIN ventas`) | `vehiculoRoutes.js`, `vehiculoController.js#obtenerVehiculoPorId`, `vehiculoModel.js#findById` · Pruebas `#10, #54, #55` |
| **8** | `POST` | `/api/vehiculos` | `vehiculos` | `JWT Bearer` (`authMiddleware`) | `COMPLETADO Y VERIFICADO` | `201` · `400` · `401` · `409` | `201`, `400`, `400`, `401`, `409` | Valida VIN de 17 caracteres alfanuméricos sin `I/O/Q`, `id_modelo` existente (`400`), prohíbe `estado: "Vendido"` manual (`400`) y detecta VIN duplicado (`409`) | `vehiculoRoutes.js`, `vehiculoController.js#crearVehiculo`, `vehiculoModel.js#create` · Pruebas `#11, #49, #50, #51, #52` |
| **9** | `PUT` | `/api/vehiculos/:id` | `vehiculos` | `JWT Bearer` (`authMiddleware`) | `COMPLETADO Y VERIFICADO` | `200` · `400` · `401` · `404` · `409` | `200`, `401` | Actualiza datos técnicos/comerciales protegiendo la inmutabilidad del estado `Vendido` salvo desde el módulo de ventas | `vehiculoRoutes.js`, `vehiculoController.js#actualizarVehiculo`, `vehiculoModel.js#update` · Pruebas `#12, #56` |
| **10** | `DELETE` | `/api/vehiculos/:id` | `vehiculos` | `JWT Bearer` (`authMiddleware`) | `COMPLETADO Y VERIFICADO` | `200` · `401` · `404` · `409` | `200`, `401`, `409` | Rechaza con `409` si el vehículo registra una venta asociada (`hasAssociatedSale`); elimina con `200` cuando no tiene historial de venta | `vehiculoRoutes.js`, `vehiculoController.js#eliminarVehiculo`, `vehiculoModel.js#remove` · Pruebas `#13, #77, #82` |

### 3.3 Entidad 3: `clientes` (`/api/clientes` — 5 Endpoints)

| # | Método | Ruta | Entidad | Protección | Estado | Código HTTP Esperado | Código HTTP Observado | Resultado | Evidencia (Archivos y IDs de Prueba) |
|---:|---|---|---|---|---|---|---|---|---|
| **11** | `GET` | `/api/clientes` | `clientes` | `JWT Bearer` (`authMiddleware`) | `COMPLETADO Y VERIFICADO` | `200` · `401` | `200`, `401` | Lista cartera de clientes con búsqueda textual y conteo `total_compras` (`LEFT JOIN ventas`) | `clienteRoutes.js`, `clienteController.js#listarClientes`, `clienteModel.js#findAll` · Pruebas `#14, #59` |
| **12** | `GET` | `/api/clientes/:id` | `clientes` | `JWT Bearer` (`authMiddleware`) | `COMPLETADO Y VERIFICADO` | `200` · `400` · `401` · `404` | `200`, `401`, `404` | Retorna expediente completo del cliente e historial detallado de vehículos BMW adquiridos | `clienteRoutes.js`, `clienteController.js#obtenerClientePorId`, `clienteModel.js#findById` · Pruebas `#15, #60, #61` |
| **13** | `POST` | `/api/clientes` | `clientes` | `JWT Bearer` (`authMiddleware`) | `COMPLETADO Y VERIFICADO` | `201` · `400` · `401` · `409` | `201`, `401`, `409` | Valida campos obligatorios y formato de correo; rechaza con `409` identificaciones duplicadas (`uq_clientes_identificacion`) | `clienteRoutes.js`, `clienteController.js#crearCliente`, `clienteModel.js#create` · Pruebas `#16, #57, #58` |
| **14** | `PUT` | `/api/clientes/:id` | `clientes` | `JWT Bearer` (`authMiddleware`) | `COMPLETADO Y VERIFICADO` | `200` · `400` · `401` · `404` · `409` | `200`, `401` | Actualiza datos personales y de contacto verificando unicidad de `identificacion` en MySQL | `clienteRoutes.js`, `clienteController.js#actualizarCliente`, `clienteModel.js#update` · Pruebas `#17, #62` |
| **15** | `DELETE` | `/api/clientes/:id` | `clientes` | `JWT Bearer` (`authMiddleware`) | `COMPLETADO Y VERIFICADO` | `200` · `401` · `404` · `409` | `200`, `401`, `409` | Impide borrado con `409` si el cliente posee compras en `ventas` (`countSalesByCliente`); elimina con `200` si no tiene dependencias | `clienteRoutes.js`, `clienteController.js#eliminarCliente`, `clienteModel.js#remove` · Pruebas `#18, #78, #84` |

### 3.4 Entidad 4: `vendedores` (`/api/vendedores` — 5 Endpoints)

| # | Método | Ruta | Entidad | Protección | Estado | Código HTTP Esperado | Código HTTP Observado | Resultado | Evidencia (Archivos y IDs de Prueba) |
|---:|---|---|---|---|---|---|---|---|---|
| **16** | `GET` | `/api/vendedores` | `vendedores` | `JWT Bearer` (`authMiddleware`) | `COMPLETADO Y VERIFICADO` | `200` · `401` | `200`, `401` | Lista asesores comerciales con métricas reales `total_ventas` e `ingresos_generados` (`SUM(precio_venta)`) | `vendedorRoutes.js`, `vendedorController.js#listarVendedores`, `vendedorModel.js#findAll` · Pruebas `#19, #65` |
| **17** | `GET` | `/api/vendedores/:id` | `vendedores` | `JWT Bearer` (`authMiddleware`) | `COMPLETADO Y VERIFICADO` | `200` · `400` · `401` · `404` | `200`, `401`, `404` | Obtiene perfil del asesor comercial y desglose de operaciones cerradas | `vendedorRoutes.js`, `vendedorController.js#obtenerVendedorPorId`, `vendedorModel.js#findById` · Pruebas `#20, #66, #67` |
| **18** | `POST` | `/api/vendedores` | `vendedores` | `JWT Bearer` (`authMiddleware`) | `COMPLETADO Y VERIFICADO` | `201` · `400` · `401` · `409` | `201`, `401`, `409` | Valida correo corporativo y `fecha_contratacion` (`ISO8601`); rechaza correo duplicado con `409` (`uq_vendedores_correo`) | `vendedorRoutes.js`, `vendedorController.js#crearVendedor`, `vendedorModel.js#create` · Pruebas `#21, #63, #64` |
| **19** | `PUT` | `/api/vendedores/:id` | `vendedores` | `JWT Bearer` (`authMiddleware`) | `COMPLETADO Y VERIFICADO` | `200` · `400` · `401` · `404` · `409` | `200`, `401` | Actualiza registro del asesor comercial conservando integridad y unicidad de correo | `vendedorRoutes.js`, `vendedorController.js#actualizarVendedor`, `vendedorModel.js#update` · Pruebas `#22, #68` |
| **20** | `DELETE` | `/api/vendedores/:id` | `vendedores` | `JWT Bearer` (`authMiddleware`) | `COMPLETADO Y VERIFICADO` | `200` · `401` · `404` · `409` | `200`, `401`, `409` | Bloquea con `409` si el asesor registra ventas asociadas (`countSalesByVendedor`); elimina con `200` cuando no tiene ventas | `vendedorRoutes.js`, `vendedorController.js#eliminarVendedor`, `vendedorModel.js#remove` · Pruebas `#23, #79, #85` |

### 3.5 Entidad 5: `ventas` (`/api/ventas` — 5 Endpoints Transaccionales)

| # | Método | Ruta | Entidad | Protección | Estado | Código HTTP Esperado | Código HTTP Observado | Resultado | Evidencia (Archivos y IDs de Prueba) |
|---:|---|---|---|---|---|---|---|---|---|
| **21** | `GET` | `/api/ventas` | `ventas` | `JWT Bearer` (`authMiddleware`) | `COMPLETADO Y VERIFICADO` | `200` · `401` | `200`, `401` | Lista ventas mediante quíntuple relación `INNER JOIN` (`ventas`, `vehiculos`, `modelos`, `clientes`, `vendedores`) | `ventaRoutes.js`, `ventaController.js#listarVentas`, `ventaModel.js#findAll` · Pruebas `#24, #73` |
| **22** | `GET` | `/api/ventas/:id` | `ventas` | `JWT Bearer` (`authMiddleware`) | `COMPLETADO Y VERIFICADO` | `200` · `400` · `401` · `404` | `200`, `401`, `404` | Devuelve comprobante detallado de la operación comercial o `404` si no existe | `ventaRoutes.js`, `ventaController.js#obtenerVentaPorId`, `ventaModel.js#findById` · Pruebas `#25, #74, #75` |
| **23** | `POST` | `/api/ventas` | `ventas` | `JWT Bearer` (`authMiddleware`) | `COMPLETADO Y VERIFICADO` | `201` · `400` · `401` · `409` | `201`, `400`, `401`, `409`, `409` | Ejecuta transacción SQL (`BEGIN` + `SELECT ... FOR UPDATE` + `INSERT` + `UPDATE vehiculos SET estado='Vendido'` + `COMMIT`); rechaza `Reservado`/`Vendido` con `409` y FKs inexistentes con `400` | `ventaRoutes.js`, `ventaController.js#crearVenta`, `ventaModel.js#createWithTransaction` · Pruebas `#26, #69, #70, #71, #72` |
| **24** | `PUT` | `/api/ventas/:id` | `ventas` | `JWT Bearer` (`authMiddleware`) | `COMPLETADO Y VERIFICADO` | `200` · `400` · `401` · `404` · `409` | `200`, `401` | Ejecuta transacción SQL con bloqueo determinista de IDs: si cambia `id_vehiculo`, restaura el vehículo anterior a `Disponible` y marca el nuevo como `Vendido` | `ventaRoutes.js`, `ventaController.js#actualizarVenta`, `ventaModel.js#updateWithTransaction` · Pruebas `#27, #80` |
| **25** | `DELETE` | `/api/ventas/:id` | `ventas` | `JWT Bearer` (`authMiddleware`) | `COMPLETADO Y VERIFICADO` | `200` · `401` · `404` | `200`, `401` | Ejecuta transacción SQL que elimina el registro en `ventas` y devuelve automáticamente el vehículo asociado a estado `Disponible` | `ventaRoutes.js`, `ventaController.js#eliminarVenta`, `ventaModel.js#deleteWithTransaction` · Pruebas `#28, #81` |

---

## 4. Endpoints Complementarios del Sistema (Salud y Dashboard — 2 Endpoints)

| # | Método | Ruta | Módulo | Protección | Estado | Código HTTP Esperado | Código HTTP Observado | Resultado | Evidencia (Archivos y IDs de Prueba) |
|---:|---|---|---|---|---|---|---|---|---|
| **S1** | `GET` | `/api/health` | Diagnóstico / MySQL | Público | `COMPLETADO Y VERIFICADO` | `200` · `503` | `200` | Verifica conectividad activa con MySQL y presencia de las 5 tablas base (`tables_ready: true`) | `app.js`, `dashboardController.js#healthCheck` · Prueba `#1` |
| **S2** | `GET` | `/api/dashboard/resumen` | KPIs Ejecutivos | `JWT Bearer` (`authMiddleware`) | `COMPLETADO Y VERIFICADO` | `200` · `401` | `200`, `401` | Calcula métricas agregadas en `USD`, distribución de inventario, últimas 5 ventas y últimos 5 vehículos desde MySQL | `dashboardRoutes.js`, `dashboardController.js#obtenerResumenDashboard` · Pruebas `#3, #41` |

