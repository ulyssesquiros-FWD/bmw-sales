# BMW Premium Motors — Sistema Empresarial Full Stack con Autenticación JWT (Día 1 + Día 2)

## 1. Descripción del Proyecto

**BMW Premium Motors** es una plataforma empresarial Full Stack diseñada para la administración integral de un concesionario oficial de vehículos BMW, incluyendo la **Gama BMW `///M`** y la edición de **Mención Especial BMW X5 M 2012 (E70) en *Titanium Silver Metallic***.

Desarrollada a lo largo de dos etapas incrementales:
- **Día 1:** Arquitectura base cliente-servidor, diseño editorial inspirado en `bmw.com` con logotipos vectoriales originales y galería fotográfica multi-vista por unidad, base de datos relacional en MySQL (`bmw_premium_motors`), panel ejecutivo de indicadores en **USD** y operaciones **CRUD completas** sobre las cinco entidades comerciales (`modelos`, `vehiculos`, `clientes`, `vendedores`, `ventas`) con transacciones SQL ACID.
- **Día 2:** Ampliación incremental sin pérdida de datos que incorpora la entidad independiente `usuarios`, migraciones controladas idempotentes, registro e inicio de sesión con contraseñas cifradas mediante **`bcrypt` (12 salt rounds)**, emisión y verificación estricta de **JSON Web Tokens (`JWT HS256`)**, middleware de protección transversal en el backend, limitación de tasa (*rate limiting*) y gestión de sesión segura en memoria en React (`AuthContext` + interceptores Axios + rutas protegidas).

---

## 2. Tecnologías Utilizadas

### Frontend (`http://localhost:5173`)
- **React 18** + **Vite 6**
- **React Router DOM v6** (Rutas públicas, `RutaProtegida` y redirecciones automáticas)
- **React Context API (`AuthContext`)** (Estado de autenticación estrictamente en memoria, sin `localStorage` ni `sessionStorage`)
- **Axios** (Cliente HTTP con interceptores de solicitud `Bearer` y manejo centralizado de `HTTP 401`)
- **Lucide React** (Iconografía ejecutiva)
- **CSS Personalizado Responsive** (Identidad visual BMW y BMW M Motorsport)

### Backend (`http://localhost:3001`)
- **Node.js** + **Express 4**
- **mysql2/promise** (Pool de conexiones, consultas parametrizadas anti-SQL Injection y transacciones `BEGIN / SELECT ... FOR UPDATE / COMMIT / ROLLBACK`)
- **jsonwebtoken** (Firma y validación estricta `HS256`, `iss`, `aud`, `sub`, `exp`)
- **bcrypt** (Hashing adaptativo de contraseñas con **12 salt rounds** y validación de tope de 72 bytes UTF-8)
- **express-validator** (Validación declarativa de esquemas, formatos, VIN de 17 caracteres, correos y contraseñas)
- **express-rate-limit** (Mitigación de ataques de fuerza bruta en `/api/auth/login` y `/api/auth/register`)
- **helmet** + **cors** + **dotenv**

### Base de Datos (`localhost:3306`)
- **MySQL 8.0+** (`bmw_premium_motors`, motor **InnoDB**, codificación `utf8mb4` / `utf8mb4_unicode_ci`)

---

## 3. Arquitectura del Sistema

El proyecto implementa una arquitectura desacoplada de tres capas:

1. **Capa de Presentación (SPA React):** Gestiona vistas de Showroom, modales CRUD y vistas de acceso (`/login`, `/registro`). Mantiene el JWT únicamente en memoria de ejecución dentro de `AuthContext` y sincronizado con el módulo privado de `services/api.js`.
2. **Capa de Aplicación y Seguridad (API REST Express):**
   - Valida al arrancar que `JWT_SECRET` exista y posea entropía criptográfica suficiente.
   - Expone únicamente los endpoints públicos indispensables (`/api/health`, `/api/auth/register`, `/api/auth/login`).
   - Protege todos los routers empresariales mediante `authMiddleware.js`, que valida el JWT y comprueba la existencia activa del usuario en MySQL antes de permitir cualquier operación.
   - Separa responsabilidades en `routes/` → `middlewares/` → `controllers/` → `services/` → `models/`.
