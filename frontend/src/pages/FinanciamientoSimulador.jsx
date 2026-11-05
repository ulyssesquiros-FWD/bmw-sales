import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Calculator,
  DollarSign,
  Calendar,
  Percent,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  TrendingDown,
  Plus,
  X,
  Trash2,
  CreditCard
} from 'lucide-react';
import { modulosService } from '../services/modulosService';
import { vehiculoService } from '../services/vehiculoService';
import { ventaService } from '../services/ventaService';
import { BmwMEmblem } from '../components/common/BmwLogos';

export default function FinanciamientoSimulador() {
  const [financiamientos, setFinanciamientos] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensajeExito, setMensajeExito] = useState(null);
  const [error, setError] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // Estados del Simulador Interactivo
  const [vehiculoSeleccionadoId, setVehiculoSeleccionadoId] = useState('');
  const [precioVehiculo, setPrecioVehiculo] = useState(75000);
  const [porcentajeEnganche, setPorcentajeEnganche] = useState(30);
  const [plazoMeses, setPlazoMeses] = useState(36);
  const [tasaAnual, setTasaAnual] = useState(8.99);

  // Formulario nuevo contrato de crédito
  const [form, setForm] = useState({
    id_venta: '',
    entidad_financiera: 'BMW Financial Services Select',
    plazo_meses: 36,
    tasa_interes_anual: 8.99,
    cuota_mensual: '',
    monto_financiado: '',
    estado: 'Aprobado'
  });

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      const [resFin, resVeh, resVentas] = await Promise.all([
        modulosService.getFinanciamientos(),
        vehiculoService.getAll({ limit: 100 }),
        ventaService.getAll()
      ]);

      if (resFin.ok) setFinanciamientos(resFin.data || []);
      if (resVeh.ok) {
        setVehiculos(resVeh.data || []);
        if (resVeh.data && resVeh.data.length > 0 && !vehiculoSeleccionadoId) {
          setVehiculoSeleccionadoId(String(resVeh.data[0].id_vehiculo));
          setPrecioVehiculo(Number(resVeh.data[0].precio) || 75000);
        }
      }
      if (resVentas.ok) setVentas(resVentas.data || []);
    } catch (err) {
      console.error('Error al cargar datos financieros:', err);
      setError('No fue posible cargar las líneas de financiamiento.');
    } finally {
      setCargando(false);
    }
  }, [vehiculoSeleccionadoId]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const formatearUSD = (val) => {
    const n = Number(val) || 0;
    return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Cálculos del simulador
  const simulacion = useMemo(() => {
    const precio = Number(precioVehiculo) || 0;
    const enganche = (precio * (Number(porcentajeEnganche) || 0)) / 100;
    const montoFinanciado = Math.max(0, precio - enganche);

    const tasaMensual = (Number(tasaAnual) || 0) / 100 / 12;
    const n = Number(plazoMeses) || 36;

    let cuotaMensual = 0;
    if (montoFinanciado > 0) {
      if (tasaMensual > 0) {
        cuotaMensual =
          (montoFinanciado * (tasaMensual * Math.pow(1 + tasaMensual, n))) /
          (Math.pow(1 + tasaMensual, n) - 1);
      } else {
        cuotaMensual = montoFinanciado / n;
      }
    }

    const pagoTotal = cuotaMensual * n;
    const totalIntereses = Math.max(0, pagoTotal - montoFinanciado);

    return {
      precio,
      enganche,
      montoFinanciado,
      cuotaMensual,
      totalIntereses,
      pagoTotal
    };
  }, [precioVehiculo, porcentajeEnganche, plazoMeses, tasaAnual]);

  const handleCambioVehiculo = (id) => {
    setVehiculoSeleccionadoId(id);
    const encontrado = vehiculos.find((v) => String(v.id_vehiculo) === String(id));
    if (encontrado) {
      setPrecioVehiculo(Number(encontrado.precio) || 0);
    }
  };

  const handleCrearFinanciamiento = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      const payload = {
        id_venta: parseInt(form.id_venta, 10),
        entidad_financiera: form.entidad_financiera,
        plazo_meses: parseInt(form.plazo_meses, 10),
        tasa_interes_anual: parseFloat(form.tasa_interes_anual),
        cuota_mensual: parseFloat(form.cuota_mensual),
        monto_financiado: parseFloat(form.monto_financiado),
        estado: form.estado
      };

      const res = await modulosService.createFinanciamiento(payload);
      if (res.ok) {
        setMensajeExito('Línea de financiamiento BMW Financial Services aprobada y guardada.');
        setModalAbierto(false);
        setForm({
          id_venta: '',
          entidad_financiera: 'BMW Financial Services Select',
          plazo_meses: 36,
          tasa_interes_anual: 8.99,
          cuota_mensual: '',
          monto_financiado: '',
          estado: 'Aprobado'
        });
        await cargarDatos();
        setTimeout(() => setMensajeExito(null), 4000);
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Error al guardar el financiamiento.');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Desea eliminar este registro de financiamiento?')) return;
    try {
      await modulosService.deleteFinanciamiento(id);
      setMensajeExito('Financiamiento eliminado.');
      await cargarDatos();
      setTimeout(() => setMensajeExito(null), 3000);
    } catch (err) {
      console.error(err);
      setError('No fue posible eliminar el registro.');
    }
  };

  return (
    <div className="financiamiento-page">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <span className="badge badge-accent">BMW Financial Services</span>
            <BmwMEmblem height={12} />
          </div>
          <h1 className="page-title">Simulador Financiero &amp; Gestión de Créditos</h1>
          <p className="page-description">
            Cotización en tiempo real de planes BMW Select, crédito tradicional, cálculo de amortización y pólizas vigentes.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setError(null);
            setModalAbierto(true);
          }}
        >
          <Plus size={16} />
          <span>Registrar Crédito de Venta</span>
        </button>
      </div>

      {mensajeExito && (
        <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>
          <CheckCircle2 size={18} />
          <span>{mensajeExito}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* SECCIÓN DEL SIMULADOR INTERACTIVO */}
      <div className="card" style={{ padding: '1.75rem', marginBottom: '2rem', borderTop: '4px solid #1c69d4' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
          <Calculator size={22} style={{ color: '#1c69d4' }} />
          <h2 style={{ margin: 0, fontSize: '1.35rem' }}>Simulador Oficial BMW Financial Services Select</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {/* Controles de Configuración */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Seleccionar Vehículo */}
            <div className="form-group">
              <label style={{ fontWeight: 600, marginBottom: '0.4rem', display: 'block' }}>
                Seleccionar Vehículo del Showroom
              </label>
              <select
                className="form-control"
                value={vehiculoSeleccionadoId}
                onChange={(e) => handleCambioVehiculo(e.target.value)}
              >
                {vehiculos.map((v) => (
                  <option key={v.id_vehiculo} value={v.id_vehiculo}>
                    {v.modelo_nombre || 'BMW'} {v.version} ({v.anio}) — {formatearUSD(v.precio)}
                  </option>
                ))}
              </select>
            </div>

            {/* Precio Base */}
            <div className="form-group">
              <label style={{ fontWeight: 600, marginBottom: '0.4rem', display: 'block' }}>
                Precio del Vehículo ($ USD)
              </label>
              <input
                type="number"
                min="10000"
                step="500"
                className="form-control"
                value={precioVehiculo}
                onChange={(e) => {
                  setPrecioVehiculo(Number(e.target.value));
                  setVehiculoSeleccionadoId('');
                }}
              />
            </div>

            {/* Slider de Enganche */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <label style={{ fontWeight: 600 }}>Enganche Inicial ({porcentajeEnganche}%)</label>
                <strong style={{ color: '#1c69d4' }}>{formatearUSD(simulacion.enganche)}</strong>
              </div>
              <input
                type="range"
                min="10"
                max="70"
                step="5"
                style={{ width: '100%', accentColor: '#1c69d4', cursor: 'pointer' }}
                value={porcentajeEnganche}
                onChange={(e) => setPorcentajeEnganche(Number(e.target.value))}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <span>10% Mínimo</span>
                <span>40% Recomendado</span>
                <span>70% Máximo</span>
              </div>
            </div>

            {/* Plazo en Meses */}
            <div className="form-group">
              <label style={{ fontWeight: 600, marginBottom: '0.4rem', display: 'block' }}>Plazo de Financiamiento</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[12, 24, 36, 48, 60].map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={`btn btn-sm ${plazoMeses === m ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1 }}
                    onClick={() => setPlazoMeses(m)}
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>

            {/* Tasa Anual */}
            <div className="form-group">
              <label style={{ fontWeight: 600, marginBottom: '0.4rem', display: 'block' }}>Plan de Tasa de Interés Anual</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[
                  { label: 'BMW Select (8.99%)', tasa: 8.99 },
                  { label: 'Tradicional (10.5%)', tasa: 10.5 },
                  { label: 'Balloon (9.45%)', tasa: 9.45 }
                ].map((item) => (
                  <button
                    key={item.tasa}
                    type="button"
                    className={`btn btn-sm ${tasaAnual === item.tasa ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1, fontSize: '0.75rem', padding: '0.4rem' }}
                    onClick={() => setTasaAnual(item.tasa)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tarjeta de Resumen y Resultados */}
          <div
            style={{
              background: 'var(--bg-secondary)',
              borderRadius: '12px',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              border: '1px solid var(--border-color)'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <span className="badge badge-accent">Cotización Preliminar</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Validez: 15 días</span>
              </div>

              <div style={{ textAlign: 'center', padding: '1rem 0 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Cuota Mensual Estimada
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1c69d4', lineHeight: 1.1 }}>
                  {formatearUSD(simulacion.cuotaMensual)}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                  A {plazoMeses} meses con tasa anual del {tasaAnual}%
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.25rem 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Precio de Lista:</span>
                  <strong>{formatearUSD(simulacion.precio)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Enganche Requerido ({porcentajeEnganche}%):</span>
                  <strong style={{ color: '#10b981' }}>- {formatearUSD(simulacion.enganche)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Capital Financiado:</span>
                  <strong>{formatearUSD(simulacion.montoFinanciado)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Total Estimado de Intereses:</span>
                  <span style={{ color: '#f59e0b' }}>{formatearUSD(simulacion.totalIntereses)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 700, paddingTop: '0.5rem', borderTop: '1px dashed var(--border-color)' }}>
                  <span>Costo Total del Plan:</span>
                  <span>{formatearUSD(simulacion.enganche + simulacion.pagoTotal)}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1rem' }}
              onClick={() => {
                alert(`Propuesta formal generada: Cuota de ${formatearUSD(simulacion.cuotaMensual)}/mes por ${plazoMeses} meses. El cliente puede pasar a firmar contrato con BMW Financial Services.`);
              }}
            >
              <CreditCard size={16} />
              <span>Emitir Pre-Aprobación BMW Financial</span>
            </button>
          </div>
        </div>
      </div>

      {/* TABLA DE CONTRATOS DE CRÉDITO ACTIVOS */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.8rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Líneas de Crédito &amp; Financiamientos Registrados</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Contratos formales de financiamiento vinculados a operaciones de venta
            </p>
          </div>
          <span className="badge badge-secondary">{financiamientos.length} Contratos Activos</span>
        </div>

        {cargando ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            Cargando registros de crédito...
          </p>
        ) : financiamientos.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            No hay operaciones de crédito registradas todavía.
          </p>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Venta &amp; Vehículo</th>
                  <th>Cliente</th>
                  <th>Entidad Financiera</th>
                  <th style={{ textAlign: 'center' }}>Plazo</th>
                  <th style={{ textAlign: 'center' }}>Tasa Anual</th>
                  <th style={{ textAlign: 'right' }}>Monto Financiado</th>
                  <th style={{ textAlign: 'right' }}>Cuota Mensual</th>
                  <th style={{ textAlign: 'center' }}>Estado</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {financiamientos.map((f) => (
                  <tr key={f.id_financiamiento}>
                    <td>
                      <div>
                        <strong>Venta #{f.id_venta}</strong>
                        {f.vehiculo_version && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {f.modelo_nombre} {f.vehiculo_version}
                          </div>
                        )}
                      </div>
                    </td>

                    <td>
                      <span>{f.cliente_nombre ? `${f.cliente_nombre} ${f.cliente_apellidos || ''}` : 'Cliente VIP'}</span>
                    </td>

                    <td>
                      <span className="badge badge-accent">{f.entidad_financiera}</span>
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <strong>{f.plazo_meses} meses</strong>
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <span>{f.tasa_interes_anual}%</span>
                    </td>

                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      {formatearUSD(f.monto_financiado)}
                    </td>

                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#1c69d4' }}>
                      {formatearUSD(f.cuota_mensual)}
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <span className="badge badge-success">{f.estado}</span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => handleEliminar(f.id_financiamiento)}
                        title="Eliminar registro"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Registrar Contrato de Financiamiento */}
      {modalAbierto && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CreditCard size={20} style={{ color: '#1c69d4' }} />
                <h3>Registrar Contrato de Financiamiento</h3>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setModalAbierto(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCrearFinanciamiento}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label>Operación de Venta Asociada *</label>
                  <select
                    className="form-control"
                    required
                    value={form.id_venta}
                    onChange={(e) => {
                      const vId = e.target.value;
                      const ventaSel = ventas.find((x) => String(x.id_venta) === String(vId));
                      const precio = ventaSel ? Number(ventaSel.precio_venta) : 50000;
                      const financiado = precio * 0.70;
                      const cuota = (financiado * 1.12) / 36;
                      setForm({
                        ...form,
                        id_venta: vId,
                        monto_financiado: financiado.toFixed(2),
                        cuota_mensual: cuota.toFixed(2)
                      });
                    }}
                  >
                    <option value="">-- Seleccionar Venta Concretada --</option>
                    {ventas.map((v) => (
                      <option key={v.id_venta} value={v.id_venta}>
                        Venta #{v.id_venta} - {v.modelo_nombre || 'BMW'} {v.version} ({formatearUSD(v.precio_venta)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Entidad Financiera *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={form.entidad_financiera}
                    onChange={(e) => setForm({ ...form, entidad_financiera: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Plazo (Meses) *</label>
                    <select
                      className="form-control"
                      value={form.plazo_meses}
                      onChange={(e) => setForm({ ...form, plazo_meses: e.target.value })}
                    >
                      <option value="12">12 Meses</option>
                      <option value="24">24 Meses</option>
                      <option value="36">36 Meses</option>
                      <option value="48">48 Meses</option>
                      <option value="60">60 Meses</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Tasa Interés Anual (%) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-control"
                      required
                      value={form.tasa_interes_anual}
                      onChange={(e) => setForm({ ...form, tasa_interes_anual: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Monto Financiado ($ USD) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      className="form-control"
                      required
                      value={form.monto_financiado}
                      onChange={(e) => setForm({ ...form, monto_financiado: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Cuota Mensual ($ USD) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      className="form-control"
                      required
                      value={form.cuota_mensual}
                      onChange={(e) => setForm({ ...form, cuota_mensual: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setModalAbierto(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={guardando}
                >
                  {guardando ? 'Guardando...' : 'Aprobar & Guardar Crédito'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
