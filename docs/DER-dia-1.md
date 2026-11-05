# Diagrama Entidad-Relación (DER) Inicial — BMW Premium Motors (Día 1)

**Base de datos:** `bmw_premium_motors`  
**Motor:** `MySQL 8+ (InnoDB)`  
**Codificación:** `utf8mb4` / `utf8mb4_unicode_ci`  
**Alcance de esta vista:** Exclusivamente las 5 entidades comerciales originales del **Día 1** (`modelos`, `vehiculos`, `clientes`, `vendedores`, `ventas`), previas a la incorporación de la tabla `usuarios` en el Día 2.

---

## 1. Diagrama Entidad-Relación (Mermaid ER)

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
        INT id_vehiculo FK "NOT NULL UNIQUE -> vehiculos.id_vehiculo"
        INT id_cliente FK "NOT NULL -> clientes.id_cliente"
        INT id_vendedor FK "NOT NULL -> vendedores.id_vendedor"
        DATE fecha_venta "NOT NULL"
        DECIMAL_12_2 precio_venta "NOT NULL > 0 (USD)"
        TEXT observaciones "NULL"
        TIMESTAMP created_at "DEFAULT CURRENT_TIMESTAMP"
        TIMESTAMP updated_at "ON UPDATE CURRENT_TIMESTAMP"
    }
```

---

## 2. Cardinalidades del Día 1
- **`modelos` 1:N `vehiculos`:** Un modelo agrupa múltiples unidades físicas en inventario; cada vehículo corresponde a un modelo BMW específico.
- **`clientes` 1:N `ventas`:** Un cliente puede adquirir uno o más vehículos en el concesionario.
- **`vendedores` 1:N `ventas`:** Un asesor comercial puede registrar múltiples operaciones de venta.
- **`vehiculos` 1:0..1 `ventas`:** Una unidad física de inventario puede o no estar vendida, pero gracias a la restricción `UNIQUE (id_vehiculo)` en la tabla `ventas`, jamás puede asignarse a más de una venta en toda la vida del sistema.