3. **Capa de Datos (MySQL InnoDB):** Garantiza integridad referencial mediante `FOREIGN KEY ... ON DELETE RESTRICT ON UPDATE CASCADE`, unicidad mediante restricciones `UNIQUE` y atomicidad comercial en ventas. No existen roles ni permisos diferenciados: todo operador autenticado accede en igualdad de condiciones a los módulos del concesionario.

> **Documentación complementaria incluida en `docs/`:**
> - Documento de justificación empresarial: [`docs/justificacion-empresarial.md`](./docs/justificacion-empresarial.md)
> - Diagrama Entidad-Relación Día 1: [`docs/DER-dia-1.md`](./docs/DER-dia-1.md) y [`docs/DER-dia-1.mmd`](./docs/DER-dia-1.mmd)
> - Evidencias de pruebas Día 1: [`docs/evidencias-dia-1.md`](./docs/evidencias-dia-1.md)
> - Investigación técnica JWT: [`docs/investigacion-jwt.md`](./docs/investigacion-jwt.md)
> - Diagrama Entidad-Relación Día 2+: [`docs/DER-dia-2.md`](./docs/DER-dia-2.md) y [`docs/DER-dia-2.mmd`](./docs/DER-dia-2.mmd)
> - Informes de auditoría técnica integral: [`docs/auditoria/`](./docs/auditoria/)
> - Colección y Entorno Postman: [`docs/postman/`](./docs/postman/)

---

## 4. Estructura de Carpetas

```text
BMW/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── controllers/ (17 controladores empresariales)
│   │   │   ├── accesorioController.js
│   │   │   ├── auditoriaLogController.js
│   │   │   ├── authController.js
│   │   │   ├── clienteController.js
│   │   │   ├── dashboardController.js
│   │   │   ├── financiamientoController.js
│   │   │   ├── garantiaController.js
│   │   │   ├── mantenimientoController.js
│   │   │   ├── modeloController.js
│   │   │   ├── proveedorController.js
│   │   │   ├── pruebaManejoController.js
│   │   │   ├── reporteController.js
│   │   │   ├── seguroController.js
│   │   │   ├── sucursalController.js
│   │   │   ├── vehiculoController.js
│   │   │   ├── vendedorController.js
│   │   │   └── ventaController.js
│   │   ├── database/
│   │   │   ├── migrations/
│   │   │   │   ├── 001_create_usuarios.sql
│   │   │   │   └── 002_extension_modulos_empresariales.sql
│   │   │   ├── initDatabase.js
│   │   │   ├── migrate.js
│   │   │   ├── seedModulosAdicionales.js
│   │   │   └── schema.sql
│   │   ├── middleware/ (unificado)
│   │   │   ├── authMiddleware.js
│   │   │   ├── errorHandler.js
│   │   │   └── validateRequest.js
│   │   ├── models/ (16 modelos empresariales)
│   │   │   ├── accesorioModel.js
│   │   │   ├── auditoriaLogModel.js
│   │   │   ├── clienteModel.js
│   │   │   ├── financiamientoModel.js
│   │   │   ├── garantiaModel.js
│   │   │   ├── mantenimientoModel.js
│   │   │   ├── modeloModel.js
│   │   │   ├── proveedorModel.js
│   │   │   ├── pruebaManejoModel.js
│   │   │   ├── reporteModel.js
│   │   │   ├── seguroModel.js
│   │   │   ├── sucursalModel.js
│   │   │   ├── usuarioModel.js
│   │   │   ├── vehiculoModel.js
│   │   │   ├── vendedorModel.js
│   │   │   └── ventaModel.js
│   │   ├── routes/ (17 módulos de rutas REST)
│   │   │   ├── accesorioRoutes.js
│   │   │   ├── auditoriaLogRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── clienteRoutes.js
│   │   │   ├── dashboardRoutes.js
│   │   │   ├── financiamientoRoutes.js
│   │   │   ├── garantiaRoutes.js
│   │   │   ├── mantenimientoRoutes.js
│   │   │   ├── modeloRoutes.js
│   │   │   ├── proveedorRoutes.js
│   │   │   ├── pruebaManejoRoutes.js
│   │   │   ├── reporteRoutes.js
│   │   │   ├── seguroRoutes.js
│   │   │   ├── sucursalRoutes.js
│   │   │   ├── vehiculoRoutes.js
│   │   │   ├── vendedorRoutes.js
│   │   │   └── ventaRoutes.js
│   │   ├── services/
│   │   │   └── tokenService.js
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── public/
│   │   ├── logos/
│   │   └── vehicles/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   └── RutaProtegida.jsx
│   │   │   ├── clientes/
│   │   │   ├── common/
│   │   │   ├── dashboard/
│   │   │   ├── layout/
│   │   │   ├── modelos/
│   │   │   ├── vehiculos/
│   │   │   ├── vendedores/
│   │   │   └── ventas/
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── AccesoriosM.jsx (Boutique M Performance y Partes OEM)
│   │   │   ├── Clientes.jsx (Gestión de Compradores VIP)
│   │   │   ├── Dashboard.jsx (Showroom Ejecutivo y Salud de API)
│   │   │   ├── FinanciamientoSimulador.jsx (Simulador Select y Líneas de Crédito)
│   │   │   ├── Login.jsx (Acceso seguro con JWT en memoria)
│   │   │   ├── Modelos.jsx (Catálogo de Líneas BMW y División ///M)
│   │   │   ├── NotFound.jsx (Manejo 404 estilo BMW)
│   │   │   ├── PruebasManejo.jsx (Test Drives VIP y Experiencias de Manejo)
│   │   │   ├── Registro.jsx (Alta de operadores)
│   │   │   ├── ReportesAnalytics.jsx (Business Intelligence & Finanzas USD)
│   │   │   ├── ServiciosEmpresariales.jsx (Ecosistema 360 y Módulos Adicionales)
│   │   │   ├── SucursalesRed.jsx (Directorio de Agencias Oficiales)
│   │   │   ├── TallerMantenimiento.jsx (Órdenes de Trabajo y Bahías ISTA+)
│   │   │   ├── Vehiculos.jsx (Inventario Físico y Vistas 360°)
│   │   │   ├── Vendedores.jsx (Asesores Comerciales Certificados)
│   │   │   └── Ventas.jsx (Operaciones de Venta y Transacciones ACID)
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── clienteService.js
│   │   │   ├── dashboardService.js
│   │   │   ├── modeloService.js
│   │   │   ├── modulosService.js (Suite integral de 10 módulos y BI)
│   │   │   ├── vehiculoService.js
│   │   │   ├── vendedorService.js
│   │   │   └── ventaService.js
│   │   ├── styles/
│   │   │   └── global.css
│   │   ├── utils/
│   │   │   ├── bmwCatalogMedia.js
│   │   │   └── formatters.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
├── database/
│   └── bmw_premium_motors.sql
├── docs/
│   ├── postman/
│   │   ├── BMW-Premium-Motors-Dia2.postman_collection.json
│   │   └── BMW-Premium-Motors-Dia2.postman_environment.json
│   ├── DER-dia-2.md
│   ├── DER-dia-2.mmd
│   └── investigacion-jwt.md
└── README.md
```

