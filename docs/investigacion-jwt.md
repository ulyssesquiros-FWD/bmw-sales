# Investigación Técnica sobre Autenticación Basada en JSON Web Tokens (JWT)

**Proyecto:** BMW Premium Motors — Mini Proyecto 1, Día 2  
**Enfoque:** Arquitectura de seguridad web para API REST en Node.js + Express, persistencia en MySQL y cliente SPA en React (Vite)

---

## Tabla de Contenidos

- [A. ¿Qué es JWT?](#a-qué-es-jwt)
- [B. Estructura del JWT](#b-estructura-del-jwt)
- [C. Generación y Validación en Node.js](#c-generación-y-validación-en-nodejs)
- [D. Expiración y Renovación](#d-expiración-y-renovación)
- [E. Almacenamiento del Token en React](#e-almacenamiento-del-token-en-react)
- [F. Middleware de Autenticación](#f-middleware-de-autenticación)
- [G. Buenas Prácticas de Seguridad](#g-buenas-prácticas-de-seguridad)
- [H. Fuentes Técnicas Oficiales Consultadas](#h-fuentes-técnicas-oficiales-consultadas)
- [Conclusiones Aplicadas a BMW Premium Motors](#conclusiones-aplicadas-a-bmw-premium-motors)

---

## A. ¿Qué es JWT?

Un **JSON Web Token (JWT)**, estandarizado en el **RFC 7519** por el IETF, es un formato compacto, autocontenido y seguro para URLs (*URL-safe*) diseñado para representar un conjunto de afirmaciones (*claims*) en formato JSON que se transmiten entre dos partes (por ejemplo, entre el cliente React y la API REST Express de **BMW Premium Motors**).

### ¿Para qué sirve y cómo funciona entre Frontend y Backend?

En arquitecturas tradicionales basadas en sesiones de servidor, tras iniciar sesión el backend crea un registro de sesión en memoria o base de datos y entrega un identificador opaco (`session_id`). En cambio, en una API REST *stateless* (sin estado de sesión en memoria del servidor), JWT permite **autenticación verificable criptográficamente**:

1. **Autenticación inicial (`POST /api/auth/login`):** El usuario envía sus credenciales (`correo` y `password`) sobre el cuerpo de la petición.
2. **Verificación y emisión:** El servidor valida la contraseña contra el `password_hash` almacenado en MySQL mediante `bcrypt.compare()`. Si coincide, el backend firma digitalmente un JWT utilizando una clave secreta de alta entropía (`JWT_SECRET`) conocida únicamente por el servidor.
3. **Transporte en cabeceras HTTP:** El cliente React almacena el token recibido en memoria y lo adjunta en cada petición hacia rutas empresariales protegidas mediante el estándar HTTP `Authorization`:
   ```http
   Authorization: Bearer <token>
   ```
4. **Verificación por petición:** El middleware del backend recibe el token, recalcula o comprueba su firma criptográfica, verifica vigencia temporal (`exp`), emisor (`iss`), audiencia (`aud`) y algoritmo (`HS256`), e identifica de manera confiable al usuario (`sub`) sin que el cliente haya podido falsificar ni alterar ningún dato del token.

---

## B. Estructura del JWT

Todo JWT firmado bajo la especificación **JWS (JSON Web Signature, RFC 7515)** se compone de **tres segmentos codificados en Base64URL** separados por puntos (`.`):

```text
<HEADER_BASE64URL>.<PAYLOAD_BASE64URL>.<SIGNATURE_BASE64URL>
```

### 1. Header (Encabezado JOSE)
Es un objeto JSON que describe los metadatos criptográficos del token:
- `alg`: Algoritmo criptográfico empleado para firmar el token (en **BMW Premium Motors**, `HS256`, es decir, HMAC con SHA-256).
- `typ`: Tipo de medio del token (`JWT`).

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

### 2. Payload (Carga útil o *Claims*)
Contiene las declaraciones (*claims*) acerca de la entidad autenticada y metadatos de validez del token. El RFC 7519 clasifica los claims en tres categorías:
- **Registered Claims (estándar):**
  - `sub` (*Subject*): Identificador único del sujeto autenticado (en nuestro sistema, el `id_usuario` convertido a cadena, p. ej. `"1"`).
  - `iss` (*Issuer*): Identificador del emisor legítimo del token (`"bmw-premium-motors-api"`).
  - `aud` (*Audience*): Destinatario previsto para el que fue emitido el token (`"bmw-premium-motors-client"`).
  - `iat` (*Issued At*): Marca de tiempo Unix (en segundos) en que fue emitido el token.
  - `exp` (*Expiration Time*): Marca de tiempo Unix a partir de la cual el token debe ser rechazado obligatoriamente.
- **Public / Private Claims:** Campos adicionales acordados entre emisor y consumidor. Por principio de **minimización de datos**, en **BMW Premium Motors** solo se incluye el identificador mínimo necesario (`sub`) junto con los claims registrados estándar.

```json
{
  "sub": "1",
  "iat": 1762340400,
  "exp": 1762344000,
  "aud": "bmw-premium-motors-client",
  "iss": "bmw-premium-motors-api"
}
```

### 3. Signature (Firma criptográfica)
Garantiza dos propiedades críticas de seguridad:
1. **Autenticidad de origen:** Solo quien posee el `JWT_SECRET` pudo haber generado esa firma.
2. **Integridad:** Si un atacante modifica un solo bit del `Header` o del `Payload` (por ejemplo, cambiar `"sub": "1"` por `"sub": "2"` o extender `exp`), el cálculo HMAC resultante será completamente distinto y el servidor rechazará el token con `HTTP 401`.

Para el algoritmo `HS256`, la firma se calcula como:

```text
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  JWT_SECRET
)
```

### Ejemplo completo de JWT y desglose de sus secciones

```text
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzYyMzQwNDAwLCJleHAiOjE3NjIzNDQwMDAsImF1ZCI6ImJtdy1wcmVtaXVtLW1vdG9ycy1jbGllbnQiLCJpc3MiOiJibXctUHJlbWl1bS1tb3RvcnMtYXBpIn0.8vP7zQ9xR1mN4kL2wY6cT0bV5jH3gF8dS2aE9uI1oP4
```

- **Segmento 1 (`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`):** Al decodificar desde Base64URL produce `{"alg":"HS256","typ":"JWT"}`. Indica que debe validarse con HMAC-SHA256.
- **Segmento 2 (`eyJzdWIiOiIxIi...`):** Al decodificar desde Base64URL expone que el sujeto es el usuario con `id_usuario = 1`, emitido en `1762340400`, válido exactamente durante 3600 segundos (`1h`) exclusivamente para el cliente `bmw-premium-motors-client` por `bmw-premium-motors-api`.
- **Segmento 3 (`8vP7zQ9xR1...`):** Resumen criptográfico HMAC-SHA256 de 256 bits codificado en Base64URL. Sin `JWT_SECRET`, es computacionalmente inviable falsificar este valor.

### Advertencia fundamental: Firmado (JWS) NO equivale a Cifrado (JWE)
Un error común en desarrollo web es confundir **codificación + firma** con **cifrado**. Un JWT estándar (JWS) únicamente codifica el `Header` y el `Payload` en **Base64URL** para transporte seguro en cabeceras HTTP. **Cualquier persona o script que obtenga el token puede decodificar instantáneamente el payload con `Buffer.from(seg, 'base64url').toString('utf8')` o `atob()` y leer su contenido en texto claro**.
Por ello:
- La firma impide **modificar** el contenido sin ser detectado, pero **no oculta** el contenido.
- Si se requiriera confidencialidad del payload habría que emplear **JWE (JSON Web Encryption, RFC 7516)**.
- En consecuencia, **jamás** deben incluirse contraseñas, `password_hash`, secretos internos, datos financieros ni información comercial confidencial dentro del payload de un JWT.

---

## C. Generación y Validación en Node.js

En el ecosistema Node.js, la librería de referencia mantenida por Auth0 es **`jsonwebtoken`**. Su uso seguro exige especificar explícitamente los parámetros criptográficos tanto al firmar como al verificar para prevenir ataques conocidos (como *Algorithm Confusion* o el histórico ataque `alg: "none"`).

### 1. Emisión segura con `jwt.sign()`

```javascript
const jwt = require('jsonwebtoken');

const JWT_ISSUER = 'bmw-premium-motors-api';
const JWT_AUDIENCE = 'bmw-premium-motors-client';
const JWT_ALGORITHM = 'HS256';

function generateAccessToken(idUsuario) {
  // Payload mínimo: sin datos sensibles ni comerciales
  const payload = {};

  return jwt.sign(payload, process.env.JWT_SECRET, {
    algorithm: JWT_ALGORITHM,
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    subject: String(idUsuario) // Registra el claim estándar "sub"
  });
}
```

- **`expiresIn`:** Define la ventana de vida útil (`'1h'` suma automáticamente 3600 segundos a `iat` para calcular `exp`).
- **Claims automáticos (`sub`, `iat`, `exp`, `iss`, `aud`):** `jsonwebtoken` calcula automáticamente `iat` con la hora actual del servidor y deriva `exp`, además de inyectar `sub`, `iss` y `aud` de manera consistente con el RFC 7519.

### 2. Validación estricta con `jwt.verify()`

Nunca debe usarse `jwt.decode()` para autorizar solicitudes, ya que `decode()` solo transforma Base64URL a JSON **sin comprobar la firma**. Siempre debe utilizarse `jwt.verify()` restringiendo explícitamente la lista blanca de algoritmos permitidos (`algorithms: ['HS256']`), el `issuer` y el `audience`:

```javascript
function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET, {
    algorithms: ['HS256'],
    issuer: 'bmw-premium-motors-api',
    audience: 'bmw-premium-motors-client',
    complete: false
  });
}
```

### ¿Por qué es obligatorio fijar `algorithms`, `issuer` y `audience`?
- **`algorithms: ['HS256']`:** Previene ataques de degradación o sustitución de algoritmo (*algorithm confusion*), donde un atacante modifica el encabezado `alg` para forzar `none` o cambiar de un algoritmo asimétrico (`RS256`) a uno simétrico (`HS256`).
- **`issuer` y `audience`:** Evitan ataques de *Cross-Service Token Replay*, impidiendo que un JWT válido emitido por otro microservicio o para otra aplicación cliente sea reutilizado contra la API de **BMW Premium Motors**.

---

## D. Expiración y Renovación

### ¿Qué sucede cuando vence un JWT o cuando es alterado?
- **Token vencido (`exp < ahora`):** `jwt.verify()` lanza `TokenExpiredError`. El middleware intercepta la excepción y devuelve `HTTP 401` (`{ "error": "No autorizado" }`) sin revelar detalles internos. El cliente limpia su estado en memoria y redirige al usuario a `/login`.
- **Token alterado (modificación en Header, Payload o Signature):** El recálculo del HMAC-SHA256 no coincide con la firma recibida y `jwt.verify()` lanza `JsonWebTokenError` (`invalid signature`). El servidor rechaza inmediatamente la petición con `HTTP 401`.

### ¿Qué es un Refresh Token y cómo funciona la renovación?
Dado que un *Access Token* JWT no puede invalidarse fácilmente sin consultar estado en servidor antes de su fecha `exp`, las arquitecturas de alta seguridad dividen las credenciales de sesión en dos artefactos:
1. **Access Token (corta duración, p. ej. 5–15 min):** Se utiliza para consumir los endpoints REST.
2. **Refresh Token (mayor duración, p. ej. 7 días):** Token opaco o criptográfico almacenado de forma persistente en base de datos (hasheado) y entregado idealmente en una cookie `HttpOnly; Secure; SameSite=Strict` restringida a la ruta `/api/auth/refresh`.

### Rotación, detección de robo y revocación de Refresh Tokens
Nunca debe permitirse que un token comprometido se renueve indefinidamente:
- **Refresh Token Rotation (RTR):** Cada vez que un Refresh Token se usa para obtener un nuevo Access Token, el servidor **invalida el Refresh Token usado** y emite uno nuevo perteneciente a la misma *familia de tokens*.
- **Detección de reutilización (*Reuse Detection*):** Si un atacante roba un Refresh Token y tanto el atacante como el usuario legítimo intentan usarlo, el segundo intento presentará un token ya rotado. El servidor detecta la brecha y **revoca automáticamente toda la familia de tokens** de ese usuario en base de datos, forzando re-autenticación inmediata.
- **Límite absoluto de sesión (*Absolute Timeout*):** Incluso con actividad continua, toda familia de tokens posee una expiración máxima absoluta tras la cual se exige credenciales completas nuevamente.

### Decisión arquitectónica para BMW Premium Motors (Día 2)
Para esta versión del sistema se implementa un **Access Token único con vigencia de 1 hora (`JWT_EXPIRES_IN=1h`) sin Refresh Tokens**, exigiendo iniciar sesión nuevamente al expirar:
1. **Superficie de ataque acotada:** Una ventana de 1 hora permite completar fluidamente operaciones administrativas de concesionario (registro de vehículos, clientes y ventas) limitando la vida útil del token sin introducir complejidad prematura de tablas de familias de refresh tokens.
2. **Revocación efectiva de usuarios eliminados:** Como nuestro middleware consulta la existencia del usuario en MySQL (`SELECT id_usuario, nombre, correo ... WHERE id_usuario = ?`) en cada petición autenticada, si una cuenta es dada de baja en base de datos su acceso queda bloqueado al instante incluso antes de cumplirse la hora.
3. **Evolución futura documentada:** En una fase productiva posterior, el sistema puede incorporar una tabla `sesiones_refresh` en MySQL con hash SHA-256 del refresh token, `familia_id`, `revocado`, `expira_en` y emisión mediante cookie `HttpOnly`.

---

## E. Almacenamiento del Token en React

El lugar donde una Single Page Application (SPA) almacena el JWT determina su exposición frente a las dos grandes familias de ataques en navegadores: **XSS (*Cross-Site Scripting*)** y **CSRF (*Cross-Site Request Forgery*)**.

### Comparativa técnica de mecanismos en el navegador

| Mecanismo | Persistencia al recargar (`F5`) / cerrar pestaña | Exposición a robo por XSS | Exposición a CSRF | Capacidad de enviar `Authorization: Bearer` |
| :--- | :--- | :--- | :--- | :--- |
| **`localStorage`** | Persistente indefinidamente en disco incluso al cerrar el navegador | **Crítica:** cualquier script JS en el origen (`window.localStorage.getItem(...)`) extrae el token al instante | Baja (no se envía automáticamente por el navegador) | Sí |
| **`sessionStorage`** | Persiste ante `F5` dentro de la misma pestaña; se borra al cerrar la pestaña | **Alta:** igualmente accesible desde cualquier JavaScript ejecutado en el DOM por XSS | Baja | Sí |
| **Memoria (`React Context` / variable de módulo)** | **Efímera:** desaparece al recargar el navegador o cerrar la pestaña | **Moderada-Baja (acotada a sesión viva):** no existe rastro en disco ni en `Web Storage`; un XSS previo o posterior a la sesión no halla tokens persistidos, aunque un XSS *activo durante la sesión* podría interceptar peticiones en curso | Baja (no hay envío automático por navegador) | **Sí (óptimo para `Bearer <token>`)** |
| **Cookies `HttpOnly; Secure; SameSite`** | Configurable (`Max-Age` / `Expires` o de sesión) | **Muy baja frente a exfiltración directa:** `document.cookie` no puede leer una cookie `HttpOnly` (aunque un XSS activo aún puede disparar `fetch` autenticado mientras dure la infección) | **Requiere mitigación explícita** (`SameSite=Lax/Strict`, tokens anti-CSRF, validación de `Origin`) | No directamente (el navegador envía encabezado `Cookie`, no `Authorization: Bearer`) |

### Análisis de riesgos clave
1. **XSS (*Cross-Site Scripting*):** Si un atacante logra inyectar JavaScript malicioso (por uso inseguro de `dangerouslySetInnerHTML`, dependencias comprometidas en `npm` o enlaces `javascript:`), cualquier token guardado en `localStorage` o `sessionStorage` es exfiltrado trivialmente en milisegundos y sigue siendo explotable fuera del equipo de la víctima.
2. **CSRF (*Cross-Site Request Forgery*):** Ocurre cuando un sitio externo malicioso induce al navegador autenticado del usuario a disparar una petición hacia la API adjuntando automáticamente cookies de sesión. Al usar el encabezado explícito `Authorization: Bearer <token>` combinado con CORS restringido (`http://localhost:5173`), el navegador **jamás** adjunta el token de forma automática desde otro origen.
3. **Persistencia de sesiones en terminales compartidas:** En un concesionario automotriz donde asesores o gerentes pueden compartir estaciones de trabajo en showroom, dejar un JWT persistido en `localStorage` permitiría que el siguiente operador acceda a datos comerciales con solo abrir el navegador.

### Decisión implementada en BMW Premium Motors
Para cumplir estrictamente el estándar **`Authorization: Bearer <token>`** maximizando la higiene de seguridad en el cliente React:
1. **Almacenamiento exclusivo en memoria (`AuthContext` + referencia privada en `services/api.js`):** No se utiliza `localStorage` ni `sessionStorage` bajo ninguna circunstancia.
2. **Limpieza total al cerrar sesión o recargar:** Al pulsar **Cerrar sesión** (o recargar el documento completo), la memoria del contexto de JavaScript se reinicia por completo, exigiendo autenticación fresca.
3. **Alcance realista frente a XSS:** Guardar el token en memoria elimina la persistencia en disco (`Web Storage`), pero **no sustituye la prevención de XSS**, dado que un script malicioso activo durante la sesión podría engancharse al runtime de la página. Por ello, React escapa por defecto todas las expresiones JSX, no utilizamos `dangerouslySetInnerHTML` y aplicamos cabeceras de seguridad con `helmet`.
4. **Recomendación para entorno productivo:** En un despliegue corporativo expuesto a Internet, la arquitectura recomendada consiste en un patrón **BFF (*Backend-for-Frontend*)** o emisión de sesión mediante **Cookies `HttpOnly; Secure; SameSite=Strict`**, complementado con validación de cabeceras `Origin`/`Referer`, tokens anti-CSRF sincronizados y una política estricta `Content-Security-Policy` (CSP).

---

## F. Middleware de Autenticación

En Express, la protección transversal se centraliza en `backend/src/middlewares/authMiddleware.js`. Su secuencia exacta de verificación sigue el principio *Fail-Closed* (rechazar ante cualquier anomalía sin filtrar información criptográfica interna):

1. **Lectura de la cabecera `Authorization`:** Se inspecciona `req.headers.authorization`. Si no existe o no es cadena de texto, retorna inmediatamente `HTTP 401` con `{ "error": "No autorizado" }`.
2. **Identificación del esquema `Bearer` y extracción del token:** Se valida que la cabecera contenga exactamente dos partes separadas por espacio (`Bearer <token>`) con prefijo `Bearer` y un token no vacío.
3. **Validación criptográfica del JWT (`tokenService.verifyAccessToken`):** Se invoca `jwt.verify()` forzando `algorithms: ['HS256']`, `issuer: 'bmw-premium-motors-api'` y `audience: 'bmw-premium-motors-client'`. Esto valida en un solo paso atómico firma, algoritmo, emisor, audiencia y no expiración (`exp`).
4. **Extracción y validación del sujeto (`sub`):** Se obtiene `decoded.sub`, comprobando que corresponda a un entero positivo válido (`id_usuario`).
5. **Consulta parametrizada en MySQL:** Se ejecuta `usuarioModel.findPublicById(idUsuario)` (`SELECT id_usuario, nombre, correo, fecha_creacion FROM usuarios WHERE id_usuario = ?`), excluyendo `password_hash` desde la propia consulta SQL.
6. **Comprobación de existencia e inyección en `req.user`:** Si el usuario no existe en MySQL (p. ej. cuenta eliminada después de emitirse el token), se responde `HTTP 401` (`{ "error": "No autorizado" }`). Si existe, sus datos públicos se asignan a `req.user` y se invoca `next()`.
7. **Opacidad de errores de autenticación:** Tanto la ausencia de token como un token vencido, malformado o con firma inválida devuelven el mismo cuerpo controlado `{ "error": "No autorizado" }` con código `401`, impidiendo que un atacante utilice mensajes detallados como oráculo criptográfico.

---

## G. Buenas Prácticas de Seguridad

A continuación se detallan los controles de seguridad implementados en **BMW Premium Motors**:

1. **Clave secreta (`JWT_SECRET`) fuera del código y validada al arranque:**
   - Se carga exclusivamente desde variables de entorno (`backend/.env`, excluido en `.gitignore`).
   - No existen claves de respaldo (*hardcoded fallbacks*) en el código fuente.
   - Al iniciar el backend, se valida que `JWT_SECRET` esté definido y posea longitud mínima criptográfica (>= 32 caracteres; generado con 64 bytes aleatorios = 128 caracteres hexadecimales, equivalentes a 512 bits de entropía). Si falta o es débil, el proceso aborta de forma controlada antes de abrir el puerto HTTP.
2. **Transporte cifrado mediante HTTPS en producción:**
   - En desarrollo local se opera sobre `http://localhost:3001` y `http://localhost:5173`. En producción es **obligatorio** desplegar detrás de TLS/HTTPS (con `Strict-Transport-Security` activo vía `helmet`) para impedir la interceptación en tránsito (*Man-in-the-Middle*) tanto de contraseñas durante el login como del encabezado `Authorization: Bearer`.
3. **Almacenamiento seguro de contraseñas con `bcrypt` (12 salt rounds):**
   - Las contraseñas jamás se guardan en texto plano ni con funciones rápidas vulnerables a fuerza bruta en GPU (MD5/SHA-256 directo).
   - Se emplea `bcrypt` con factor de trabajo **12 rondas** (`2^12` iteraciones con *salt* aleatorio único por usuario integrado en el hash).
   - Se valida un mínimo de **8 caracteres** y un máximo estricto de **72 bytes en UTF-8** (`Buffer.byteLength(password, 'utf8') <= 72`), evitando el truncamiento silencioso inherente al algoritmo Blowfish de `bcrypt`.
   - En el login se mitiga la enumeración temporal ejecutando comparación constante contra un hash señuelo cuando el correo no existe.
4. **Higiene del Payload del JWT:**
   - El payload contiene únicamente `{ sub, iat, exp, aud, iss }`. No viajan correos, contraseñas, `password_hash` ni montos de ventas del concesionario.
5. **Validación estricta de entradas y consultas SQL parametrizadas:**
   - Todas las rutas validan tipos, formatos y longitudes con `express-validator`.
   - Todas las consultas a MySQL emplean *prepared statements* parametrizados (`pool.execute('... WHERE id = ?', [id])`), neutralizando inyección SQL.
6. **Protección integral de endpoints y limitación de tasa (*Rate Limiting*):**
   - `express-rate-limit` protege `/api/auth/register` y `/api/auth/login` frente a ataques automatizados de fuerza bruta y *credential stuffing*.
   - El middleware `authMiddleware` se monta sobre los routers completos (`/api/modelos`, `/api/vehiculos`, `/api/clientes`, `/api/vendedores`, `/api/ventas`, `/api/dashboard`), evitando que un endpoint individual quede expuesto accidentalmente.
   - El cliente Axios verifica que la petición apunte a la URL base autorizada de la API antes de adjuntar el encabezado `Authorization`.
7. **Cero exposición en logs y respuestas:**
   - Ningún controlador ni manejador de errores imprime `req.body.password`, `password_hash` ni encabezados `Authorization` en consola.

---

## H. Fuentes Técnicas Oficiales Consultadas

1. **IETF — RFC 7519: JSON Web Token (JWT)**  
   Enlace: https://www.rfc-editor.org/rfc/rfc7519.html  
   *Información obtenida:* Especificación normativa del formato JWT, codificación Base64URL de sus tres segmentos y definición semántica exacta de los *Registered Claim Names* (`iss`, `sub`, `aud`, `exp`, `nbf`, `iat`, `jti`), utilizada para estructurar el payload mínimo y las validaciones del sistema.

2. **OWASP — JSON Web Token Cheat Sheet**  
   Enlace: https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html  
   *Información obtenida:* Catálogo de vectores de ataque contra implementaciones JWT (*none algorithm*, confusión de algoritmos, secretos débiles HMAC, ausencia de validación de `iss`/`aud`, exposición de datos sensibles en el payload y riesgos de almacenamiento en `Web Storage`), aplicado directamente en `tokenService.js`, `authMiddleware.js` y `AuthContext.jsx`.

3. **OWASP — Session Management Cheat Sheet**  
   Enlace: https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html  
   *Información obtenida:* Directrices sobre ciclo de vida de tokens de sesión, tiempos de expiración acotados (`1h`), invalidación limpia en cierre de sesión y diferencias operativas entre tokens con estado y tokens *stateless*.

4. **OWASP — Password Storage Cheat Sheet**  
   Enlace: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html  
   *Información obtenida:* Criterios para funciones adaptativas de derivación y hashing de contraseñas (`bcrypt` con factor de costo >= 10, seleccionando 12 salt rounds para este proyecto), manejo de *salts* únicos por credencial y restricción crítica del límite máximo de 72 bytes UTF-8 en `bcrypt`.

5. **OWASP — REST Security Cheat Sheet**  
   Enlace: https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html  
   *Información obtenida:* Estándares de seguridad en APIs REST sin estado: transporte en cabecera `Authorization: Bearer`, restricción estricta de orígenes y cabeceras en CORS, códigos de estado HTTP semánticos (`400`, `401`, `404`, `409`, `429`), validación de esquemas JSON y supresión de trazas internas en respuestas de error.

6. **OWASP — Cross-Site Request Forgery (CSRF) Prevention Cheat Sheet**  
   Enlace: https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Request_Forgery_Prevention_Cheat_Sheet.html  
   *Información obtenida:* Análisis del envío automático de credenciales por el navegador en esquemas basados en cookies frente al uso de cabeceras personalizadas (`Authorization: Bearer`), así como las defensas requeridas (`SameSite`, tokens anti-CSRF y validación de `Origin`) en caso de migrar hacia cookies `HttpOnly` en producción.

7. **Auth0 — Documentación Oficial de `node-jsonwebtoken`**  
   Enlace: https://github.com/auth0/node-jsonwebtoken  
   *Información obtenida:* Firma y verificación programática en Node.js mediante `jwt.sign()` y `jwt.verify()`, configuración explícita de `algorithms: ['HS256']`, opciones `subject`, `issuer`, `audience`, `expiresIn` y jerarquía de excepciones (`TokenExpiredError`, `JsonWebTokenError`, `NotBeforeError`).

8. **Express.js — Production Best Practices: Security**  
   Enlace: https://expressjs.com/en/advanced/best-practice-security.html  
   *Información obtenida:* Endurecimiento de aplicaciones Express mediante `helmet` (cabeceras HTTP seguras), uso obligatorio de TLS en despliegues productivos, mitigación de ataques de fuerza bruta con limitadores de tasa (`express-rate-limit`), gestión segura de variables de entorno y manejo centralizado de excepciones asíncronas.

---

## Conclusiones Aplicadas a BMW Premium Motors

1. La combinación de **`bcrypt` (12 rondas + tope de 72 bytes UTF-8)** para persistencia de credenciales en la tabla independiente `usuarios` y **JWT `HS256` con validación estricta de `alg`, `iss`, `aud`, `exp` y `sub`** proporciona una capa de autenticación sólida, auditable y alineada con RFC 7519 y OWASP.
2. Mantener el Access Token **únicamente en memoria dentro de `AuthContext`** (sin escribir en `localStorage` ni `sessionStorage`) e inyectarlo mediante un interceptor controlado de Axios cumple el protocolo `Authorization: Bearer <token>` eliminando la persistencia del token en disco en estaciones compartidas del concesionario.
3. Verificar la existencia activa del usuario en MySQL dentro de `authMiddleware.js` en cada solicitud empresarial combina la ligereza del modelo JWT con la capacidad de revocar inmediatamente cuentas eliminadas y proteger de extremo a extremo los cinco módulos CRUD y el Dashboard de **BMW Premium Motors**.

