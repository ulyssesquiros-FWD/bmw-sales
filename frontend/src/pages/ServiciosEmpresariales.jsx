import { useState, useEffect, useCallback } from 'react';
import {
  Building2,
  Wrench,
  ShieldCheck,
  CreditCard,
  Gauge,
  Sparkles,
  Truck,
  ShieldAlert,
  FileText,
  Activity,
  RefreshCw,
  Receipt,
  Factory,
  CheckCircle2,
  Megaphone,
  Star,
  Package,
  AlertOctagon
} from 'lucide-react';
import { modulosService } from '../services/modulosService';
import { extractErrorMessage } from '../services/api';
import AlertBanner from '../components/common/AlertBanner';
import { formatUSD } from '../utils/formatters';

const TABS = [
  { id: 'sucursales', label: 'Sucursales BMW', icon: Building2 },
  { id: 'mantenimiento', label: 'Taller & Service', icon: Wrench },
  { id: 'garantias', label: 'Garantías Certified', icon: ShieldCheck },
  { id: 'financiamiento', label: 'BMW Financial', icon: CreditCard },
  { id: 'pruebas', label: 'Driving Experience', icon: Gauge },
  { id: 'accesorios', label: 'M Performance Parts', icon: Sparkles },
  { id: 'proveedores', label: 'Proveedores OEM', icon: Truck },
  { id: 'seguros', label: 'BMW Protection', icon: ShieldAlert },
  { id: 'cotizaciones', label: 'Cotizaciones Formales', icon: FileText },
  { id: 'facturas', label: 'Facturas CFDI', icon: Receipt },
  { id: 'pedidos', label: 'Pedidos a Planta', icon: Factory },
  { id: 'cpo', label: 'Inspecciones CPO 110 Pts', icon: CheckCircle2 },
  { id: 'marketing', label: 'Campañas BMW', icon: Megaphone },
  { id: 'encuestas', label: 'Satisfacción CSI', icon: Star },
  { id: 'almacen', label: 'Almacén de Piezas', icon: Package },
  { id: 'reclamaciones', label: 'Garantías RMA', icon: AlertOctagon },
  { id: 'reportes', label: 'Reportes Ejecutivos', icon: FileText },
  { id: 'auditoria', label: 'Bitácora Auditoría', icon: Activity }
];