---

## 5. Configuración de MySQL

El sistema utiliza la base de datos **`bmw_premium_motors`**.
- Si la base de datos ya fue creada en el Día 1, **no debe eliminarse ni recrearse**: todos sus registros existentes se conservan intactos.
- En una instalación limpia desde cero, cree únicamente el contenedor vacío de la base de datos en MySQL:

```sql
CREATE DATABASE IF NOT EXISTS bmw_premium_motors
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

---

## 6. Configuración de `backend/.env`

Copie `backend/.env.example` hacia `backend/.env` y complete sus valores locales (el archivo `backend/.env` está excluido en `.gitignore` y nunca debe subirse al repositorio):

```env
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=SU_PASSWORD_MYSQL
DB_NAME=bmw_premium_motors
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=PEGUE_AQUI_LA_CLAVE_HEXADECIMAL_GENERADA
JWT_EXPIRES_IN=1h
```

En `frontend/.env` (basado en `frontend/.env.example`):

```env
VITE_API_URL=http://localhost:3001/api
```

---

## 7. Generación de `JWT_SECRET`

`JWT_SECRET` nunca está definido en el código fuente ni tiene valores por defecto. Si falta o tiene menos de 32 caracteres, el backend abortará el inicio de forma controlada.

Para generar una clave criptográficamente segura de 64 bytes (128 caracteres hexadecimales) en **Windows PowerShell**, ejecute:

```powershell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copie la cadena resultante y asígnela a `JWT_SECRET=` dentro de `backend/.env`.

