# AUDITORÍA TÉCNICA Y ACADÉMICA — MINI PROYECTO 1 · DÍA 1
## BMW Premium Motors: Modelado de Datos Empresariales e Inicio del CRUD

- **Fecha de auditoría:** 2026-11-05
- **Proyecto auditado:** `BMW Premium Motors` (`c:/Users/dell5/UQV/Backend/BMW`)
- **Base de datos auditada:** `bmw_premium_motors` (`MySQL 8+`, motor `InnoDB`, `utf8mb4_unicode_ci`)
- **Alcance de esta evaluación:** Exclusivamente los requisitos oficiales del **Día 1** (sin exigir ni penalizar login, registro, JWT, middlewares de seguridad, roles ni rutas protegidas, los cuales corresponden al Día 2).

---

## 1. Descripción de BMW Premium Motors y Evaluación Histórica

**BMW Premium Motors** es un sistema web empresarial cliente-servidor concebido para administrar la operación comercial de un concesionario especializado en vehículos BMW, la división de alto desempeño **BMW M (`///M`)** y unidades icónicas de colección como el **BMW X5 M 2012 (E70)**.

### Distinción Metodológica de Evidencia Histórica (Día 1 vs. Versión Final)

Conforme a las reglas de auditoría histórica, se inspeccionó el control de versiones y los metadatos del sistema de archivos NTFS:

1. **Control de versiones Git:** Al ejecutar `git status` y `git log`, se constató que el directorio **no es un repositorio Git inicializado** (`fatal: not a git repository: .git`), por lo que no existe historial de *commits* que separe instantáneas entre el Día 1 y el Día 2.
2. **Evidencia física verificable del Día 1 en disco (`2026-11-04`):** Los archivos originales del Día 1 conservan intacta su marca de tiempo `LastWriteTime` del **4 de noviembre de 2026**, incluyendo:
   - `backend/src/database/schema.sql` (`04/11/2026 09:27:56`): contiene **únicamente las 5 tablas empresariales originales** (`modelos`, `vehiculos`, `clientes`, `vendedores`, `ventas`), sin rastro de la tabla `usuarios`.
   - `backend/src/database/initDatabase.js` (`04/11/2026 13:10:47`): inicializa exclusivamente `REQUIRED_TABLES = ['modelos', 'vehiculos', 'clientes', 'vendedores', 'ventas']` y siembra datos demostrativos reales en esas 5 entidades.
   - Controladores (`modeloController.js`, `vehiculoController.js`, `clienteController.js`, `vendedorController.js`, `ventaController.js`, `dashboardController.js`), modelos (`vehiculoModel.js`, `clienteModel.js`, `vendedorModel.js`, `ventaModel.js`), rutas (`*Routes.js`) y validador (`validateRequest.js`) con fecha `04/11/2026`.
   - Páginas empresariales de React (`Dashboard.jsx`, `Modelos.jsx`, `Vehiculos.jsx`, `Clientes.jsx`, `Vendedores.jsx`, `Ventas.jsx`), modales CRUD y servicios `*Service.js` con fecha `04/11/2026`.
3. **Elementos sobrescritos o sin evidencia histórica exclusiva del Día 1:**
   - `README.md` fue actualizado el `05/11/2026 08:41:39` para cubrir conjuntamente Día 1 + Día 2.
   - En `docs/` existe el diagrama actualizado `docs/DER-dia-2.md` (`05/11/2026`), pero **no se conservó un archivo independiente `DER-dia-1.md`** previo a la incorporación de `usuarios`.
   - En `docs/postman/` únicamente existe la colección del Día 2 (`BMW-Premium-Motors-Dia2.postman_collection.json`, `05/11/2026`), por lo que **no existe evidencia histórica conservada** de las pruebas manuales en Postman/Thunder Client ejecutadas al cierre del Día 1 antes de proteger las rutas con JWT.

---

## 2. Evaluación del Enfoque y Justificación Empresarial

El sistema modela y resuelve la operación real de un concesionario automotriz en cinco frentes:
- **Modelos BMW (`modelos`):** estandarización del catálogo técnico por denominación oficial, carrocería, motorización/combustible y transmisión.
- **Inventario físico (`vehiculos`):** trazabilidad unitaria por número de chasis **VIN de 17 caracteres**, año, versión, color, kilometraje, precio en USD y control estricto de estado (`Disponible`, `Reservado`, `Vendido`).
- **Cartera de clientes (`clientes`):** registro único por documento de identificación, datos de contacto e historial de adquisiciones.
- **Equipo comercial (`vendedores`):** control de asesores con correo corporativo único, fecha de contratación y volumen facturado.
- **Facturación transaccional (`ventas`):** vinculación atómica entre un vehículo disponible, un cliente comprador y un asesor comercial, impidiendo ventas duplicadas sobre una misma unidad.