export default function ServiciosEmpresariales() {
  const [activeTab, setActiveTab] = useState('sucursales');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTabData = useCallback(async (tabId) => {
    setLoading(true);
    setError('');
    try {
      let res;
      switch (tabId) {
        case 'sucursales':
          res = await modulosService.getSucursales();
          setData(res.data || []);
          break;
        case 'mantenimiento':
          res = await modulosService.getMantenimientos();
          setData(res.data || []);
          break;
        case 'garantias':
          res = await modulosService.getGarantias();
          setData(res.data || []);
          break;
        case 'financiamiento':
          res = await modulosService.getFinanciamientos();
          setData(res.data || []);
          break;
        case 'pruebas':
          res = await modulosService.getPruebasManejo();
          setData(res.data || []);
          break;
        case 'accesorios':
          res = await modulosService.getAccesorios();
          setData(res.data || []);
          break;
        case 'proveedores':
          res = await modulosService.getProveedores();
          setData(res.data || []);
          break;
        case 'seguros':
          res = await modulosService.getSeguros();
          setData(res.data || []);
          break;
        case 'cotizaciones':
          res = await modulosService.getCotizaciones();
          setData(res.data || []);
          break;
        case 'facturas':
          res = await modulosService.getFacturas();
          setData(res.data || []);
          break;
        case 'pedidos':
          res = await modulosService.getPedidosFabrica();
          setData(res.data || []);
          break;
        case 'cpo':
          res = await modulosService.getInspeccionesCpo();
          setData(res.data || []);
          break;
        case 'marketing':
          res = await modulosService.getCampanasMarketing();
          setData(res.data || []);
          break;
        case 'encuestas':
          res = await modulosService.getEncuestasSatisfaccion();
          setData(res.data || []);
          break;
        case 'almacen':
          res = await modulosService.getAlmacenRefacciones();
          setData(res.data || []);
          break;
        case 'reclamaciones':
          res = await modulosService.getReclamacionesGarantia();
          setData(res.data || []);
          break;
        case 'reportes':
          res = await modulosService.getReporteResumen();
          setData(res.data || {});
          break;
        case 'auditoria':
          res = await modulosService.getAuditoriaLogs({ limit: 50 });
          setData(res.data || []);
          break;
        default:
          setData([]);
      }
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTabData(activeTab);
  }, [activeTab, loadTabData]);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Ecosistema Empresarial BMW 360°</h1>
          <p className="page-subtitle">
            Plataforma integral de posventa, financiamiento, producción en planta, almacén técnico y certificaciones.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => loadTabData(activeTab)}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'spin-icon' : ''} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Tabs con scroll horizontal estilizado */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '20px' }}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                fontSize: '13px'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="card">
        <AlertBanner message={error} type="error" onClose={() => setError('')} />

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            <div className="spinner" style={{ margin: '0 auto 12px' }} />
            <span>Consultando datos del ecosistema BMW...</span>
          </div>
        ) : (
          <div>
            {/* Sucursales */}
            {activeTab === 'sucursales' && (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Nombre Showroom</th>
                      <th>Ciudad</th>
                      <th>Dirección</th>
                      <th>Teléfono</th>
                      <th>Capacidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((s) => (
                      <tr key={s.id_sucursal}>
                        <td><strong>{s.nombre}</strong></td>
                        <td>{s.ciudad}</td>
                        <td>{s.direccion}</td>
                        <td>{s.telefono}</td>
                        <td><span className="badge badge-primary">{s.capacidad_vehiculos} autos</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Mantenimiento */}
            {activeTab === 'mantenimiento' && (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Vehículo</th>
                      <th>Cliente</th>
                      <th>Servicio</th>
                      <th>Costo</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((m) => (
                      <tr key={m.id_mantenimiento}>
                        <td><strong>{m.modelo_nombre} {m.vehiculo_version}</strong></td>
                        <td>{m.cliente_nombre} {m.cliente_apellidos}</td>
                        <td>{m.tipo_servicio}</td>
                        <td>{formatUSD(m.costo)}</td>
                        <td>{m.fecha_servicio?.slice(0, 10)}</td>
                        <td><span className={`badge ${m.estado === 'Finalizado' ? 'badge-success' : 'badge-warning'}`}>{m.estado}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Garantías */}
            {activeTab === 'garantias' && (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Vehículo</th>
                      <th>Tipo Cobertura</th>
                      <th>Vigencia</th>
                      <th>Límite Km</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((g) => (
                      <tr key={g.id_garantia}>
                        <td><strong>{g.modelo_nombre} ({g.vin?.slice(-6)})</strong></td>
                        <td>{g.tipo_garantia}</td>
                        <td>{g.cobertura_meses} meses</td>
                        <td>{g.kilometraje_limite?.toLocaleString()} km</td>
                        <td><span className="badge badge-success">{g.estado}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Financiamiento */}
            {activeTab === 'financiamiento' && (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Venta</th>
                      <th>Entidad</th>
                      <th>Plazo</th>
                      <th>Tasa Anual</th>
                      <th>Monto Financiado</th>
                      <th>Cuota Mensual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((f) => (
                      <tr key={f.id_financiamiento}>
                        <td>Venta #{f.id_venta} - {f.modelo_nombre}</td>
                        <td><strong>{f.entidad_financiera}</strong></td>
                        <td>{f.plazo_meses} meses</td>
                        <td>{f.tasa_interes_anual}%</td>
                        <td>{formatUSD(f.monto_financiado)}</td>
                        <td style={{ color: '#1c69d4', fontWeight: 'bold' }}>{formatUSD(f.cuota_mensual)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pruebas de Manejo */}
            {activeTab === 'pruebas' && (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Vehículo</th>
                      <th>Cliente</th>
                      <th>Asesor</th>
                      <th>Fecha & Hora</th>
                      <th>Duración</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((p) => (
                      <tr key={p.id_prueba}>
                        <td><strong>{p.modelo_nombre} {p.vehiculo_version}</strong></td>
                        <td>{p.cliente_nombre} {p.cliente_apellidos}</td>
                        <td>{p.vendedor_nombre}</td>
                        <td>{new Date(p.fecha_prueba).toLocaleString()}</td>
                        <td>{p.duracion_minutos} min</td>
                        <td><span className={`badge ${p.estado === 'Realizada' ? 'badge-success' : 'badge-primary'}`}>{p.estado}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Accesorios M */}
            {activeTab === 'accesorios' && (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Parte OEM</th>
                      <th>Nombre Componente</th>
                      <th>Categoría</th>
                      <th>Precio USD</th>
                      <th>Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((a) => (
                      <tr key={a.id_accesorio}>
                        <td><code>{a.codigo_parte}</code></td>
                        <td><strong>{a.nombre}</strong></td>
                        <td><span className="badge badge-secondary">{a.categoria}</span></td>
                        <td>{formatUSD(a.precio)}</td>
                        <td><span className="badge badge-primary">{a.stock} unidades</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Proveedores */}
            {activeTab === 'proveedores' && (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Razón Social</th>
                      <th>ID Fiscal</th>
                      <th>Contacto</th>
                      <th>Correo</th>
                      <th>País Origen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((pr) => (
                      <tr key={pr.id_proveedor}>
                        <td><strong>{pr.razon_social}</strong></td>
                        <td><code>{pr.rfc_identificacion}</code></td>
                        <td>{pr.contacto_nombre}</td>
                        <td>{pr.correo}</td>
                        <td><span className="badge badge-primary">{pr.pais_origen}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Seguros */}
            {activeTab === 'seguros' && (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Póliza</th>
                      <th>Aseguradora</th>
                      <th>Vehículo</th>
                      <th>Cobertura</th>
                      <th>Prima Anual</th>
                      <th>Vencimiento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((sg) => (
                      <tr key={sg.id_seguro}>
                        <td><code>{sg.numero_poliza}</code></td>
                        <td>{sg.aseguradora}</td>
                        <td>{sg.modelo_nombre} ({sg.vin?.slice(-6)})</td>
                        <td>{sg.cobertura}</td>
                        <td>{formatUSD(sg.prima_anual)}</td>
                        <td>{sg.fecha_vencimiento?.slice(0, 10)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Cotizaciones Formales */}
            {activeTab === 'cotizaciones' && (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Folio</th>
                      <th>Cliente</th>
                      <th>Vehículo Cotizado</th>
                      <th>Asesor</th>
                      <th>Precio Final</th>
                      <th>Enganche Sugerido</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((c) => (
                      <tr key={c.id_cotizacion}>
                        <td><code>{c.folio}</code></td>
                        <td>{c.cliente_nombre} {c.cliente_apellidos}</td>
                        <td>{c.modelo_nombre} {c.vehiculo_version}</td>
                        <td>{c.vendedor_nombre}</td>
                        <td><strong>{formatUSD(c.precio_final)}</strong></td>
                        <td>{formatUSD(c.propuesta_enganche)}</td>
                        <td><span className="badge badge-primary">{c.estado}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Facturas CFDI */}
            {activeTab === 'facturas' && (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Factura</th>
                      <th>UUID Fiscal</th>
                      <th>Cliente / RFC</th>
                      <th>Comprobante</th>
                      <th>Método Pago</th>
                      <th>Total USD</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((f) => (
                      <tr key={f.id_factura}>
                        <td><code>{f.numero_factura}</code></td>
                        <td><code style={{ fontSize: '11px' }}>{f.folio_fiscal_uuid}</code></td>
                        <td>{f.cliente_nombre} ({f.cliente_rfc})</td>
                        <td><span className="badge badge-secondary">{f.tipo_comprobante}</span></td>
                        <td>{f.metodo_pago}</td>
                        <td><strong style={{ color: '#10b981' }}>{formatUSD(f.total)}</strong></td>
                        <td><span className="badge badge-success">{f.estado}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pedidos a Planta */}
            {activeTab === 'pedidos' && (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Código Orden</th>
                      <th>Modelo</th>
                      <th>Planta Ensamblaje</th>
                      <th>Destino</th>
                      <th>Fecha Entrega</th>
                      <th>Estado Producción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((p) => (
                      <tr key={p.id_pedido_fabrica}>
                        <td><code>{p.codigo_orden_fabrica}</code></td>
                        <td><strong>{p.modelo_nombre}</strong></td>
                        <td>{p.planta_ensamblaje}</td>
                        <td>{p.sucursal_nombre}</td>
                        <td>{p.fecha_estimada_entrega?.slice(0, 10)}</td>
                        <td><span className="badge badge-warning">{p.estado_produccion}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Inspecciones CPO */}
            {activeTab === 'cpo' && (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Folio CPO</th>
                      <th>Vehículo</th>
                      <th>Técnico Certificador</th>
                      <th>Puntos</th>
                      <th>Motor & Chasis</th>
                      <th>Certificación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((i) => (
                      <tr key={i.id_inspeccion}>
                        <td><code>{i.folio_inspeccion}</code></td>
                        <td><strong>{i.modelo_nombre} {i.vehiculo_version}</strong> ({i.vin?.slice(-6)})</td>
                        <td>{i.tecnico_certificador}</td>
                        <td>{i.puntos_aprobados} / {i.puntos_revisados_total}</td>
                        <td>{i.estado_motor_transmision}</td>
                        <td><span className="badge badge-success">Certificado Aprobado</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Campañas de Marketing */}
            {activeTab === 'marketing' && (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Campaña / Evento</th>
                      <th>Tipo</th>
                      <th>Presupuesto USD</th>
                      <th>Periodo</th>
                      <th>Leads</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((c) => (
                      <tr key={c.id_campana}>
                        <td><strong>{c.nombre}</strong></td>
                        <td><span className="badge badge-secondary">{c.tipo_evento}</span></td>
                        <td>{formatUSD(c.presupuesto_usd)}</td>
                        <td>{c.fecha_inicio?.slice(0, 10)} al {c.fecha_fin?.slice(0, 10)}</td>
                        <td><span className="badge badge-primary">{c.leads_generados} prospectos</span></td>
                        <td><span className="badge badge-success">{c.estado}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Encuestas de Satisfacción CSI */}
            {activeTab === 'encuestas' && (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Experiencia</th>
                      <th>Score General</th>
                      <th>Score Asesor</th>
                      <th>NPS Recomienda</th>
                      <th>Comentarios</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((e) => (
                      <tr key={e.id_encuesta}>
                        <td><strong>{e.cliente_nombre} {e.cliente_apellidos}</strong></td>
                        <td><span className="badge badge-secondary">{e.tipo_experiencia}</span></td>
                        <td><span className="badge badge-success">{e.puntuacion_general} / 10</span></td>
                        <td><span className="badge badge-primary">{e.puntuacion_asesor} / 10</span></td>
                        <td>{e.recomienda_concesionario ? 'Sí (Promotor)' : 'No'}</td>
                        <td style={{ fontSize: '12px' }}>{e.comentarios_cliente}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Almacén de Refacciones */}
            {activeTab === 'almacen' && (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Parte OEM</th>
                      <th>Refacción / Consumible</th>
                      <th>Categoría Técnica</th>
                      <th>Ubicación</th>
                      <th>Stock</th>
                      <th>Costo Unitario</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((r) => (
                      <tr key={r.id_refaccion}>
                        <td><code>{r.numero_parte_oem}</code></td>
                        <td><strong>{r.nombre_pieza}</strong></td>
                        <td><span className="badge badge-secondary">{r.categoria_tecnica}</span></td>
                        <td>{r.ubicacion_bahia_estante}</td>
                        <td><span className={`badge ${r.cantidad_stock <= r.stock_minimo_alerta ? 'badge-warning' : 'badge-primary'}`}>{r.cantidad_stock} unid.</span></td>
                        <td>{formatUSD(r.costo_unitario_usd)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Reclamaciones de Garantía RMA */}
            {activeTab === 'reclamaciones' && (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Código RMA</th>
                      <th>Vehículo</th>
                      <th>Código ISTA</th>
                      <th>Monto Reclamado</th>
                      <th>Monto Autorizado</th>
                      <th>Estado ante BMW AG</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((rm) => (
                      <tr key={rm.id_reclamacion}>
                        <td><code>{rm.codigo_reclamacion}</code></td>
                        <td><strong>{rm.vehiculo_version}</strong> ({rm.vin?.slice(-6)})</td>
                        <td><code>{rm.codigo_falla_ista}</code></td>
                        <td>{formatUSD(rm.monto_reclamado_usd)}</td>
                        <td style={{ color: '#10b981', fontWeight: 'bold' }}>{formatUSD(rm.monto_autorizado_usd)}</td>
                        <td><span className="badge badge-success">{rm.estado}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Reportes */}
            {activeTab === 'reportes' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                <div className="stat-card">
                  <div className="stat-card-title">Ventas Totales Registradas</div>
                  <div className="stat-card-value">{data?.ventas?.total_ventas || 0}</div>
                  <div style={{ fontSize: '13px', color: '#10b981', marginTop: '6px' }}>
                    Facturación: {formatUSD(data?.ventas?.ingresos_brutos_usd || 0)}
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-title">Valor Inventario Disponible</div>
                  <div className="stat-card-value" style={{ color: '#1c69d4' }}>
                    {formatUSD(data?.inventario?.valor_disponible_usd || 0)}
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>
                    Unidades en piso: {data?.inventario?.total_unidades || 0}
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-title">Sucursales Activas</div>
                  <div className="stat-card-value">{data?.modulos_adicionales?.sucursales || 0}</div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>
                    Red oficial de distribución
                  </div>
                </div>
              </div>
            )}

            {/* Auditoría */}
            {activeTab === 'auditoria' && (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Acción</th>
                      <th>Entidad</th>
                      <th>Registro</th>
                      <th>IP</th>
                      <th>Detalle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((l) => (
                      <tr key={l.id_log}>
                        <td>{new Date(l.fecha_creacion).toLocaleString()}</td>
                        <td><code>{l.accion}</code></td>
                        <td>{l.entidad_afectada}</td>
                        <td>{l.id_registro || '-'}</td>
                        <td>{l.ip_origen}</td>
                        <td style={{ fontSize: '12px' }}>{l.detalle}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