---

## 8. Instalación de Dependencias

Abra dos terminales o ejecute secuencialmente:

```bash
# 1. Dependencias del Backend
cd backend
npm install

# 2. Dependencias del Frontend
cd ../frontend
npm install
```

---

## 9. Ejecución de Inicialización y Migraciones Incrementales

Desde la carpeta `backend/`:

```bash
# Verifica las 5 tablas comerciales e inserta el catálogo inicial (solo si aún no se ejecutó en Día 1; es idempotente)
npm run db:init

# Ejecuta las migraciones incrementales del Día 2 (crea schema_migrations y la tabla usuarios sin alterar datos previos)
npm run db:migrate
```

Qué realiza `npm run db:migrate`:
1. Lee las credenciales de `backend/.env`.
2. Crea la tabla de control `schema_migrations` si no existe.
3. Verifica si `001_create_usuarios.sql` ya fue aplicada.
4. Crea únicamente la tabla `usuarios` si no existe y registra la migración.
5. Comprueba en `information_schema` que `usuarios` y las 5 tablas comerciales estén listas y cierra la conexión.

---

## 10. Inicio del Backend

Desde la carpeta `backend/`:

```bash
npm run dev
```
*(Para ejecución estándar sin recarga automática: `npm start`).*
- Servidor activo en: `http://localhost:3001`
- Verificación de salud: `http://localhost:3001/api/health`

> **Nota sobre despliegues en producción:** En local se emplea HTTP sobre `localhost`. En cualquier entorno productivo el backend debe desplegarse detrás de **HTTPS/TLS** (con `NODE_ENV=production` activo para exigir tráfico seguro y activar cabeceras HSTS).

---

## 11. Inicio del Frontend

Desde la carpeta `frontend/`:

```bash
npm run dev
```
- Aplicación disponible en: `http://localhost:5173`

---

## 12. Proceso de Registro (`POST /api/auth/register` y `/registro`)

1. Ingrese a `http://localhost:5173/registro` (o pulse **Registrarse ahora** desde `/login`).
2. Complete `nombre`, `correo`, `password` (mínimo 8 caracteres y máximo 72 bytes UTF-8) y confirmación de contraseña coincidente.
3. El backend normaliza el correo a minúsculas, comprueba que no esté duplicado (devolviendo `HTTP 400` si ya existe), cifra la contraseña con `bcrypt.hash(password, 12)` y guarda el registro en `usuarios`.
4. Responde `HTTP 201` con los datos públicos del usuario (`id_usuario`, `nombre`, `correo`) sin incluir jamás `password_hash`, y redirige a `/login` con aviso de éxito.

---

## 13. Proceso de Login (`POST /api/auth/login` y `/login`)

1. Ingrese su correo y contraseña en `http://localhost:5173/login`.
2. El backend localiza al usuario por correo y verifica la contraseña mediante `bcrypt.compare()`. Si las credenciales no coinciden, responde `HTTP 401`.
3. Si son válidas, emite un JWT firmado con `HS256` (`expiresIn: "1h"`, `iss: "bmw-premium-motors-api"`, `aud: "bmw-premium-motors-client"`, `sub: "<id_usuario>"`).
4. React guarda el token y el usuario en el estado de `AuthContext` (en memoria), verifica el perfil con `GET /api/auth/me` y redirige automáticamente a `/dashboard`, mostrando el nombre y correo reales en la barra superior.

---

## 14. Cómo Funciona el Token JWT en el Sistema

- **Almacenamiento exclusivo en memoria:** El JWT **no** se guarda en `localStorage` ni `sessionStorage`. Vive únicamente en `AuthContext` y en una variable privada del módulo `frontend/src/services/api.js`.
- **Inyección automática:** Un interceptor de solicitudes en Axios adjunta `Authorization: Bearer <token>` exclusivamente cuando la petición va dirigida al origen autorizado de nuestra API (`http://localhost:3001/api`), evitando fugas hacia dominios externos.
- **Validación en cada petición:** `authMiddleware.js` verifica firma `HS256`, `iss`, `aud`, vigencia `exp`, extrae `sub`, consulta al usuario en MySQL y adjunta `req.user`.
- **Expiración (`1h`) y manejo de `401`:** Si el token vence o es inválido, el backend responde `HTTP 401` (`{ "error": "No autorizado" }`). El interceptor de respuestas de Axios limpia el token y el usuario en memoria, muestra un aviso informativo y redirige de inmediato a `/login`.
- **Recarga de navegador (`F5`):** Como el token reside solo en memoria, al recargar completamente el navegador la memoria de JavaScript se reinicia y se solicita iniciar sesión nuevamente.

