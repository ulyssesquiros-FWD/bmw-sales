-- ============================================================================
-- PolicyBot - Migración Incremental 005
-- 1. Crea tabla google_drive_connections (OAuth 2.0 por empresa, tokens cifrados)
-- 2. Depura documentos simulados de antigua carpeta espejo local
-- Conserva intactas las 24 entidades de BMW y los documentos/fragmentos reales.
-- ============================================================================

CREATE TABLE IF NOT EXISTS google_drive_connections (
  id_conexion INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_empresa INT UNSIGNED NOT NULL,
  conectado_por INT UNSIGNED NULL,
  google_email VARCHAR(150) NULL,
  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT NULL,
  token_expiry_date BIGINT NULL,
  scopes VARCHAR(500) NOT NULL DEFAULT 'https://www.googleapis.com/auth/drive.readonly',
  folder_id VARCHAR(255) NULL,
  folder_name VARCHAR(255) NULL,
  estado ENUM('conectado', 'expirado', 'error', 'desconectado') NOT NULL DEFAULT 'conectado',
  ultima_sincronizacion DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_gdrive_conn_empresa UNIQUE (id_empresa),
  CONSTRAINT fk_gdrive_conn_empresa FOREIGN KEY (id_empresa) REFERENCES empresas (id_empresa) ON DELETE CASCADE,
  CONSTRAINT fk_gdrive_conn_usuario FOREIGN KEY (conectado_por) REFERENCES usuarios (id_usuario) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE documentos
  MODIFY COLUMN tipo_archivo ENUM('pdf', 'docx', 'txt', 'imagen') NOT NULL DEFAULT 'txt';

DELETE FROM documentos
WHERE origen = 'google_drive'
  AND drive_file_id LIKE 'mirror_%';

UPDATE empresas
SET google_drive_folder_id = NULL,
    google_drive_sync_status = 'sin_configurar',
    ultima_sincronizacion = NULL
WHERE google_drive_folder_id LIKE 'drive_%';
