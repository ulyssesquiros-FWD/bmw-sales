-- ============================================================================
-- BMW Premium Motors + PolicyBot SaaS - Migración Incremental 004
-- Crea las tablas SaaS multiempresa, RAG y control de cuotas conservando
-- intactas las 24 entidades existentes del concesionario.
-- Motor: InnoDB | Charset: utf8mb4
-- ============================================================================

CREATE TABLE IF NOT EXISTS planes (
  id_plan INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL,
  max_documentos INT UNSIGNED NOT NULL,
  max_preguntas_mes INT UNSIGNED NOT NULL,
  precio_mensual DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_planes_nombre UNIQUE (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO planes (id_plan, nombre, max_documentos, max_preguntas_mes, precio_mensual)
VALUES
  (1, 'Gratis', 10, 200, 0.00),
  (2, 'Pro', 500, 10000, 49.00);

CREATE TABLE IF NOT EXISTS empresas (
  id_empresa INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  slug VARCHAR(120) NOT NULL,
  id_plan INT UNSIGNED NOT NULL DEFAULT 1,
  google_drive_folder_id VARCHAR(255) NULL,
  google_drive_sync_status VARCHAR(40) NOT NULL DEFAULT 'sin_configurar',
  ultima_sincronizacion DATETIME NULL,
  preguntas_mes_actual INT UNSIGNED NOT NULL DEFAULT 0,
  mes_control VARCHAR(7) NOT NULL DEFAULT '2026-11',
  activo TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_empresas_slug UNIQUE (slug),
  CONSTRAINT fk_empresas_plan FOREIGN KEY (id_plan) REFERENCES planes (id_plan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO empresas (
  id_empresa,
  nombre,
  slug,
  id_plan,
  google_drive_folder_id,
  google_drive_sync_status,
  preguntas_mes_actual,
  mes_control,
  activo
)
VALUES (
  1,
  'BMW Premium Motors Corporativo',
  'bmw-premium-motors',
  2,
  NULL,
  'sin_configurar',
  0,
  '2026-11',
  1
);

CREATE TABLE IF NOT EXISTS documentos (
  id_documento INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_empresa INT UNSIGNED NOT NULL,
  subido_por INT UNSIGNED NULL,
  nombre_archivo VARCHAR(255) NOT NULL,
  tipo_archivo ENUM('pdf', 'docx', 'txt') NOT NULL DEFAULT 'txt',
  origen ENUM('manual', 'google_drive') NOT NULL DEFAULT 'manual',
  drive_file_id VARCHAR(255) NULL,
  drive_modified_time VARCHAR(64) NULL,
  contenido_hash VARCHAR(64) NOT NULL,
  tamano_bytes BIGINT UNSIGNED NOT NULL DEFAULT 0,
  contenido_texto LONGTEXT NULL,
  total_fragmentos INT UNSIGNED NOT NULL DEFAULT 0,
  estado_indexacion ENUM('pendiente', 'indexado', 'error') NOT NULL DEFAULT 'pendiente',
  error_detalle TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_documentos_empresa (id_empresa),
  INDEX idx_documentos_drive (id_empresa, drive_file_id),
  CONSTRAINT fk_documentos_empresa FOREIGN KEY (id_empresa) REFERENCES empresas (id_empresa) ON DELETE CASCADE,
  CONSTRAINT fk_documentos_usuario FOREIGN KEY (subido_por) REFERENCES usuarios (id_usuario) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fragmentos (
  id_fragmento BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_documento INT UNSIGNED NOT NULL,
  id_empresa INT UNSIGNED NOT NULL,
  indice_fragmento INT UNSIGNED NOT NULL,
  contenido MEDIUMTEXT NOT NULL,
  char_inicio INT UNSIGNED NOT NULL DEFAULT 0,
  char_fin INT UNSIGNED NOT NULL DEFAULT 0,
  embedding JSON NOT NULL,
  embedding_dim SMALLINT UNSIGNED NOT NULL DEFAULT 1024,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_fragmentos_empresa (id_empresa),
  INDEX idx_fragmentos_documento (id_documento),
  CONSTRAINT fk_fragmentos_documento FOREIGN KEY (id_documento) REFERENCES documentos (id_documento) ON DELETE CASCADE,
  CONSTRAINT fk_fragmentos_empresa FOREIGN KEY (id_empresa) REFERENCES empresas (id_empresa) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS mensajes (
  id_mensaje BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_empresa INT UNSIGNED NOT NULL,
  id_usuario INT UNSIGNED NOT NULL,
  session_id VARCHAR(64) NOT NULL DEFAULT 'default',
  rol_mensaje ENUM('user', 'assistant') NOT NULL,
  contenido LONGTEXT NOT NULL,
  citas_json JSON NULL,
  tokens_entrada INT UNSIGNED NOT NULL DEFAULT 0,
  tokens_salida INT UNSIGNED NOT NULL DEFAULT 0,
  modelo_usado VARCHAR(80) NULL,
  abortado TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_mensajes_empresa_fecha (id_empresa, created_at),
  CONSTRAINT fk_mensajes_empresa FOREIGN KEY (id_empresa) REFERENCES empresas (id_empresa) ON DELETE CASCADE,
  CONSTRAINT fk_mensajes_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