---

## 15. Cómo Cerrar Sesión

Haga clic en el botón **Cerrar sesión** ubicado en la esquina superior derecha de la barra superior (`Topbar`) o en el pie del menú lateral (`Sidebar`). Al presionarlo:
1. Se borra la referencia del token en memoria en `services/api.js` y cualquier cabecera `Authorization`.
2. Se restablecen `token = null` y `usuario = null` en `AuthContext`.
3. La aplicación redirige inmediatamente a `/login`, bloqueando el acceso a todas las rutas privadas.

---

## 16. Endpoints Públicos

| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Verifica disponibilidad operativa de la API y conexión a MySQL sin exponer datos sensibles |
| `POST` | `/api/auth/register` | Registra un nuevo usuario con contraseña cifrada mediante `bcrypt` (12 rondas) |
| `POST` | `/api/auth/login` | Valida credenciales y emite un Access Token JWT válido por `1h` |

---

## 17. Endpoints Protegidos (Requieren `Authorization: Bearer <token>`)

| Módulo | Endpoints Protegidos |
| :--- | :--- |
| **Perfil Autenticado** | `GET /api/auth/me` |
| **Dashboard Ejecutivo** | `GET /api/dashboard/resumen` |
| **Modelos BMW** | `GET /api/modelos`, `GET /api/modelos/:id`, `POST /api/modelos`, `PUT /api/modelos/:id`, `DELETE /api/modelos/:id` |
| **Vehículos** | `GET /api/vehiculos`, `GET /api/vehiculos/:id`, `POST /api/vehiculos`, `PUT /api/vehiculos/:id`, `DELETE /api/vehiculos/:id` |
| **Clientes** | `GET /api/clientes`, `GET /api/clientes/:id`, `POST /api/clientes`, `PUT /api/clientes/:id`, `DELETE /api/clientes/:id` |
| **Vendedores** | `GET /api/vendedores`, `GET /api/vendedores/:id`, `POST /api/vendedores`, `PUT /api/vendedores/:id`, `DELETE /api/vendedores/:id` |
| **Ventas (Transaccional)** | `GET /api/ventas`, `GET /api/ventas/:id`, `POST /api/ventas`, `PUT /api/ventas/:id`, `DELETE /api/ventas/:id` |
| **Sucursales Oficiales** | `GET /api/sucursales`, `GET /api/sucursales/:id`, `POST /api/sucursales`, `PUT /api/sucursales/:id`, `DELETE /api/sucursales/:id` |
| **Accesorios M Performance** | `GET /api/accesorios`, `GET /api/accesorios/:id`, `POST /api/accesorios`, `PUT /api/accesorios/:id`, `DELETE /api/accesorios/:id` |
| **Proveedores OEM** | `GET /api/proveedores`, `GET /api/proveedores/:id`, `POST /api/proveedores`, `PUT /api/proveedores/:id`, `DELETE /api/proveedores/:id` |
| **Garantías Certified** | `GET /api/garantias`, `GET /api/garantias/:id`, `POST /api/garantias`, `PUT /api/garantias/:id`, `DELETE /api/garantias/:id` |
| **Taller & Mantenimiento** | `GET /api/mantenimientos`, `GET /api/mantenimientos/:id`, `POST /api/mantenimientos`, `PUT /api/mantenimientos/:id`, `DELETE /api/mantenimientos/:id` |
| **Financiamiento BMW** | `GET /api/financiamientos`, `GET /api/financiamientos/:id`, `POST /api/financiamientos`, `PUT /api/financiamientos/:id`, `DELETE /api/financiamientos/:id` |
| **Pruebas de Manejo** | `GET /api/pruebas-manejo`, `GET /api/pruebas-manejo/:id`, `POST /api/pruebas-manejo`, `PUT /api/pruebas-manejo/:id`, `DELETE /api/pruebas-manejo/:id` |
| **Pólizas de Seguro** | `GET /api/seguros`, `GET /api/seguros/:id`, `POST /api/seguros`, `PUT /api/seguros/:id`, `DELETE /api/seguros/:id` |
| **Bitácora Auditoría** | `GET /api/auditoria-logs`, `GET /api/auditoria-logs/:id`, `POST /api/auditoria-logs` |
| **Reportes Inteligencia** | `GET /api/reportes/ventas-periodo`, `GET /api/reportes/inventario-valorizado`, `GET /api/reportes/rendimiento-asesores`, `GET /api/reportes/resumen-ejecutivo` |

