# BMW Premium Motors — Sistema Empresarial Full Stack (25 Controladores & 24 Entidades MySQL)

[![GitHub Repository](https://img.shields.io/badge/GitHub-ulyssesquiros--FWD%2Fbmw--sales-181717?style=for-the-badge&logo=github)](https://github.com/ulyssesquiros-FWD/bmw-sales)
[![React](https://img.shields.io/badge/React_18-Vite_6-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express_4-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-InnoDB_8.0-4479A1?style=for-the-badge&logo=mysql)](https://www.mysql.com/)
[![JWT](https://img.shields.io/badge/Security-JWT_HS256_+_bcrypt_12-000000?style=for-the-badge&logo=jsonwebtokens)](https://jwt.io/)

---

## 1. Credenciales Oficiales de Acceso

Para acceder al sistema a través de la interfaz web ([http://localhost:5173/login](http://localhost:5173/login)):

| Perfil | Correo Electrónico | Contraseña | Nivel de Acceso |
| :--- | :--- | :--- | :--- |
| **Usuario Ejecutivo (Ulysses)** | `ulysses@bmwpremiummotors.com` | `AdminBMW2026!` | Acceso Total (25 Controladores y 24 Entidades) |
| **Administrador General** | `admin@bmwpremiummotors.com` | `AdminBMW2026!` | Acceso Total (25 Controladores y 24 Entidades) |

> **Nota de Seguridad:** Las contraseñas están almacenadas mediante hash adaptativo **`bcrypt` a 12 salt rounds**. Los tokens JWT emitidos se gestionan estrictamente en la memoria de la aplicación React (`AuthContext`), mitigando riesgos de almacenamiento inseguro en `localStorage` o `sessionStorage`.

---

## 2. Descripción del Proyecto

**BMW Premium Motors** es una plataforma empresarial Full Stack de grado corporativo desarrollada para la administración integral de un concesionario oficial de vehículos BMW, incluyendo la gama de altas prestaciones **BMW `///M`** y la edición de **Mención Especial BMW X5 M 2012 (E70) en acabado *Titanium Silver Metallic***.

### Hitos y Arquitectura Evolutiva:
- **Día 1:** Modelado relacional en MySQL de las 5 entidades comerciales (`modelos`, `vehiculos`, `clientes`, `vendedores`, `ventas`), transacciones ACID con `SELECT ... FOR UPDATE`, diseño editorial inspirado en `bmw.com`, logotipos vectoriales oficiales y visualizador fotográfico 360° por unidad.
- **Día 2:** Incorporación de la entidad `usuarios`, sistema de migraciones incrementales idempotentes, autenticación segura basada en **JWT (`HS256`)**, middleware transversal en Express, control de fuerza bruta (*rate limiting*) y rutas privadas protegidas en React.
- **Ampliación Empresarial 360°:** Expansión integral a **24 tablas relacionales en MySQL** y **25 controladores REST**, incorporando cotizaciones, facturas CFDI, pedidos a plantas de ensamble (Múnich, Spartanburg, Dingolfing, SLP), certificaciones 110 puntos CPO, campañas de marketing, encuestas de satisfacción CSI, almacén de refacciones técnicas y reclamaciones de garantía RMA.

---

## 3. Tecnologías Utilizadas

### Frontend (`http://localhost:5173`)
- **React 18** + **Vite 6**
- **React Router DOM v6** (Rutas públicas, privadas, `RutaProtegida` y preservación de redirección post-login)
- **React Context API (`AuthContext`)** (Sesión segura en memoria de ejecución)
- **Axios** (Interceptores HTTP automáticos para adjuntar `Authorization: Bearer <token>` y captura de `401 Unauthorized`)
- **Lucide React** (Iconografía ejecutiva)
- **CSS3 Personalizado Responsive** (Línea gráfica corporativa BMW y división `///M Motorsport`)

### Backend (`http://localhost:3001`)
- **Node.js** + **Express 4**
- **mysql2/promise** (Pool de conexiones de alto rendimiento, consultas parametrizadas anti-SQL Injection y transacciones ACID)
- **jsonwebtoken** (Firma y verificación criptográfica estricta con expiración de 1h)
- **bcrypt** (Cifrado adaptativo con **12 rondas de sal**)
- **express-validator** (Validación de esquemas, formatos, RFC, VIN de 17 caracteres y UUIDs)
- **express-rate-limit** (Mitigación de ataques de fuerza bruta en endpoints de acceso)
- **helmet** + **cors** + **dotenv**

### Base de Datos (`localhost:3306`)
- **MySQL 8.0+** (`bmw_premium_motors`, motor de almacenamiento **InnoDB**, codificación **`utf8mb4_unicode_ci`**)

---

## 4. Estructura de las 24 Entidades de Base de Datos

```text
RECUENTO DE TABLAS EN LA BASE DE DATOS (bmw_premium_motors):
----------------------------------------------------------------------------------------
 1. modelos               : Catálogo técnico de modelos BMW y división ///M
 2. vehiculos             : Inventario de unidades con VINs auténticos y estados
 3. clientes              : Cartera de compradores VIP con RFC e identificación
 4. vendedores            : Asesores comerciales certificados BMW
 5. ventas                : Operaciones comerciales con transacciones ACID
 6. usuarios              : Operadores del sistema con contraseñas en bcrypt
 7. sucursales            : Red oficial de concesionarios y agencias
 8. accesorios            : Piezas y boutique oficial BMW M Performance Parts
 9. proveedores           : Fabricantes OEM Tier 1 (Brembo, Akrapovič, Michelin, ZF)
10. garantias             : Pólizas Certified Pre-Owned y BMW Service Inclusive
11. mantenimientos        : Órdenes de trabajo en taller con diagnóstico ISTA+
12. financiamientos       : Líneas de crédito BMW Financial Services Select
13. pruebas_manejo        : Calendario de Test Drives y Driving Experience VIP
14. seguros               : Pólizas de cobertura amplia con aseguradoras de alta gama
15. auditoria_logs        : Trazabilidad de seguridad y bitácora de eventos del sistema
16. cotizaciones          : Cotizaciones formales con enganche y propuesta financiera
17. facturas              : Comprobantes fiscales digitales (CFDI) con UUID fiscal
18. pedidos_fabrica       : Trazabilidad de ensamble y transporte desde plantas BMW
19. inspecciones_cpo      : Checklists oficiales de certificación de 110 puntos CPO
20. campanas_marketing    : Eventos de lanzamiento M, Track Days y gestión de leads
21. encuestas_satisfaccion: Evaluaciones de calidad CSI (Customer Satisfaction Index)
22. almacen_refacciones   : Almacén de fluidos TwinPower, frenos M y consumibles
23. reclamaciones_garantia: Reclamaciones RMA canalizadas formalmente ante BMW AG
24. schema_migrations     : Control de versiones y trazabilidad de migraciones SQL
----------------------------------------------------------------------------------------
```

---

## 5. Estructura de los 25 Controladores y Endpoints REST

Todos los endpoints empresariales requieren la cabecera `Authorization: Bearer <token>`:

| # | Controlador | Endpoint Base | Operaciones Disponibles |
|---|:---|:---|:---|
| 1 | `authController.js` | `/api/auth` | `POST /register`, `POST /login`, `GET /me` |
| 2 | `modeloController.js` | `/api/modelos` | `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id` |
| 3 | `vehiculoController.js` | `/api/vehiculos` | `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id` |
| 4 | `clienteController.js` | `/api/clientes` | `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id` |
| 5 | `vendedorController.js` | `/api/vendedores` | `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id` |
| 6 | `ventaController.js` | `/api/ventas` | `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id` (Transacciones ACID) |
| 7 | `dashboardController.js` | `/api/dashboard` | `GET /resumen`, `GET /health` |
| 8 | `sucursalController.js` | `/api/sucursales` | `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id` |
| 9 | `accesorioController.js` | `/api/accesorios` | `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id` |
| 10 | `proveedorController.js` | `/api/proveedores` | `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id` |
| 11 | `garantiaController.js` | `/api/garantias` | `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id` |
| 12 | `mantenimientoController.js` | `/api/mantenimientos` | `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id` |
| 13 | `financiamientoController.js` | `/api/financiamientos` | `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id` |
| 14 | `pruebaManejoController.js` | `/api/pruebas-manejo` | `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id` |
| 15 | `seguroController.js` | `/api/seguros` | `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id` |
| 16 | `auditoriaLogController.js` | `/api/auditoria-logs` | `GET /`, `GET /:id`, `POST /` |
| 17 | `reporteController.js` | `/api/reportes` | `GET /ventas-periodo`, `GET /inventario-valorizado`, `GET /rendimiento-asesores`, `GET /resumen-ejecutivo` |
| 18 | `cotizacionController.js` | `/api/cotizaciones` | `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id` |
| 19 | `facturaController.js` | `/api/facturas` | `GET /`, `GET /:id`, `POST /` (Timbrado CFDI) |
| 20 | `pedidoFabricaController.js` | `/api/pedidos-fabrica` | `GET /`, `GET /:id`, `POST /`, `PATCH /:id/estado` |
| 21 | `inspeccionCpoController.js` | `/api/inspecciones-cpo` | `GET /`, `GET /:id`, `POST /` (Checklist 110 Pts) |
| 22 | `campanaMarketingController.js` | `/api/campanas-marketing` | `GET /`, `GET /:id`, `POST /` |
| 23 | `encuestaSatisfaccionController.js` | `/api/encuestas-satisfaccion` | `GET /`, `GET /:id`, `POST /` (CSI / NPS) |
| 24 | `almacenRefaccionController.js` | `/api/almacen-refacciones` | `GET /`, `GET /:id`, `POST /` |
| 25 | `reclamacionGarantiaController.js` | `/api/reclamaciones-garantia` | `GET /`, `GET /:id`, `POST /` (RMA ante BMW AG) |

---

## 6. Guía de Instalación y Puesta en Marcha

### Prerrequisitos
- **Node.js** (versión 18 o superior)
- **MySQL Server** (versión 8.0 o superior)
- **Git**

### Paso 1: Clonar el Repositorio
```bash
git clone https://github.com/ulyssesquiros-FWD/bmw-sales.git
cd bmw-sales
```

### Paso 2: Configuración del Backend
1. Ingrese a la carpeta `backend`:
   ```bash
   cd backend
   npm install
   ```
2. Cree el archivo `.env` tomando como base `.env.example`:
   ```env
   PORT=3001
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=su_contraseña_mysql
   DB_NAME=bmw_premium_motors
   CORS_ORIGIN=http://localhost:5173
   JWT_SECRET=coloque_aqui_una_clave_secreta_segura_de_al_menos_64_caracteres
   JWT_EXPIRES_IN=1h
   ```

### Paso 3: Inicializar la Base de Datos y Migraciones
Desde la carpeta `backend`:
```bash
# 1. Crea la base de datos y las tablas base
npm run db:init

# 2. Aplica las migraciones incrementales de manera idempotente
npm run db:migrate

# 3. Poblar el catálogo completo de 24 tablas con datos auténticos BMW
npm run db:seed:all
```

### Paso 4: Iniciar el Servidor Backend
```bash
npm run dev
```
El servidor backend quedará escuchando en `http://localhost:3001`.

### Paso 5: Configuración e Inicio del Frontend
En una nueva terminal, ingrese a la carpeta `frontend`:
```bash
cd frontend
npm install
npm run dev
```
La aplicación web quedará accesible en `http://localhost:5173`.

---

## 7. Módulos y Portales Especializados en el Frontend

La aplicación cuenta con una barra de navegación organizada por departamentos:

```text
├── SHOWROOM & COMERCIAL
│   ├── /dashboard         -> Showroom Ejecutivo & Salud de API
│   ├── /modelos           -> Catálogo Técnico de Modelos & Gama ///M
│   ├── /vehiculos         -> Inventario Físico & Galería 360°
│   ├── /clientes          -> Gestión de Clientes VIP
│   ├── /vendedores        -> Asesores Comerciales Certificados
│   └── /ventas            -> Operaciones de Venta (Transaccional)
├── POSVENTA & SERVICIOS M
│   ├── /taller            -> Bahías Mecánicas & Diagnóstico ISTA+
│   ├── /accesorios        -> Boutique M Performance (con Cotizador de Instalación)
│   └── /pruebas-manejo    -> Pruebas de Manejo VIP (Test Drives)
├── FINANZAS & RED OFICIAL
│   ├── /financiamiento    -> Simulador Financiero BMW Select & Líneas de Crédito
│   └── /sucursales        -> Directorio de Agencias Masaryk, Santa Fe, MTY, GDL, etc.
└── INTELIGENCIA & GESTIÓN
    ├── /reportes          -> Business Intelligence, Rendimiento Asesores & Exportador CSV
    └── /ecosistema        -> Ecosistema 360° con Pestañas para las 24 Entidades
```

---

## 8. Documentación Técnica Complementaria

En la carpeta [`docs/`](./docs/) se encuentran disponibles los informes de arquitectura:
- **Justificación Empresarial:** [`docs/justificacion-empresarial.md`](./docs/justificacion-empresarial.md)
- **Diagrama Entidad-Relación Día 1:** [`docs/DER-dia-1.md`](./docs/DER-dia-1.md)
- **Investigación de Seguridad JWT:** [`docs/investigacion-jwt.md`](./docs/investigacion-jwt.md)
- **Diagrama Entidad-Relación Consolidado:** [`docs/DER-dia-2.md`](./docs/DER-dia-2.md)
- **Auditoría Integral de Código:** [`docs/auditoria/AUDITORIA_GENERAL.md`](./docs/auditoria/AUDITORIA_GENERAL.md)
- **Colección Postman de Pruebas:** [`docs/postman/BMW-Premium-Motors-Dia2.postman_collection.json`](./docs/postman/BMW-Premium-Motors-Dia2.postman_collection.json)

---

## 9. Licencia y Créditos

Desarrollado para **BMW Premium Motors** por Ulysses Quirós ([@ulyssesquiros-FWD](https://github.com/ulyssesquiros-FWD)).  
Todos los logotipos y marcas son propiedad intelectual de **Bayerische Motoren Werke AG**.
