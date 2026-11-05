-- ============================================================================
-- BMW Premium Motors - Migración 003: Nuevas Entidades Corporativas
-- ============================================================================
-- Incorpora 8 entidades empresariales adicionales del ecosistema oficial BMW:
-- 1. cotizaciones (Cotizaciones Formales de Compra)
-- 2. facturas (Facturación Electrónica y Comprobantes Fiscales CFDI)
-- 3. pedidos_fabrica (Pedidos a Plantas de Ensamblaje BMW Group)
-- 4. inspecciones_cpo (Inspecciones de Certificación 110 Puntos BMW Premium Selection)
-- 5. campanas_marketing (Campañas y Eventos Exclusivos de Lanzamiento)
-- 6. encuestas_satisfaccion (Índice de Satisfacción del Cliente CSI / NPS)
-- 7. almacen_refacciones (Almacén Central de Refacciones y Consumibles Técnicos)
-- 8. reclamaciones_garantia (Reclamaciones de Garantía y RMA con BMW AG)
-- ============================================================================



-- 1. Cotizaciones Formales de Compra
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
  CONSTRAINT fk_cotizaciones_cliente
    FOREIGN KEY (id_cliente) REFERENCES clientes (id_cliente)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT fk_cotizaciones_vehiculo
    FOREIGN KEY (id_vehiculo) REFERENCES vehiculos (id_vehiculo)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT fk_cotizaciones_vendedor
    FOREIGN KEY (id_vendedor) REFERENCES vendedores (id_vendedor)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  INDEX idx_cotizaciones_cliente (id_cliente),
  INDEX idx_cotizaciones_vehiculo (id_vehiculo),
  INDEX idx_cotizaciones_vendedor (id_vendedor),
  INDEX idx_cotizaciones_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Facturación Electrónica y Comprobantes Fiscales CFDI
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
  CONSTRAINT fk_facturas_venta
    FOREIGN KEY (id_venta) REFERENCES ventas (id_venta)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT fk_facturas_cliente
    FOREIGN KEY (id_cliente) REFERENCES clientes (id_cliente)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  INDEX idx_facturas_venta (id_venta),
  INDEX idx_facturas_cliente (id_cliente),
  INDEX idx_facturas_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Pedidos a Plantas de Ensamblaje BMW Group
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
  CONSTRAINT fk_pedidos_modelo
    FOREIGN KEY (id_modelo) REFERENCES modelos (id_modelo)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT fk_pedidos_sucursal
    FOREIGN KEY (id_sucursal_destino) REFERENCES sucursales (id_sucursal)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT fk_pedidos_cliente
    FOREIGN KEY (id_cliente) REFERENCES clientes (id_cliente)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  INDEX idx_pedidos_modelo (id_modelo),
  INDEX idx_pedidos_sucursal (id_sucursal_destino),
  INDEX idx_pedidos_estado (estado_produccion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Inspecciones de Certificación 110 Puntos BMW Premium Selection
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
  CONSTRAINT fk_inspecciones_vehiculo
    FOREIGN KEY (id_vehiculo) REFERENCES vehiculos (id_vehiculo)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  INDEX idx_inspecciones_vehiculo (id_vehiculo),
  INDEX idx_inspecciones_cpo_aprobado (aprobado_certificacion_cpo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Campañas y Eventos Exclusivos de Lanzamiento
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
  CONSTRAINT fk_campanas_sucursal
    FOREIGN KEY (id_sucursal) REFERENCES sucursales (id_sucursal)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  INDEX idx_campanas_sucursal (id_sucursal),
  INDEX idx_campanas_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Índice de Satisfacción del Cliente CSI / NPS
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
  CONSTRAINT fk_encuestas_cliente
    FOREIGN KEY (id_cliente) REFERENCES clientes (id_cliente)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT fk_encuestas_venta
    FOREIGN KEY (id_venta) REFERENCES ventas (id_venta)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT fk_encuestas_mantenimiento
    FOREIGN KEY (id_mantenimiento) REFERENCES mantenimientos (id_mantenimiento)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  INDEX idx_encuestas_cliente (id_cliente),
  INDEX idx_encuestas_venta (id_venta),
  INDEX idx_encuestas_mantenimiento (id_mantenimiento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Almacén Central de Refacciones y Consumibles Técnicos
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
  CONSTRAINT fk_refacciones_proveedor
    FOREIGN KEY (id_proveedor) REFERENCES proveedores (id_proveedor)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT fk_refacciones_sucursal
    FOREIGN KEY (id_sucursal) REFERENCES sucursales (id_sucursal)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  INDEX idx_refacciones_proveedor (id_proveedor),
  INDEX idx_refacciones_sucursal (id_sucursal),
  INDEX idx_refacciones_categoria (categoria_tecnica)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Reclamaciones de Garantía y RMA con BMW AG
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
  CONSTRAINT fk_reclamaciones_garantia
    FOREIGN KEY (id_garantia) REFERENCES garantias (id_garantia)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT fk_reclamaciones_vehiculo
    FOREIGN KEY (id_vehiculo) REFERENCES vehiculos (id_vehiculo)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT fk_reclamaciones_mantenimiento
    FOREIGN KEY (id_mantenimiento) REFERENCES mantenimientos (id_mantenimiento)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  INDEX idx_reclamaciones_garantia (id_garantia),
  INDEX idx_reclamaciones_vehiculo (id_vehiculo),
  INDEX idx_reclamaciones_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