---

## 18. Cómo Probar en Postman

1. Abra **Postman** e importe los dos archivos ubicados en `docs/postman/`:
   - Colección: `docs/postman/BMW-Premium-Motors-Dia2.postman_collection.json`
   - Entorno: `docs/postman/BMW-Premium-Motors-Dia2.postman_environment.json`
2. Seleccione el entorno **BMW Premium Motors - Día 2 (Local)** en la esquina superior derecha de Postman (`baseUrl = http://localhost:3001/api`).
3. Ejecute primero la carpeta **1. Autenticación y Seguridad JWT**:
   - La petición **1.4 POST /auth/login** incluye un script automático en la pestaña *Tests* que guarda el JWT recibido en la variable de entorno `{{token}}`.
4. Ejecute en orden las carpetas **2 a 8** (o utilice *Run Collection* en el Collection Runner): cada creación guarda automáticamente `{{idModelo}}`, `{{idVehiculo}}`, `{{idCliente}}`, `{{idVendedor}}` e `{{idVenta}}` y valida respuestas `200`, `201`, `400`, `401`, `404` y `409`.

---

## 19. Códigos de Estado HTTP

| Código | Significado en BMW Premium Motors |
| :--- | :--- |
| **`200 OK`** | Consulta, inicio de sesión, actualización o eliminación ejecutada exitosamente. |
| **`201 Created`** | Nuevo usuario o registro empresarial creado exitosamente en MySQL. |
| **`400 Bad Request`** | Error de validación de campos, contraseña inválida (< 8 caracteres o > 72 bytes), correo ya registrado en `/auth/register` o clave foránea inexistente. |
| **`401 Unauthorized`** | Falta de encabezado `Authorization: Bearer`, token vencido/alterado (`{ "error": "No autorizado" }`) o credenciales incorrectas en login. |
| **`404 Not Found`** | Registro empresarial o ruta solicitada inexistente. |
| **`409 Conflict`** | Violación de integridad referencial (intentar borrar registros con dependencias), duplicidad de campos únicos comerciales (`VIN`, `identificacion`, `nombre` de modelo) o intento de vender un vehículo no `Disponible`. |
| **`429 Too Many Requests`** | Límite de intentos de autenticación alcanzado en `/api/auth/login` o `/api/auth/register`. |
| **`500 Internal Server Error`** | Error interno controlado del servidor sin exposición de trazas ni secretos. |

---

## 20. Solución de Errores Comunes

- **El backend se detiene al iniciar indicando `JWT_SECRET_MISSING` o `JWT_SECRET_WEAK`:**
  Genere una clave con `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` y colóquela en `JWT_SECRET=` dentro de `backend/.env`.
- **Error `Table 'bmw_premium_motors.usuarios' doesn't exist`:**
  Ejecute `cd backend && npm run db:migrate` para aplicar la migración incremental `001_create_usuarios.sql`.
- **Respuestas `401 { "error": "No autorizado" }` en Postman o tras 1 hora de uso:**
  El token no fue enviado o superó su vigencia de `1h`. Vuelva a ejecutar `POST /api/auth/login` (en Postman actualiza automáticamente `{{token}}`) o inicie sesión nuevamente en `http://localhost:5173/login`.
- **Al presionar `F5` en el navegador solicita iniciar sesión de nuevo:**
  Es el comportamiento esperado de seguridad por diseño: el token se conserva exclusivamente en memoria de React (`AuthContext`) y nunca se escribe en `localStorage` ni `sessionStorage`.
- **Error `409 Conflict` al eliminar un modelo, vehículo, cliente o vendedor:**
  El registro posee operaciones dependientes asociadas (por ejemplo, una venta activa). Elimine primero la venta vinculada (lo cual devolverá automáticamente el vehículo a `Disponible`) antes de eliminar el registro padre.
