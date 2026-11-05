-- ============================================================================
-- BMW Premium Motors - Migración Incremental 001 (Día 2)
-- Crea únicamente la tabla independiente de autenticación: usuarios
-- Motor: InnoDB | Charset: utf8mb4 | Sin afectar tablas ni registros existentes
-- ============================================================================

CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(120) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_usuarios_correo UNIQUE (correo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

