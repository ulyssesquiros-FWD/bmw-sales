import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Wrench,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  CarFront,
  User,
  DollarSign,
  FileText,
  X,
  Trash2,
  ArrowRight,
  Filter
} from 'lucide-react';
import { modulosService } from '../services/modulosService';
import { vehiculoService } from '../services/vehiculoService';
import { clienteService } from '../services/clienteService';
import { BmwMEmblem } from '../components/common/BmwLogos';

export default function TallerMantenimiento() {
  const [mantenimientos, setMantenimientos] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState(null);
  const [error, setError] = useState(null);

  // Formulario nueva cita
  const [form, setForm] = useState({
    id_vehiculo: '',
    id_cliente: '',
    tipo_servicio: 'Inspección Periódica BMW Service Inclusive',
    costo: '650.00',
    fecha_servicio: new Date().toISOString().slice(0, 10),
    notas: ''
  });

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      const [resMant, resVeh, resCli] = await Promise.all([
        modulosService.getMantenimientos(),
        vehiculoService.getAll({ limit: 100 }),
        clienteService.getAll({ limit: 100 })
      ]);

      if (resMant.ok) setMantenimientos(resMant.data || []);
      if (resVeh.ok) setVehiculos(resVeh.data || []);
      if (resCli.ok) setClientes(resCli.data || []);
    } catch (err) {
      console.error('Error al cargar datos del taller:', err);
      setError('No fue posible cargar la información de taller y citas de servicio.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const formatearUSD = (val) => {
    const n = Number(val) || 0;
    return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const mantenimientosFiltrados = useMemo(() => {
    if (filtroEstado === 'Todos') return mantenimientos;
    return mantenimientos.filter((m) => m.estado === filtroEstado);
  }, [mantenimientos, filtroEstado]);

  // Contadores KPI
  const stats = useMemo(() => {
    const total = mantenimientos.length;
    const programados = mantenimientos.filter((m) => m.estado === 'Programado').length;
    const enProceso = mantenimientos.filter((m) => m.estado === 'En Proceso').length;
    const finalizados = mantenimientos.filter((m) => m.estado === 'Finalizado').length;
    const facturacionTotal = mantenimientos.reduce((acc, m) => acc + (Number(m.costo) || 0), 0);
    return { total, programados, enProceso, finalizados, facturacionTotal };
  }, [mantenimientos]);

  const handleCrearCita = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      const payload = {
        id_vehiculo: parseInt(form.id_vehiculo, 10),
        id_cliente: parseInt(form.id_cliente, 10),
        tipo_servicio: form.tipo_servicio,
        costo: parseFloat(form.costo),
        fecha_servicio: form.fecha_servicio,
        notas: form.notas
      };

      const res = await modulosService.createMantenimiento(payload);
      if (res.ok) {
        setMensajeExito('Cita de servicio BMW agendada con éxito.');
        setModalAbierto(false);
        setForm({
          id_vehiculo: '',
          id_cliente: '',
          tipo_servicio: 'Inspección Periódica BMW Service Inclusive',
          costo: '650.00',
          fecha_servicio: new Date().toISOString().slice(0, 10),
          notas: ''
        });
        await cargarDatos();
        setTimeout(() => setMensajeExito(null), 4000);
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Error al programar la cita de servicio.');
    } finally {
      setGuardando(false);
    }
  };

  const handleAvanzarEstado = async (item) => {
    let nuevoEstado = 'En Proceso';
    if (item.estado === 'Programado') nuevoEstado = 'En Proceso';
    else if (item.estado === 'En Proceso') nuevoEstado = 'Finalizado';
    else return;

    try {
      const payload = {
        id_vehiculo: item.id_vehiculo,
        id_cliente: item.id_cliente,
        tipo_servicio: item.tipo_servicio,
        costo: item.costo,
        fecha_servicio: typeof item.fecha_servicio === 'string' ? item.fecha_servicio.slice(0, 10) : item.fecha_servicio,
        estado: nuevoEstado,
        notas: item.notas
      };
      await modulosService.updateMantenimiento(item.id_mantenimiento, payload);
      setMensajeExito(`Servicio actualizado a "${nuevoEstado}".`);
      await cargarDatos();
      setTimeout(() => setMensajeExito(null), 3000);
    } catch (err) {
      console.error(err);
      setError('Error al actualizar el estado de la orden.');
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar esta orden de servicio?')) return;
    try {
      await modulosService.deleteMantenimiento(id);
      setMensajeExito('Orden de servicio eliminada.');
      await cargarDatos();
      setTimeout(() => setMensajeExito(null), 3000);
    } catch (err) {
      console.error(err);
      setError('No fue posible eliminar la orden.');
    }
  };

  return (
    <div className="taller-page">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <span className="badge badge-accent">BMW Service &amp; Diagnostics</span>
            <BmwMEmblem height={12} />
          </div>
          <h1 className="page-title">Centro de Taller, Bahías &amp; Mantenimiento</h1>
          <p className="page-description">
            Control de órdenes de servicio computarizadas ISTA+, mantenimiento preventivo, paquetes Service Inclusive y garantías M.
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
          <span>Nueva Cita de Taller</span>
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

      {/* KPI Cards */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">En Bahía Mecánica</span>
            <div className="stat-card-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
              <Wrench size={20} />
            </div>
          </div>
          <div className="stat-card-value">{stats.enProceso}</div>
          <div className="stat-card-hint">Vehículos actualmente en elevador y diagnóstico</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Citas Programadas</span>
            <div className="stat-card-icon" style={{ background: 'rgba(28, 105, 212, 0.1)', color: '#1c69d4' }}>
              <Clock size={20} />
            </div>
          </div>
          <div className="stat-card-value">{stats.programados}</div>
          <div className="stat-card-hint">Próximos ingresos al taller oficial</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Servicios Concluidos</span>
            <div className="stat-card-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="stat-card-value">{stats.finalizados}</div>
          <div className="stat-card-hint">Inspecciones con control de calidad superado</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Facturación Servicios</span>
            <div className="stat-card-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div className="stat-card-value">{formatearUSD(stats.facturacionTotal)}</div>
          <div className="stat-card-hint">Volumen acumulado en intervenciones de taller</div>
        </div>
      </div>

      {/* Tabs de Filtro de Estado */}
      <div className="card" style={{ padding: '0.75rem 1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} style={{ color: 'var(--text-secondary)' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Filtrar Estado:</span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['Todos', 'Programado', 'En Proceso', 'Finalizado'].map((st) => (
              <button
                key={st}
                type="button"
                className={`btn btn-sm ${filtroEstado === st ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFiltroEstado(st)}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabla / Lista de Órdenes */}
      <div className="card" style={{ padding: '1.5rem' }}>
        {cargando ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            Cargando órdenes de trabajo...
          </p>
        ) : mantenimientosFiltrados.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            No hay órdenes registradas con el estado seleccionado.
          </p>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vehículo &amp; VIN</th>
                  <th>Cliente</th>
                  <th>Tipo de Intervención</th>
                  <th>Fecha</th>
                  <th style={{ textAlign: 'right' }}>Costo USD</th>
                  <th style={{ textAlign: 'center' }}>Estado</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {mantenimientosFiltrados.map((m) => {
                  const estadoBadge =
                    m.estado === 'Finalizado'
                      ? 'badge-success'
                      : m.estado === 'En Proceso'
                      ? 'badge-warning'
                      : 'badge-primary';

                  return (
                    <tr key={m.id_mantenimiento}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <CarFront size={16} style={{ color: '#1c69d4' }} />
                          <div>
                            <strong>{m.modelo_nombre || 'BMW'} {m.vehiculo_version || ''}</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              VIN: {m.vin || 'N/D'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <User size={15} style={{ color: 'var(--text-secondary)' }} />
                          <div>
                            <span>{m.cliente_nombre ? `${m.cliente_nombre} ${m.cliente_apellidos || ''}` : `Cliente #${m.id_cliente}`}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div>
                          <strong>{m.tipo_servicio}</strong>
                          {m.notas && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {m.notas}
                            </div>
                          )}
                        </div>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                          <Calendar size={14} style={{ color: 'var(--text-secondary)' }} />
                          <span>
                            {m.fecha_servicio ? new Date(m.fecha_servicio).toLocaleDateString() : 'Pendiente'}
                          </span>
                        </div>
                      </td>

                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {formatearUSD(m.costo)}
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${estadoBadge}`}>
                          {m.estado}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                          {m.estado !== 'Finalizado' && (
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleAvanzarEstado(m)}
                              title={m.estado === 'Programado' ? 'Ingresar a Bahía Mecánica' : 'Finalizar Servicio'}
                            >
                              <span>{m.estado === 'Programado' ? 'A Bahía' : 'Finalizar'}</span>
                              <ArrowRight size={13} />
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => handleEliminar(m.id_mantenimiento)}
                            title="Eliminar registro"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Agendar Nueva Cita de Taller */}
      {modalAbierto && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Wrench size={20} style={{ color: '#1c69d4' }} />
                <h3>Agendar Cita BMW Service</h3>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setModalAbierto(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCrearCita}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label>Vehículo BMW *</label>
                  <select
                    className="form-control"
                    required
                    value={form.id_vehiculo}
                    onChange={(e) => setForm({ ...form, id_vehiculo: e.target.value })}
                  >
                    <option value="">-- Seleccionar vehículo de la flota --</option>
                    {vehiculos.map((v) => (
                      <option key={v.id_vehiculo} value={v.id_vehiculo}>
                        {v.modelo_nombre || 'BMW'} {v.version} ({v.anio}) - VIN: {v.vin}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Cliente Titular *</label>
                  <select
                    className="form-control"
                    required
                    value={form.id_cliente}
                    onChange={(e) => setForm({ ...form, id_cliente: e.target.value })}
                  >
                    <option value="">-- Seleccionar cliente registrado --</option>
                    {clientes.map((c) => (
                      <option key={c.id_cliente} value={c.id_cliente}>
                        {c.nombre} {c.apellidos} - {c.correo}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Tipo de Intervención / Paquete *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    placeholder="Ej. Cambio de Aceite TwinPower Turbo & Filtros M"
                    value={form.tipo_servicio}
                    onChange={(e) => setForm({ ...form, tipo_servicio: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Costo Estimado ($ USD) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-control"
                      required
                      value={form.costo}
                      onChange={(e) => setForm({ ...form, costo: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Fecha de Ingreso *</label>
                    <input
                      type="date"
                      className="form-control"
                      required
                      value={form.fecha_servicio}
                      onChange={(e) => setForm({ ...form, fecha_servicio: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Notas de Taller / Síntomas reportados</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Diagnóstico inicial, solicitud de revisión de frenos o actualización ISTA..."
                    value={form.notas}
                    onChange={(e) => setForm({ ...form, notas: e.target.value })}
                  />
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
                  {guardando ? 'Guardando...' : 'Confirmar Cita de Taller'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