> **Hallazgo documental en Criterio B:** Si bien la utilidad empresarial está plenamente demostrada en la base de datos y en la lógica del sistema, **falta un documento formal dedicado de Descripción y Justificación Empresarial** (por ejemplo, `docs/justificacion-empresarial.md` o un capítulo específico en `README.md`) que redacte extensamente la problemática administrativa previa del concesionario y justifique narrativamente cada uno de los cinco módulos.

---

## 3. Auditoría del Modelado de Datos Original (Día 1) vs. Incorporación Posterior

### 3.1 Modelo Original del Día 1 (5 Entidades Empresariales)
Verificado directamente en `backend/src/database/schema.sql` y contrastado contra `information_schema` en MySQL:

| Tabla | Clave Primaria | Atributos Definidos | Restricciones `UNIQUE` / `CHECK` | Claves Foráneas (`InnoDB`) | Registros Actuales |
|---|---|---|---|---|---:|
| `modelos` | `id_modelo` (`INT AUTO_INCREMENT`) | `nombre`, `tipo_carroceria`, `combustible`, `transmision`, `descripcion`, `created_at`, `updated_at` | `uq_modelos_nombre (nombre)` | Ninguna | 10 |
| `vehiculos` | `id_vehiculo` (`INT AUTO_INCREMENT`) | `id_modelo`, `vin` (`CHAR(17)`), `version`, `anio` (`YEAR`), `color`, `kilometraje` (`INT UNSIGNED`), `precio` (`DECIMAL(12,2)`), `estado` (`ENUM`), `imagen_url`, `created_at`, `updated_at` | `uq_vehiculos_vin (vin)`, `chk_vehiculos_vin_len`, `chk_vehiculos_precio_positivo` | `fk_vehiculos_modelo` → `modelos(id_modelo)` (`RESTRICT` / `CASCADE`) | 13 |
| `clientes` | `id_cliente` (`INT AUTO_INCREMENT`) | `nombre`, `apellidos`, `identificacion`, `telefono`, `correo`, `direccion`, `created_at`, `updated_at` | `uq_clientes_identificacion (identificacion)` | Ninguna | 5 |
| `vendedores` | `id_vendedor` (`INT AUTO_INCREMENT`) | `nombre`, `apellidos`, `telefono`, `correo`, `fecha_contratacion` (`DATE`), `created_at`, `updated_at` | `uq_vendedores_correo (correo)` | Ninguna | 4 |
| `ventas` | `id_venta` (`INT AUTO_INCREMENT`) | `id_vehiculo`, `id_cliente`, `id_vendedor`, `fecha_venta` (`DATE`), `precio_venta` (`DECIMAL(12,2)`), `observaciones`, `created_at`, `updated_at` | `uq_ventas_vehiculo (id_vehiculo)`, `chk_ventas_precio_positivo` | `fk_ventas_vehiculo`, `fk_ventas_cliente`, `fk_ventas_vendedor` (`RESTRICT` / `CASCADE`) | 2 |

### 3.2 Verificación de Cardinalidades Requeridas en Día 1
- **`modelos` 1:N `vehiculos`:** Verificada (`vehiculos.id_modelo NOT NULL` con `fk_vehiculos_modelo`).
- **`clientes` 1:N `ventas`:** Verificada (`ventas.id_cliente NOT NULL` con `fk_ventas_cliente`).
- **`vendedores` 1:N `ventas`:** Verificada (`ventas.id_vendedor NOT NULL` con `fk_ventas_vendedor`).
- **`vehiculos` 1:0..1 `ventas`:** Verificada (`ventas.id_vehiculo NOT NULL` + `CONSTRAINT uq_ventas_vehiculo UNIQUE (id_vehiculo)` + `fk_ventas_vehiculo`), garantizando a nivel de motor MySQL que un vehículo jamás pueda aparecer en más de una venta.

### 3.3 Separación respecto al Día 2 y Estado del DER Inicial
- La entidad **`usuarios`** (`001_create_usuarios.sql`) y la tabla técnica `schema_migrations` pertenecen exclusivamente al **Día 2** y **no penalizan** en absoluto el diseño del Día 1.
- El diagrama `docs/DER-dia-2.md` representa con exactitud las 5 tablas del Día 1 y sus 4 relaciones en sintaxis Mermaid `erDiagram`, señalando explícitamente que `usuarios` fue agregada en el Día 2; sin embargo, se califica como **PARCIAL** el subrequisito de contar con un archivo `DER inicial` preservado por separado para el Día 1.

---

## 4. Estructura Backend y Frontend (Día 1)

