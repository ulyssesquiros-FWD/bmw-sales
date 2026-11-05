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
  RefreshCw
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
          <h1 className="page-title">Ecosistema Empresarial BMW</h1>
          <p className="page-subtitle">
            Administración integral de posventa, financiamiento, accesorios M Performance y auditoría operativa.
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

      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '20px' }}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={isActive ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{ whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {error && <AlertBanner type="error" message={error} onClose={() => setError('')} />}

      <div className="card-panel">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            <RefreshCw size={24} className="spin-icon" style={{ margin: '0 auto 10px' }} />
            <div>Cargando datos del módulo BMW...</div>
          </div>
        ) : (
          <div>
            {activeTab === 'sucursales' && (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Sucursal</th>
                      <th>Ciudad</th>
                      <th>Dirección</th>
                      <th>Teléfono</th>
                      <th>Capacidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((s) => (
                      <tr key={s.id_sucursal}>
                        <td style={{ fontWeight: 600 }}>{s.nombre}</td>
                        <td>{s.ciudad}</td>
                        <td>{s.direccion}</td>
                        <td>{s.telefono}</td>
                        <td>{s.capacidad_vehiculos} autos</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'accesorios' && (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Código Parte</th>
                      <th>Accesorio / Pieza</th>
                      <th>Categoría</th>
                      <th>Precio (USD)</th>
                      <th>Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((a) => (
                      <tr key={a.id_accesorio}>
                        <td><code>{a.codigo_parte}</code></td>
                        <td style={{ fontWeight: 600 }}>{a.nombre}</td>
                        <td><span className="badge badge-m">{a.categoria}</span></td>
                        <td>{formatUSD(a.precio)}</td>
                        <td>{a.stock} un.</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'garantias' && (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Vehículo</th>
                      <th>VIN</th>
                      <th>Tipo Garantía</th>
                      <th>Cobertura</th>
                      <th>Límite Km</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((g) => (
                      <tr key={g.id_garantia}>
                        <td>{g.modelo_nombre} - {g.version}</td>
                        <td><code>{g.vin}</code></td>
                        <td>{g.tipo_garantia}</td>
                        <td>{g.cobertura_meses} meses</td>
                        <td>{g.kilometraje_limite.toLocaleString()} km</td>
                        <td><span className="badge badge-disponible">{g.estado}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'mantenimiento' && (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Vehículo</th>
                      <th>Cliente</th>
                      <th>Servicio</th>
                      <th>Costo</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((m) => (
                      <tr key={m.id_mantenimiento}>
                        <td>{m.fecha_servicio?.slice(0, 10)}</td>
                        <td>{m.modelo_nombre} ({m.vin?.slice(-6)})</td>
                        <td>{m.cliente_nombre} {m.cliente_apellidos}</td>
                        <td>{m.tipo_servicio}</td>
                        <td>{formatUSD(m.costo)}</td>
                        <td><span className="badge badge-info">{m.estado}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'financiamiento' && (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID Venta</th>
                      <th>Entidad Financiera</th>
                      <th>Plazo</th>
                      <th>Tasa Anual</th>
                      <th>Cuota Mensual</th>
                      <th>Monto Financiado</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((f) => (
                      <tr key={f.id_financiamiento}>
                        <td>Venta #{f.id_venta}</td>
                        <td>{f.entidad_financiera}</td>
                        <td>{f.plazo_meses} meses</td>
                        <td>{f.tasa_interes_anual}%</td>
                        <td>{formatUSD(f.cuota_mensual)}</td>
                        <td style={{ fontWeight: 700 }}>{formatUSD(f.monto_financiado)}</td>
                        <td><span className="badge badge-disponible">{f.estado}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'pruebas' && (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Fecha & Hora</th>
                      <th>Vehículo</th>
                      <th>Cliente</th>
                      <th>Asesor</th>
                      <th>Duración</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((p) => (
                      <tr key={p.id_prueba}>
                        <td>{new Date(p.fecha_prueba).toLocaleString()}</td>
                        <td>{p.modelo_nombre}</td>
                        <td>{p.cliente_nombre} {p.cliente_apellidos}</td>
                        <td>{p.vendedor_nombre} {p.vendedor_apellidos}</td>
                        <td>{p.duracion_minutos} min</td>
                        <td><span className="badge badge-info">{p.estado}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'proveedores' && (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Razón Social</th>
                      <th>ID Fiscal</th>
                      <th>Contacto</th>
                      <th>Correo</th>
                      <th>País</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((pr) => (
                      <tr key={pr.id_proveedor}>
                        <td style={{ fontWeight: 600 }}>{pr.razon_social}</td>
                        <td><code>{pr.rfc_identificacion}</code></td>
                        <td>{pr.contacto_nombre}</td>
                        <td>{pr.correo}</td>
                        <td>{pr.pais_origen}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

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
