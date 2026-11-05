-- ============================================================================
-- BMW Premium Motors — Migración 002: Ampliación a 17 Módulos Empresariales
-- Fecha: 2026-11-05
-- Idempotente: CREATE TABLE IF NOT EXISTS
-- ============================================================================

-- 1. Sucursales / Agencias oficiales BMW
CREATE TABLE IF NOT EXISTS sucursales (
  id_sucursal INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL UNIQUE,
  ciudad VARCHAR(80) NOT NULL,
  direccion VARCHAR(255) NOT NULL,
  telefono VARCHAR(30) NOT NULL,
  capacidad_vehiculos INT UNSIGNED NOT NULL DEFAULT 50,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Accesorios y Piezas BMW M Performance
CREATE TABLE IF NOT EXISTS accesorios (
  id_accesorio INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  categoria VARCHAR(60) NOT NULL,
  codigo_parte VARCHAR(50) NOT NULL UNIQUE,
  precio DECIMAL(10,2) NOT NULL,
  stock INT UNSIGNED NOT NULL DEFAULT 0,
  descripcion TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_accesorios_precio CHECK (precio >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Proveedores y Logística BMW
CREATE TABLE IF NOT EXISTS proveedores (
  id_proveedor INT AUTO_INCREMENT PRIMARY KEY,
  razon_social VARCHAR(150) NOT NULL UNIQUE,
  rfc_identificacion VARCHAR(30) NOT NULL UNIQUE,
  contacto_nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(120) NOT NULL,
  telefono VARCHAR(30) NOT NULL,
  pais_origen VARCHAR(60) NOT NULL DEFAULT 'Alemania',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Garantías BMW Premium Selection y Service Inclusive
CREATE TABLE IF NOT EXISTS garantias (
  id_garantia INT AUTO_INCREMENT PRIMARY KEY,
  id_vehiculo INT NOT NULL,
  tipo_garantia VARCHAR(80) NOT NULL,
  cobertura_meses INT UNSIGNED NOT NULL,
  kilometraje_limite INT UNSIGNED NOT NULL,
  estado ENUM('Activa', 'Vencida', 'Cancelada') NOT NULL DEFAULT 'Activa',
  fecha_inicio DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_garantias_vehiculo FOREIGN KEY (id_vehiculo) REFERENCES vehiculos (id_vehiculo) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Citas y Servicios de Taller / Mantenimiento BMW Service
CREATE TABLE IF NOT EXISTS mantenimientos (
  id_mantenimiento INT AUTO_INCREMENT PRIMARY KEY,
  id_vehiculo INT NOT NULL,
  id_cliente INT NOT NULL,
  tipo_servicio VARCHAR(100) NOT NULL,
  costo DECIMAL(10,2) NOT NULL,
  fecha_servicio DATE NOT NULL,
  estado ENUM('Programado', 'En Proceso', 'Finalizado', 'Cancelado') NOT NULL DEFAULT 'Programado',
  notas TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_mantenimientos_vehiculo FOREIGN KEY (id_vehiculo) REFERENCES vehiculos (id_vehiculo) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_mantenimientos_cliente FOREIGN KEY (id_cliente) REFERENCES clientes (id_cliente) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT chk_mantenimientos_costo CHECK (costo >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Financiamientos BMW Financial Services (Leasing / Crédito)
CREATE TABLE IF NOT EXISTS financiamientos (
  id_financiamiento INT AUTO_INCREMENT PRIMARY KEY,
  id_venta INT NOT NULL UNIQUE,
  entidad_financiera VARCHAR(100) NOT NULL DEFAULT 'BMW Financial Services',
  plazo_meses INT UNSIGNED NOT NULL,
  tasa_interes_anual DECIMAL(5,2) NOT NULL,
  cuota_mensual DECIMAL(10,2) NOT NULL,
  monto_financiado DECIMAL(12,2) NOT NULL,
  estado ENUM('Aprobado', 'En Revision', 'Liquidado', 'Rechazado') NOT NULL DEFAULT 'Aprobado',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_financiamientos_venta FOREIGN KEY (id_venta) REFERENCES ventas (id_venta) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT chk_financiamientos_plazo CHECK (plazo_meses > 0),
  CONSTRAINT chk_financiamientos_monto CHECK (monto_financiado > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Pruebas de Manejo (Test Drives BMW Experience)
CREATE TABLE IF NOT EXISTS pruebas_manejo (
  id_prueba INT AUTO_INCREMENT PRIMARY KEY,
  id_vehiculo INT NOT NULL,
  id_cliente INT NOT NULL,
  id_vendedor INT NOT NULL,
  fecha_prueba DATETIME NOT NULL,
  duracion_minutos INT UNSIGNED NOT NULL DEFAULT 45,
  estado ENUM('Agendada', 'Realizada', 'Cancelada', 'No Asistio') NOT NULL DEFAULT 'Agendada',
  comentarios TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_pruebas_vehiculo FOREIGN KEY (id_vehiculo) REFERENCES vehiculos (id_vehiculo) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_pruebas_cliente FOREIGN KEY (id_cliente) REFERENCES clientes (id_cliente) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_pruebas_vendedor FOREIGN KEY (id_vendedor) REFERENCES vendedores (id_vendedor) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Pólizas de Seguro BMW Protection
CREATE TABLE IF NOT EXISTS seguros (
  id_seguro INT AUTO_INCREMENT PRIMARY KEY,
  id_vehiculo INT NOT NULL,
  aseguradora VARCHAR(100) NOT NULL,
  numero_poliza VARCHAR(60) NOT NULL UNIQUE,
  cobertura VARCHAR(100) NOT NULL,
  prima_anual DECIMAL(10,2) NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  estado ENUM('Vigente', 'Vencida', 'Cancelada') NOT NULL DEFAULT 'Vigente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_seguros_vehiculo FOREIGN KEY (id_vehiculo) REFERENCES vehiculos (id_vehiculo) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT chk_seguros_prima CHECK (prima_anual > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Bitácora de Auditoría Operativa y Accesos
CREATE TABLE IF NOT EXISTS auditoria_logs (
  id_log BIGINT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT UNSIGNED NULL,
  accion VARCHAR(80) NOT NULL,
  entidad_afectada VARCHAR(60) NOT NULL,
  id_registro VARCHAR(60) NULL,
  ip_origen VARCHAR(45) NOT NULL DEFAULT '127.0.0.1',
  detalle TEXT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_auditoria_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