La arquitectura creada en el Día 1 cumple íntegramente con la separación modular solicitada:
- **Backend (`backend/src/`):** separación limpia en `config/db.js`, `database/schema.sql`, `database/initDatabase.js`, `models/` (5 modelos empresariales), `controllers/` (5 controladores CRUD + `dashboardController.js`), `routes/` (5 routers CRUD + `dashboardRoutes.js`), `middleware/` (`errorHandler.js`, `validateRequest.js`), `app.js` y `server.js`.
- **Frontend (`frontend/src/`):** proyecto React 18 + Vite 6 en puerto `5173` con separación en `components/` (subcarpetas por entidad y `common/`, `layout/`, `dashboard/`), `pages/`, `routes/`, `services/` (cliente `Axios` centralizado en `api.js` y un servicio por entidad), `styles/` y `utils/`.

---

## 5. Primeros Endpoints e Inicio del CRUD (POST y GET)

El Día 1 exigía levantar el servidor Node.js + Express e implementar al menos los endpoints de **creación (`POST`)** y **listado (`GET`)** de una entidad conectados a MySQL. El proyecto superó ampliamente dicho mínimo técnico desde el Día 1 al dejar implementados los controladores, modelos, validaciones `express-validator` y persistencia real en MySQL para las cinco entidades:
- `POST /api/modelos` y `GET /api/modelos` (verificados en vivo: `HTTP 201` y `HTTP 200`, persistencia real en `bmw_premium_motors`).
- Adicionalmente operativos desde el código de Día 1: `vehiculos`, `clientes`, `vendedores`, `ventas` y `GET /api/health`.
- **Nota sobre autenticación actual:** En la versión final del repositorio (tras el Día 2), estos endpoints exigen `Authorization: Bearer <token>`. Conforme a las reglas de evaluación, no se penaliza al Día 1 por la posterior adición de JWT en el Día 2; sin embargo, la evidencia documental de las pruebas ejecutadas en Postman/Thunder Client específicamente al cierre del Día 1 queda clasificada como **`SIN EVIDENCIA HISTÓRICA`**.

---

## 6. Calificación Oficial del Día 1 (Sobre 100 Puntos)

| Criterio Oficial | Peso Máximo | Subrequisitos Evaluados | Verificados / Parciales / Sin Evid. / Pend. | Puntaje Verificado | Implementación Detectada |
|---|---:|---:|---|---:|---:|
| **A. Modelado de datos** | 35.00 pts | 12 | 11 Verificados · 1 Parcial (DER inicial separado) | **33.54 pts** | 95.83% |
| **B. Enfoque empresarial** | 15.00 pts | 7 | 4 Verificados · 2 Parciales · 1 Pendiente (doc formal) | **10.71 pts** | 71.43% |
| **C. Estructura del proyecto** | 20.00 pts | 15 | 15 Verificados | **20.00 pts** | 100.00% |
| **D. Inicio del CRUD** | 30.00 pts | 11 | 9 Verificados · 2 Sin Evidencia Histórica | **24.55 pts** | 81.82% |
| **TOTAL DÍA 1** | **100.00 pts** | **45** | **39 Verif. · 3 Parc. · 2 Sin Evid. · 1 Pend.** | **88.80 / 100** | **90.00%** |

*(Detalle aritmético: Criterio A = `(11.5 / 12) × 35 = 33.54`; Criterio B = `(5.0 / 7) × 15 = 10.71`; Criterio C = `(15 / 15) × 20 = 20.00`; Criterio D = `(9 / 11) × 30 = 24.55`. Suma exacta = **`88.80 / 100.00`**).*

---

## 7. Pendientes Identificados del Día 1

1. **[MEDIA] Documento formal de Descripción y Justificación Empresarial (`docs/justificacion-empresarial.md` o sección ampliada en `README.md`):** redactar formalmente la problemática de negocio de un concesionario BMW y cómo cada una de las 5 entidades (`modelos`, `vehiculos`, `clientes`, `vendedores`, `ventas`) resuelve procesos reales de control de chasis VIN, reservas y facturación.
2. **[BAJA] Archivo separado del DER Inicial del Día 1 (`docs/DER-dia-1.md` / `docs/DER-dia-1.mmd`):** conservar una vista exclusiva de las 5 entidades originales del Día 1 previa a la incorporación de `usuarios`.
3. **[MEDIA] Evidencia documental de pruebas iniciales del Día 1 y control Git:** inicializar repositorio Git (`git init`) y documentar evidencia explícita de las pruebas de creación (`POST`) y listado (`GET`) correspondientes a la etapa inicial.

---

## 8. Conclusión del Día 1

Desde el punto de vista de ingeniería de datos, arquitectura Full Stack y persistencia en MySQL, el **Día 1** presenta una base sobresaliente (**100% en estructura del proyecto y 95.83% en modelado relacional**), conservando intactos los archivos SQL y módulos construidos el `04/11/2026`. Las únicas deducciones (**11.20 puntos** en total) obedecen estrictamente a entregables documentales e históricos (ausencia de un documento formal de justificación empresarial, falta de un archivo separado para el DER inicial y ausencia de evidencias históricas conservadas de las pruebas de Postman al cierre del Día 1).

