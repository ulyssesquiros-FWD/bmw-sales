-- ============================================================================
-- BMW Premium Motors - Esquema de Tablas (Idempotente)
-- Motor: MySQL (InnoDB) | Charset: utf8mb4
-- Nota: La base de datos bmw_premium_motors debe estar creada previamente.
-- ============================================================================

CREATE TABLE IF NOT EXISTS modelos (
  id_modelo INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  tipo_carroceria VARCHAR(50) NOT NULL,
  combustible VARCHAR(50) NOT NULL,
  transmision VARCHAR(50) NOT NULL,
  descripcion TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_modelos_nombre UNIQUE (nombre),
  INDEX idx_modelos_carroceria (tipo_carroceria),
  INDEX idx_modelos_combustible (combustible)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS vehiculos (
  id_vehiculo INT AUTO_INCREMENT PRIMARY KEY,
  id_modelo INT NOT NULL,
  vin CHAR(17) NOT NULL,
  version VARCHAR(100) NOT NULL,
  anio YEAR NOT NULL,
  color VARCHAR(50) NOT NULL,
  kilometraje INT UNSIGNED NOT NULL DEFAULT 0,
  precio DECIMAL(12,2) NOT NULL,
  estado ENUM('Disponible', 'Reservado', 'Vendido') NOT NULL DEFAULT 'Disponible',
  imagen_url VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_vehiculos_vin UNIQUE (vin),
  CONSTRAINT chk_vehiculos_vin_len CHECK (CHAR_LENGTH(vin) = 17),
  CONSTRAINT chk_vehiculos_precio_positivo CHECK (precio > 0),
  CONSTRAINT fk_vehiculos_modelo
    FOREIGN KEY (id_modelo) REFERENCES modelos (id_modelo)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  INDEX idx_vehiculos_modelo (id_modelo),
  INDEX idx_vehiculos_estado (estado),
  INDEX idx_vehiculos_anio (anio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS clientes (
  id_cliente INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  identificacion VARCHAR(30) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  correo VARCHAR(120) NOT NULL,
  direccion VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_clientes_identificacion UNIQUE (identificacion),
  INDEX idx_clientes_nombre_apellidos (nombre, apellidos),
  INDEX idx_clientes_correo (correo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS vendedores (
  id_vendedor INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  correo VARCHAR(120) NOT NULL,
  fecha_contratacion DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_vendedores_correo UNIQUE (correo),
  INDEX idx_vendedores_nombre_apellidos (nombre, apellidos)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ventas (
  id_venta INT AUTO_INCREMENT PRIMARY KEY,
  id_vehiculo INT NOT NULL,
  id_cliente INT NOT NULL,
  id_vendedor INT NOT NULL,
  fecha_venta DATE NOT NULL,
  precio_venta DECIMAL(12,2) NOT NULL,
  observaciones TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_ventas_vehiculo UNIQUE (id_vehiculo),
  CONSTRAINT chk_ventas_precio_positivo CHECK (precio_venta > 0),
  CONSTRAINT fk_ventas_vehiculo
    FOREIGN KEY (id_vehiculo) REFERENCES vehiculos (id_vehiculo)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT fk_ventas_cliente
    FOREIGN KEY (id_cliente) REFERENCES clientes (id_cliente)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT fk_ventas_vendedor
    FOREIGN KEY (id_vendedor) REFERENCES vendedores (id_vendedor)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  INDEX idx_ventas_cliente (id_cliente),
  INDEX idx_ventas_vendedor (id_vendedor),
  INDEX idx_ventas_fecha (fecha_venta)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



-- ============================================================================
-- TABLAS ADICIONALES DEL ECOSISTEMA CONCESIONARIO BMW
-- ============================================================================

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
  CONSTRAINT fk_financiamientos_venta FOREIGN KEY (id_venta) REFERENCES ventas (id_venta) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  CONSTRAINT fk_seguros_vehiculo FOREIGN KEY (id_vehiculo) REFERENCES vehiculos (id_vehiculo) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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


-- ============================================================================
-- AMPLIACIÓN EMPRESARIAL ADICIONAL (8 NUEVAS ENTIDADES CORPORATIVAS)
-- ============================================================================

CREATE TABLE IF NOT EXISTS cotizaciones (
  id_cotizacion INT AUTO_INCREMENT PRIMARY KEY,
  folio VARCHAR(30) NOT NULL UNIQUE,
  id_cliente INT NOT NULL,
  id_vehiculo INT NOT NULL,
  id_vendedor INT NOT NULL,
  precio_lista DECIMAL(12,2) NOT NULL,
  descuento DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  precio_final DECIMAL(12,2) NOT NULL,
  propuesta_enganche DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  plazo_meses_sugerido INT NOT NULL DEFAULT 36,
  fecha_emision DATE NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  estado ENUM('Borrador', 'Enviada', 'Aceptada', 'Rechazada', 'Vencida') NOT NULL DEFAULT 'Enviada',
  notas TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_cotizaciones_precio_pos CHECK (precio_final > 0),
  CONSTRAINT fk_cotizaciones_cliente FOREIGN KEY (id_cliente) REFERENCES clientes (id_cliente) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_cotizaciones_vehiculo FOREIGN KEY (id_vehiculo) REFERENCES vehiculos (id_vehiculo) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_cotizaciones_vendedor FOREIGN KEY (id_vendedor) REFERENCES vendedores (id_vendedor) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_cotizaciones_cliente (id_cliente),
  INDEX idx_cotizaciones_vehiculo (id_vehiculo),
  INDEX idx_cotizaciones_vendedor (id_vendedor),
  INDEX idx_cotizaciones_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS facturas (
  id_factura INT AUTO_INCREMENT PRIMARY KEY,
  numero_factura VARCHAR(40) NOT NULL UNIQUE,
  folio_fiscal_uuid CHAR(36) NOT NULL UNIQUE,
  id_venta INT NULL,
  id_cliente INT NOT NULL,
  tipo_comprobante ENUM('Ingreso Venta Vehículo', 'Servicio de Taller', 'Venta Accesorios M') NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  iva DECIMAL(12,2) NOT NULL,
  total DECIMAL(12,2) NOT NULL,
  metodo_pago ENUM('Transferencia SPEI', 'Financiamiento BMW', 'Tarjeta Corporativa', 'Cheque de Caja') NOT NULL,
  fecha_emision DATETIME NOT NULL,
  estado ENUM('Timbrada', 'Pagada', 'Cancelada') NOT NULL DEFAULT 'Timbrada',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_facturas_total_pos CHECK (total > 0),
  CONSTRAINT fk_facturas_venta FOREIGN KEY (id_venta) REFERENCES ventas (id_venta) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_facturas_cliente FOREIGN KEY (id_cliente) REFERENCES clientes (id_cliente) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_facturas_venta (id_venta),
  INDEX idx_facturas_cliente (id_cliente),
  INDEX idx_facturas_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pedidos_fabrica (
  id_pedido_fabrica INT AUTO_INCREMENT PRIMARY KEY,
  codigo_orden_fabrica VARCHAR(40) NOT NULL UNIQUE,
  id_modelo INT NOT NULL,
  id_sucursal_destino INT NOT NULL,
  id_cliente INT NULL,
  planta_ensamblaje VARCHAR(100) NOT NULL,
  vin_asignado CHAR(17) NULL,
  especificaciones_individual TEXT NULL,
  fecha_orden DATE NOT NULL,
  fecha_estimada_entrega DATE NOT NULL,
  estado_produccion ENUM('En Cola de Producción', 'En Ensamble de Chasis', 'Pintura y Acabado', 'Control de Calidad', 'En Tránsito Marítimo', 'En Aduana Portuaria', 'Recibido en Concesionario') NOT NULL DEFAULT 'En Cola de Producción',
  costo_importacion_usd DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_pedidos_modelo FOREIGN KEY (id_modelo) REFERENCES modelos (id_modelo) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_pedidos_sucursal FOREIGN KEY (id_sucursal_destino) REFERENCES sucursales (id_sucursal) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_pedidos_cliente FOREIGN KEY (id_cliente) REFERENCES clientes (id_cliente) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_pedidos_modelo (id_modelo),
  INDEX idx_pedidos_sucursal (id_sucursal_destino),
  INDEX idx_pedidos_estado (estado_produccion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inspecciones_cpo (
  id_inspeccion INT AUTO_INCREMENT PRIMARY KEY,
  folio_inspeccion VARCHAR(40) NOT NULL UNIQUE,
  id_vehiculo INT NOT NULL,
  tecnico_certificador VARCHAR(120) NOT NULL,
  puntos_revisados_total INT NOT NULL DEFAULT 110,
  puntos_aprobados INT NOT NULL,
  estado_motor_transmision ENUM('Excelente', 'Bueno', 'Requiere Ajuste') NOT NULL DEFAULT 'Excelente',
  estado_suspension_frenos ENUM('Excelente', 'Bueno', 'Requiere Ajuste') NOT NULL DEFAULT 'Excelente',
  estado_carroceria_pintura ENUM('Impecable', 'Detalle Menor Subsanado') NOT NULL DEFAULT 'Impecable',
  aprobado_certificacion_cpo BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_inspeccion DATE NOT NULL,
  dictamen TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_inspecciones_vehiculo FOREIGN KEY (id_vehiculo) REFERENCES vehiculos (id_vehiculo) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_inspecciones_vehiculo (id_vehiculo),
  INDEX idx_inspecciones_cpo_aprobado (aprobado_certificacion_cpo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS campanas_marketing (
  id_campana INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  tipo_evento ENUM('Lanzamiento Gama M', 'Electrificación BMW i', 'Temporada de Financiación Especial', 'Track Day Exclusivo en Autódromo', 'Showroom VIP Private Preview') NOT NULL,
  id_sucursal INT NULL,
  presupuesto_usd DECIMAL(12,2) NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  leads_generados INT UNSIGNED NOT NULL DEFAULT 0,
  ventas_atribuidas INT UNSIGNED NOT NULL DEFAULT 0,
  estado ENUM('Planificada', 'En Ejecución', 'Finalizada', 'Cancelada') NOT NULL DEFAULT 'Planificada',
  objetivo TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_campanas_sucursal FOREIGN KEY (id_sucursal) REFERENCES sucursales (id_sucursal) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_campanas_sucursal (id_sucursal),
  INDEX idx_campanas_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS encuestas_satisfaccion (
  id_encuesta INT AUTO_INCREMENT PRIMARY KEY,
  id_cliente INT NOT NULL,
  id_venta INT NULL,
  id_mantenimiento INT NULL,
  tipo_experiencia ENUM('Entrega de Vehículo Nuevo', 'Servicio en Taller', 'Prueba de Manejo VIP') NOT NULL,
  puntuacion_general INT NOT NULL,
  puntuacion_asesor INT NOT NULL,
  recomienda_concesionario BOOLEAN NOT NULL DEFAULT TRUE,
  comentarios_cliente TEXT NULL,
  fecha_encuesta DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_encuestas_pts_gen CHECK (puntuacion_general BETWEEN 1 AND 10),
  CONSTRAINT chk_encuestas_pts_ase CHECK (puntuacion_asesor BETWEEN 1 AND 10),
  CONSTRAINT fk_encuestas_cliente FOREIGN KEY (id_cliente) REFERENCES clientes (id_cliente) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_encuestas_venta FOREIGN KEY (id_venta) REFERENCES ventas (id_venta) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_encuestas_mantenimiento FOREIGN KEY (id_mantenimiento) REFERENCES mantenimientos (id_mantenimiento) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_encuestas_cliente (id_cliente),
  INDEX idx_encuestas_venta (id_venta),
  INDEX idx_encuestas_mantenimiento (id_mantenimiento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS almacen_refacciones (
  id_refaccion INT AUTO_INCREMENT PRIMARY KEY,
  numero_parte_oem VARCHAR(50) NOT NULL UNIQUE,
  nombre_pieza VARCHAR(150) NOT NULL,
  id_proveedor INT NOT NULL,
  id_sucursal INT NOT NULL,
  ubicacion_bahia_estante VARCHAR(50) NOT NULL,
  cantidad_stock INT NOT NULL DEFAULT 0,
  stock_minimo_alerta INT NOT NULL DEFAULT 5,
  costo_unitario_usd DECIMAL(10,2) NOT NULL,
  categoria_tecnica ENUM('Fluidos y Lubricantes TwinPower', 'Filtros y Bujías', 'Sistema de Frenos M', 'Tren Motriz y Suspensión', 'Componentes Eléctricos e iDrive') NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_refacciones_proveedor FOREIGN KEY (id_proveedor) REFERENCES proveedores (id_proveedor) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_refacciones_sucursal FOREIGN KEY (id_sucursal) REFERENCES sucursales (id_sucursal) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_refacciones_proveedor (id_proveedor),
  INDEX idx_refacciones_sucursal (id_sucursal),
  INDEX idx_refacciones_categoria (categoria_tecnica)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reclamaciones_garantia (
  id_reclamacion INT AUTO_INCREMENT PRIMARY KEY,
  codigo_reclamacion VARCHAR(40) NOT NULL UNIQUE,
  id_garantia INT NOT NULL,
  id_vehiculo INT NOT NULL,
  id_mantenimiento INT NULL,
  codigo_falla_ista VARCHAR(30) NOT NULL,
  descripcion_falla TEXT NOT NULL,
  monto_reclamado_usd DECIMAL(12,2) NOT NULL,
  monto_autorizado_usd DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  estado ENUM('Enviada a Planta', 'En Evaluación Técnica', 'Aprobada por BMW AG', 'Rechazada', 'Liquidada') NOT NULL DEFAULT 'Enviada a Planta',
  fecha_reclamacion DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_reclamaciones_garantia FOREIGN KEY (id_garantia) REFERENCES garantias (id_garantia) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_reclamaciones_vehiculo FOREIGN KEY (id_vehiculo) REFERENCES vehiculos (id_vehiculo) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_reclamaciones_mantenimiento FOREIGN KEY (id_mantenimiento) REFERENCES mantenimientos (id_mantenimiento) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_reclamaciones_garantia (id_garantia),
  INDEX idx_reclamaciones_vehiculo (id_vehiculo),
  INDEX idx_reclamaciones_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
