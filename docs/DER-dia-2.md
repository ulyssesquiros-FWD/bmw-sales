# Diagrama Entidad-Relación (DER) — BMW Premium Motors (Día 2)

**Base de datos:** `bmw_premium_motors`  
**Motor:** `MySQL 8+ (InnoDB)`  
**Codificación:** `utf8mb4` / `utf8mb4_unicode_ci`

---

## 1. Visión General del Modelo de Datos

En el **Día 2** se conservan íntegramente las cinco entidades comerciales del concesionario desarrolladas en el Día 1 (`modelos`, `vehiculos`, `clientes`, `vendedores`, `ventas`), junto con sus claves primarias, claves foráneas, restricciones de unicidad y reglas de integridad referencial (`ON DELETE RESTRICT`, `ON UPDATE CASCADE`), y se incorpora mediante migración incremental idempotente (`npm run db:migrate`) la sexta entidad independiente **`usuarios`** para autenticación mediante **JWT (`HS256`)** y contraseñas cifradas con **`bcrypt` (12 rondas)**.

> **Independencia arquitectónica de `usuarios`:** Conforme a los requerimientos del sistema, no existen roles ni permisos diferenciados por usuario, por lo que `usuarios` actúa como entidad transversal de acceso autenticado al sistema sin claves foráneas obligatorias hacia las operaciones comerciales.

---

## 2. Diagrama Entidad-Relación (Mermaid ER)

*(El código fuente puro exportable también se encuentra disponible en `docs/DER-dia-2.mmd`).*

```mermaid
erDiagram
    MODELOS ||--o{ VEHICULOS : "tiene (1:N)"
    VEHICULOS ||--o| VENTAS : "se comercializa en (1:0..1)"
    CLIENTES ||--o{ VENTAS : "realiza (1:N)"
    VENDEDORES ||--o{ VENTAS : "registra (1:N)"

    MODELOS {
        INT id_modelo PK "AUTO_INCREMENT"
        VARCHAR_100 nombre UK "NOT NULL UNIQUE"
        VARCHAR_50 tipo_carroceria "NOT NULL"
        VARCHAR_50 combustible "NOT NULL"
        VARCHAR_50 transmision "NOT NULL"
        TEXT descripcion "NULL"
        TIMESTAMP created_at "DEFAULT CURRENT_TIMESTAMP"
        TIMESTAMP updated_at "ON UPDATE CURRENT_TIMESTAMP"
    }

    VEHICULOS {
        INT id_vehiculo PK "AUTO_INCREMENT"
        INT id_modelo FK "NOT NULL -> modelos.id_modelo"
        CHAR_17 vin UK "NOT NULL UNIQUE (17 chars)"
        VARCHAR_100 version "NOT NULL"
        YEAR anio "NOT NULL"
        VARCHAR_50 color "NOT NULL"
        INT_UNSIGNED kilometraje "NOT NULL DEFAULT 0"
        DECIMAL_12_2 precio "NOT NULL > 0 (USD)"
        ENUM estado "Disponible | Reservado | Vendido"
        VARCHAR_500 imagen_url "NULL"
        TIMESTAMP created_at "DEFAULT CURRENT_TIMESTAMP"
        TIMESTAMP updated_at "ON UPDATE CURRENT_TIMESTAMP"
    }

    CLIENTES {
        INT id_cliente PK "AUTO_INCREMENT"
        VARCHAR_100 nombre "NOT NULL"
        VARCHAR_100 apellidos "NOT NULL"
        VARCHAR_30 identificacion UK "NOT NULL UNIQUE"
        VARCHAR_20 telefono "NOT NULL"
        VARCHAR_120 correo "NOT NULL"
        VARCHAR_255 direccion "NULL"
        TIMESTAMP created_at "DEFAULT CURRENT_TIMESTAMP"
        TIMESTAMP updated_at "ON UPDATE CURRENT_TIMESTAMP"
    }

    VENDEDORES {
        INT id_vendedor PK "AUTO_INCREMENT"
        VARCHAR_100 nombre "NOT NULL"
        VARCHAR_100 apellidos "NOT NULL"
        VARCHAR_20 telefono "NOT NULL"
        VARCHAR_120 correo UK "NOT NULL UNIQUE"
        DATE fecha_contratacion "NOT NULL"
        TIMESTAMP created_at "DEFAULT CURRENT_TIMESTAMP"
        TIMESTAMP updated_at "ON UPDATE CURRENT_TIMESTAMP"
    }

    VENTAS {
        INT id_venta PK "AUTO_INCREMENT"
        INT id_vehiculo FK,UK "NOT NULL UNIQUE -> vehiculos.id_vehiculo"
        INT id_cliente FK "NOT NULL -> clientes.id_cliente"
        INT id_vendedor FK "NOT NULL -> vendedores.id_vendedor"
        DATE fecha_venta "NOT NULL"
        DECIMAL_12_2 precio_venta "NOT NULL > 0 (USD)"
        TEXT observaciones "NULL"
        TIMESTAMP created_at "DEFAULT CURRENT_TIMESTAMP"
        TIMESTAMP updated_at "ON UPDATE CURRENT_TIMESTAMP"
    }

    USUARIOS {
        INT_UNSIGNED id_usuario PK "AUTO_INCREMENT"
        VARCHAR_100 nombre "NOT NULL"
        VARCHAR_120 correo UK "NOT NULL UNIQUE"
        VARCHAR_255 password_hash "NOT NULL (bcrypt 12 rounds)"
        TIMESTAMP fecha_creacion "DEFAULT CURRENT_TIMESTAMP"
    }
```

---

## 3. Diccionario de Entidades y Reglas de Integridad

| Entidad | Clave Primaria | Campos Únicos (`UNIQUE`) | Claves Foráneas (`FOREIGN KEY`) | Reglas de Negocio Clave |
| :--- | :--- | :--- | :--- | :--- |
| **`modelos`** | `id_modelo` (`INT`) | `nombre` | Ninguna | No puede eliminarse (`HTTP 409`) mientras existan registros en `vehiculos` vinculados a ese modelo. |
| **`vehiculos`** | `id_vehiculo` (`INT`) | `vin` (`CHAR(17)`) | `id_modelo` → `modelos(id_modelo)` | `precio > 0` (USD), `kilometraje >= 0`. El estado `Vendido` solo se asigna/libera mediante transacciones en `ventas`. |
| **`clientes`** | `id_cliente` (`INT`) | `identificacion` | Ninguna | No puede eliminarse (`HTTP 409`) si posee compras registradas en `ventas`. |
| **`vendedores`** | `id_vendedor` (`INT`) | `correo` | Ninguna | No puede eliminarse (`HTTP 409`) si posee operaciones registradas en `ventas`. |
| **`ventas`** | `id_venta` (`INT`) | `id_vehiculo` | `id_vehiculo` → `vehiculos`, `id_cliente` → `clientes`, `id_vendedor` → `vendedores` | Ejecutada bajo transacciones SQL ACID (`FOR UPDATE`). Al crear marca el vehículo `Vendido`; al eliminar lo restaura a `Disponible`. |
| **`usuarios`** *(Día 2)* | `id_usuario` (`INT UNSIGNED`) | `correo` | Ninguna (entidad de autenticación independiente) | Contraseña almacenada exclusivamente como `password_hash` (`bcrypt`, 12 rondas). Nunca expone `password_hash` en la API. |

*(Adicionalmente, el ejecutor `backend/src/database/migrate.js` gestiona automáticamente la tabla técnica auxiliar `schema_migrations` para garantizar la idempotencia de las migraciones incrementales).*

