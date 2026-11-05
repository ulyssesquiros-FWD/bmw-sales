const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function seedNuevasEntidades() {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD ?? '';
  const database = process.env.DB_NAME || 'bmw_premium_motors';

  const connection = await mysql.createConnection({ host, port, user, password, database });

  try {
    console.log('[SEED-NUEVAS-ENTIDADES] Conectando a MySQL para poblar las 8 nuevas entidades...');

    // Obtener referencias existentes
    const [clientes] = await connection.query('SELECT id_cliente, nombre FROM clientes ORDER BY id_cliente');
    const [vehiculos] = await connection.query('SELECT id_vehiculo, vin, precio, version FROM vehiculos ORDER BY id_vehiculo');
    const [vendedores] = await connection.query('SELECT id_vendedor FROM vendedores ORDER BY id_vendedor');
    const [ventas] = await connection.query('SELECT id_venta, id_vehiculo, id_cliente, precio_venta FROM ventas ORDER BY id_venta');
    const [modelos] = await connection.query('SELECT id_modelo, nombre FROM modelos ORDER BY id_modelo');
    const [sucursales] = await connection.query('SELECT id_sucursal, nombre FROM sucursales ORDER BY id_sucursal');
    const [proveedores] = await connection.query('SELECT id_proveedor, razon_social FROM proveedores ORDER BY id_proveedor');
    const [garantias] = await connection.query('SELECT id_garantia, id_vehiculo FROM garantias ORDER BY id_garantia');
    const [mantenimientos] = await connection.query('SELECT id_mantenimiento, id_vehiculo, id_cliente FROM mantenimientos ORDER BY id_mantenimiento');

    // 1. COTIZACIONES
    const [cotCount] = await connection.query('SELECT COUNT(*) AS total FROM cotizaciones');
    if (cotCount[0].total === 0 && clientes.length > 0 && vehiculos.length > 0 && vendedores.length > 0) {
      const cots = [
        {
          folio: 'COT-2026-BMW-001',
          id_cliente: clientes[0].id_cliente,
          id_vehiculo: vehiculos[0].id_vehiculo,
          id_vendedor: vendedores[0].id_vendedor,
          precio_lista: vehiculos[0].precio,
          descuento: 2500.00,
          precio_final: Number(vehiculos[0].precio) - 2500.00,
          propuesta_enganche: (Number(vehiculos[0].precio) - 2500.00) * 0.35,
          plazo_meses_sugerido: 36,
          fecha_emision: '2026-03-01',
          fecha_vencimiento: '2026-03-31',
          estado: 'Aceptada',
          notas: 'Cotización con bono de lealtad cliente BMW y paquete Service Inclusive 5 años.'
        },
        {
          folio: 'COT-2026-BMW-002',
          id_cliente: clientes[1].id_cliente,
          id_vehiculo: vehiculos[2 % vehiculos.length].id_vehiculo,
          id_vendedor: vendedores[1 % vendedores.length].id_vendedor,
          precio_lista: vehiculos[2 % vehiculos.length].precio,
          descuento: 1800.00,
          precio_final: Number(vehiculos[2 % vehiculos.length].precio) - 1800.00,
          propuesta_enganche: (Number(vehiculos[2 % vehiculos.length].precio) - 1800.00) * 0.40,
          plazo_meses_sugerido: 48,
          fecha_emision: '2026-03-10',
          fecha_vencimiento: '2026-04-10',
          estado: 'Enviada',
          notas: 'Propuesta formal enviada con opción de arrendamiento puro y valor residual protegido.'
        },
        {
          folio: 'COT-2026-BMW-003',
          id_cliente: clientes[2 % clientes.length].id_cliente,
          id_vehiculo: vehiculos[4 % vehiculos.length].id_vehiculo,
          id_vendedor: vendedores[2 % vendedores.length].id_vendedor,
          precio_lista: vehiculos[4 % vehiculos.length].precio,
          descuento: 3000.00,
          precio_final: Number(vehiculos[4 % vehiculos.length].precio) - 3000.00,
          propuesta_enganche: (Number(vehiculos[4 % vehiculos.length].precio) - 3000.00) * 0.50,
          plazo_meses_sugerido: 24,
          fecha_emision: '2026-03-15',
          fecha_vencimiento: '2026-04-15',
          estado: 'Enviada',
          notas: 'Configuración especial con accesorios M Performance en fibra de carbono.'
        }
      ];

      for (const cot of cots) {
        await connection.query(`
          INSERT INTO cotizaciones (folio, id_cliente, id_vehiculo, id_vendedor, precio_lista, descuento, precio_final, propuesta_enganche, plazo_meses_sugerido, fecha_emision, fecha_vencimiento, estado, notas, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
          cot.folio, cot.id_cliente, cot.id_vehiculo, cot.id_vendedor, cot.precio_lista, cot.descuento,
          cot.precio_final, cot.propuesta_enganche, cot.plazo_meses_sugerido, cot.fecha_emision,
          cot.fecha_vencimiento, cot.estado, cot.notas
        ]);
      }
      console.log('[SEED] Cotizaciones formales insertadas.');
    }

    // 2. FACTURAS CFDI
    const [facCount] = await connection.query('SELECT COUNT(*) AS total FROM facturas');
    if (facCount[0].total === 0 && ventas.length > 0) {
      for (let i = 0; i < ventas.length; i++) {
        const v = ventas[i];
        const subtotal = Number(v.precio_venta) / 1.16;
        const iva = Number(v.precio_venta) - subtotal;
        const folioUUID = `4a9b2c8e-${i}d3f-4e5a-8b9c-1234567890${i}a`;

        await connection.query(`
          INSERT INTO facturas (numero_factura, folio_fiscal_uuid, id_venta, id_cliente, tipo_comprobante, subtotal, iva, total, metodo_pago, fecha_emision, estado, created_at, updated_at)
          VALUES (?, ?, ?, ?, 'Ingreso Venta Vehículo', ?, ?, ?, 'Transferencia SPEI', '2026-03-20 14:00:00', 'Timbrada', NOW(), NOW())
        `, [
          `FAC-BMW-2026-${1000 + i}`, folioUUID, v.id_venta, v.id_cliente,
          subtotal.toFixed(2), iva.toFixed(2), v.precio_venta
        ]);
      }
      console.log('[SEED] Facturas electrónicas CFDI insertadas.');
    }

    // 3. PEDIDOS A FABRICA BMW GROUP
    const [pedCount] = await connection.query('SELECT COUNT(*) AS total FROM pedidos_fabrica');
    if (pedCount[0].total === 0 && modelos.length > 0 && sucursales.length > 0) {
      const pedidos = [
        {
          codigo: 'BMW-ORD-MUC-9821',
          id_modelo: modelos[0].id_modelo,
          id_sucursal: sucursales[0].id_sucursal,
          id_cliente: clientes[0]?.id_cliente || null,
          planta: 'Planta Múnich (Alemania)',
          vin: 'WBA11AK04RFG99011',
          specs: 'Pintura BMW Individual Frozen Deep Grey, Tapicería en Cuero Merino Tartufo, Frenos M Sport en Rojo.',
          fecha_orden: '2026-02-15',
          fecha_entrega: '2026-05-20',
          estado: 'En Tránsito Marítimo',
          costo_usd: 54000.00
        },
        {
          codigo: 'BMW-ORD-SPAR-7712',
          id_modelo: modelos[1 % modelos.length].id_modelo,
          id_sucursal: sucursales[1 % sucursales.length].id_sucursal,
          id_cliente: clientes[1]?.id_cliente || null,
          planta: 'Planta Spartanburg (EE.UU.)',
          vin: '5UXCR6C08R9L99022',
          specs: 'Paquete Ejecutivo M Sport Pro, Rines de 22 Pulgadas Bicolor Estilo 742 M, Techo Panorámico Sky Lounge.',
          fecha_orden: '2026-02-28',
          fecha_entrega: '2026-04-30',
          estado: 'En Aduana Portuaria',
          costo_usd: 78500.00
        },
        {
          codigo: 'BMW-ORD-SLP-4403',
          id_modelo: modelos[2 % modelos.length].id_modelo,
          id_sucursal: sucursales[2 % sucursales.length].id_sucursal,
          id_cliente: null,
          planta: 'Planta San Luis Potosí (México)',
          vin: '3MW5R1C05RFK99033',
          specs: 'Unidad de exhibición Showroom: Paquete Aerodinámico M, Suspensión Adaptativa M, Sistema de Sonido Harman Kardon.',
          fecha_orden: '2026-03-01',
          fecha_entrega: '2026-04-15',
          estado: 'Control de Calidad',
          costo_usd: 48900.00
        },
        {
          codigo: 'BMW-ORD-DING-5504',
          id_modelo: modelos[3 % modelos.length].id_modelo,
          id_sucursal: sucursales[0].id_sucursal,
          id_cliente: clientes[2]?.id_cliente || null,
          planta: 'Planta Dingolfing (Alemania)',
          vin: 'WBY77I704RFG99044',
          specs: 'BMW Theatre Screen 31.3 pulgadas 8K, Puertas Automáticas de Cierre Suave, Sonido Bowers & Wilkins Diamond Surround 4D.',
          fecha_orden: '2026-01-20',
          fecha_entrega: '2026-04-25',
          estado: 'Recibido en Concesionario',
          costo_usd: 122000.00
        }
      ];

      for (const p of pedidos) {
        await connection.query(`
          INSERT INTO pedidos_fabrica (codigo_orden_fabrica, id_modelo, id_sucursal_destino, id_cliente, planta_ensamblaje, vin_asignado, especificaciones_individual, fecha_orden, fecha_estimada_entrega, estado_produccion, costo_importacion_usd, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
          p.codigo, p.id_modelo, p.id_sucursal, p.id_cliente, p.planta,
          p.vin, p.specs, p.fecha_orden, p.fecha_entrega, p.estado, p.costo_usd
        ]);
      }
      console.log('[SEED] Pedidos a fábrica BMW Group insertados.');
    }

    // 4. INSPECCIONES CPO (110 Puntos BMW Premium Selection)
    const [cpoCount] = await connection.query('SELECT COUNT(*) AS total FROM inspecciones_cpo');
    if (cpoCount[0].total === 0 && vehiculos.length > 0) {
      for (let i = 0; i < Math.min(vehiculos.length, 4); i++) {
        const v = vehiculos[i];
        await connection.query(`
          INSERT INTO inspecciones_cpo (folio_inspeccion, id_vehiculo, tecnico_certificador, puntos_revisados_total, puntos_aprobados, estado_motor_transmision, estado_suspension_frenos, estado_carroceria_pintura, aprobado_certificacion_cpo, fecha_inspeccion, dictamen, created_at, updated_at)
          VALUES (?, ?, 'Ing. Hans Gruber - Certificación Nivel Master BMW', 110, 110, 'Excelente', 'Excelente', 'Impecable', TRUE, '2026-03-05', 'Vehículo cumple al 100% con los estándares de certificación BMW Premium Selection. Historial de servicio completo sin siniestros estructurales.', NOW(), NOW())
        `, [`CPO-CHK-2026-${100 + i}`, v.id_vehiculo]);
      }
      console.log('[SEED] Inspecciones de certificación 110 puntos CPO insertadas.');
    }

    // 5. CAMPAÑAS DE MARKETING
    const [campCount] = await connection.query('SELECT COUNT(*) AS total FROM campanas_marketing');
    if (campCount[0].total === 0 && sucursales.length > 0) {
      const campanas = [
        {
          nombre: 'Lanzamiento Nacional Nueva Gama BMW M Competition & XM',
          tipo: 'Lanzamiento Gama M',
          sucursal: sucursales[0].id_sucursal,
          presupuesto: 45000.00,
          inicio: '2026-03-01',
          fin: '2026-04-30',
          leads: 185,
          ventas: 6,
          estado: 'En Ejecución',
          objetivo: 'Presentación exclusiva a clientes VIP y medios del nuevo BMW XM V8 PHEV y M3 CS.'
        },
        {
          nombre: 'BMW M Track Day Exclusivo en Autódromo Hermanos Rodríguez',
          tipo: 'Track Day Exclusivo en Autódromo',
          sucursal: sucursales[1 % sucursales.length].id_sucursal,
          presupuesto: 62000.00,
          inicio: '2026-04-15',
          fin: '2026-04-17',
          leads: 95,
          ventas: 4,
          estado: 'Planificada',
          objetivo: 'Experiencia de pilotaje en circuito cerrado con instructores de BMW M Driving Experience de Múnich.'
        },
        {
          nombre: 'Jornadas de Electrificación BMW i: Movilidad Sustentable de Lujo',
          tipo: 'Electrificación BMW i',
          sucursal: sucursales[2 % sucursales.length].id_sucursal,
          presupuesto: 28000.00,
          inicio: '2026-02-01',
          fin: '2026-03-15',
          leads: 140,
          ventas: 5,
          estado: 'Finalizada',
          objetivo: 'Promoción de BMW i4, i7 e iX con bono de cargador BMW Wallbox Gen 3 e instalación gratis.'
        }
      ];

      for (const c of campanas) {
        await connection.query(`
          INSERT INTO campanas_marketing (nombre, tipo_evento, id_sucursal, presupuesto_usd, fecha_inicio, fecha_fin, leads_generados, ventas_atribuidas, estado, objetivo, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [c.nombre, c.tipo, c.sucursal, c.presupuesto, c.inicio, c.fin, c.leads, c.ventas, c.estado, c.objetivo]);
      }
      console.log('[SEED] Campañas y eventos de marketing insertados.');
    }

    // 6. ENCUESTAS DE SATISFACCIÓN (CSI / NPS)
    const [encCount] = await connection.query('SELECT COUNT(*) AS total FROM encuestas_satisfaccion');
    if (encCount[0].total === 0 && clientes.length > 0 && ventas.length > 0) {
      const encuestas = [
        {
          id_cliente: clientes[0].id_cliente,
          id_venta: ventas[0].id_venta,
          id_mant: null,
          tipo: 'Entrega de Vehículo Nuevo',
          pts_gen: 10,
          pts_ase: 10,
          recomienda: true,
          comentarios: 'Experiencia inmejorable en la entrega en Masaryk. El asesor nos explicó a detalle cada función del sistema iDrive 8.5.',
          fecha: '2026-03-22'
        },
        {
          id_cliente: clientes[1].id_cliente,
          id_venta: ventas[1 % ventas.length].id_venta,
          id_mant: null,
          tipo: 'Entrega de Vehículo Nuevo',
          pts_gen: 9,
          pts_ase: 10,
          recomienda: true,
          comentarios: 'Excelente atención y puntualidad. El vehículo llegó impecable con el tratamiento cerámico de pintura.',
          fecha: '2026-03-24'
        },
        {
          id_cliente: clientes[2 % clientes.length].id_cliente,
          id_venta: null,
          id_mant: mantenimientos[0]?.id_mantenimiento || null,
          tipo: 'Servicio en Taller',
          pts_gen: 10,
          pts_ase: 9,
          recomienda: true,
          comentarios: 'El servicio de rodaje M se realizó en el tiempo prometido. La sala lounge para clientes mientras dura el servicio es muy cómoda.',
          fecha: '2026-03-26'
        }
      ];

      for (const e of encuestas) {
        await connection.query(`
          INSERT INTO encuestas_satisfaccion (id_cliente, id_venta, id_mantenimiento, tipo_experiencia, puntuacion_general, puntuacion_asesor, recomienda_concesionario, comentarios_cliente, fecha_encuesta, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [e.id_cliente, e.id_venta, e.id_mant, e.tipo, e.pts_gen, e.pts_ase, e.recomienda, e.comentarios, e.fecha]);
      }
      console.log('[SEED] Encuestas de satisfacción del cliente CSI insertadas.');
    }

    // 7. ALMACÉN CENTRAL DE REFACCIONES
    const [refCount] = await connection.query('SELECT COUNT(*) AS total FROM almacen_refacciones');
    if (refCount[0].total === 0 && proveedores.length > 0 && sucursales.length > 0) {
      const refacciones = [
        {
          oem: 'BMW-OIL-0W30-LL04',
          nombre: 'Aceite de Motor Sintético BMW TwinPower Turbo 0W-30 LongLife-04 (1 Litro)',
          prov: proveedores[0].id_proveedor,
          sucursal: sucursales[0].id_sucursal,
          bahia: 'Estante A-01 / Nivel 1',
          stock: 120,
          alerta: 20,
          costo: 28.50,
          cat: 'Fluidos y Lubricantes TwinPower'
        },
        {
          oem: 'BMW-BRK-M3-PADS',
          nombre: 'Juego de Pastillas Delanteras Cerámicas Brembo para BMW M3 G80 y M4 G82',
          prov: proveedores[1 % proveedores.length].id_proveedor,
          sucursal: sucursales[0].id_sucursal,
          bahia: 'Estante B-04 / Nivel 2',
          stock: 16,
          alerta: 4,
          costo: 420.00,
          cat: 'Sistema de Frenos M'
        },
        {
          oem: 'BMW-FLT-CABIN-M',
          nombre: 'Filtro de Aire de Cabina con Carbón Activado y Protección de Alérgenos Microfilter',
          prov: proveedores[0].id_proveedor,
          sucursal: sucursales[1 % sucursales.length].id_sucursal,
          bahia: 'Estante C-02 / Nivel 3',
          stock: 45,
          alerta: 10,
          costo: 65.00,
          cat: 'Filtros y Bujías'
        },
        {
          oem: 'BMW-SPARK-M-TURBO',
          nombre: 'Juego de 6 Bujías de Alto Rendimiento con Electrodo de Iridio para Motores S58 / S68',
          prov: proveedores[0].id_proveedor,
          sucursal: sucursales[0].id_sucursal,
          bahia: 'Estante D-01 / Nivel 4',
          stock: 36,
          alerta: 8,
          costo: 185.00,
          cat: 'Filtros y Bujías'
        },
        {
          oem: 'BMW-ZF-TRANS-FLUID',
          nombre: 'Líquido de Transmisión Automática Deportiva ZF 8HP LifeguardFluid 8 (1L)',
          prov: proveedores[1 % proveedores.length].id_proveedor,
          sucursal: sucursales[1 % sucursales.length].id_sucursal,
          bahia: 'Estante A-03 / Nivel 2',
          stock: 50,
          alerta: 15,
          costo: 42.00,
          cat: 'Tren Motriz y Suspensión'
        }
      ];

      for (const r of refacciones) {
        await connection.query(`
          INSERT INTO almacen_refacciones (numero_parte_oem, nombre_pieza, id_proveedor, id_sucursal, ubicacion_bahia_estante, cantidad_stock, stock_minimo_alerta, costo_unitario_usd, categoria_tecnica, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [r.oem, r.nombre, r.prov, r.sucursal, r.bahia, r.stock, r.alerta, r.costo, r.cat]);
      }
      console.log('[SEED] Refacciones técnicas en almacén insertadas.');
    }

    // 8. RECLAMACIONES DE GARANTÍA ANTE BMW AG
    const [rmaCount] = await connection.query('SELECT COUNT(*) AS total FROM reclamaciones_garantia');
    if (rmaCount[0].total === 0 && garantias.length > 0 && vehiculos.length > 0) {
      const rmas = [
        {
          codigo: 'BMW-RMA-2026-3021',
          id_garantia: garantias[0].id_garantia,
          id_vehiculo: garantias[0].id_vehiculo,
          id_mant: mantenimientos[0]?.id_mantenimiento || null,
          ista: 'ISTA-D-120008',
          falla: 'Sensor de presión de sobrealimentación secundario del banco 2 emitió lectura fuera de rango de tolerancia en frío.',
          reclamado: 1250.00,
          autorizado: 1250.00,
          estado: 'Liquidada',
          fecha: '2026-03-08'
        },
        {
          codigo: 'BMW-RMA-2026-3022',
          id_garantia: garantias[1 % garantias.length].id_garantia,
          id_vehiculo: garantias[1 % garantias.length].id_vehiculo,
          id_mant: null,
          ista: 'ISTA-D-610045',
          falla: 'Módulo de carga combinada (CCU) requirió reemplazo por actualización de firmware en garantía de tren motriz eléctrico.',
          reclamado: 3400.00,
          autorizado: 3400.00,
          estado: 'Aprobada por BMW AG',
          fecha: '2026-03-18'
        }
      ];

      for (const r of rmas) {
        await connection.query(`
          INSERT INTO reclamaciones_garantia (codigo_reclamacion, id_garantia, id_vehiculo, id_mantenimiento, codigo_falla_ista, descripcion_falla, monto_reclamado_usd, monto_autorizado_usd, estado, fecha_reclamacion, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
          r.codigo, r.id_garantia, r.id_vehiculo, r.id_mant,
          r.ista, r.falla, r.reclamado, r.autorizado, r.estado, r.fecha
        ]);
      }
      console.log('[SEED] Reclamaciones de garantía ante BMW AG insertadas.');
    }

    console.log('[ÉXITO TOTAL] Todas las 8 nuevas entidades fueron pobladas exitosamente.');
  } finally {
    await connection.end();
  }
}

seedNuevasEntidades().catch((err) => {
  console.error('[ERROR SEED NUEVAS ENTIDADES]:', err);
  process.exit(1);
});
