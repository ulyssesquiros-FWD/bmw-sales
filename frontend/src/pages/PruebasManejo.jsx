import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Compass,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  CarFront,
  User,
  Briefcase,
  MessageSquare,
  X,
  Trash2,
  CheckSquare
} from 'lucide-react';
import { modulosService } from '../services/modulosService';
import { vehiculoService } from '../services/vehiculoService';
import { clienteService } from '../services/clienteService';
import { vendedorService } from '../services/vendedorService';
import { BmwMEmblem } from '../components/common/BmwLogos';

export default function PruebasManejo() {
  const [pruebas, setPruebas] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('Todas');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalFeedback, setModalFeedback] = useState(null);
  const [comentariosFeedback, setComentariosFeedback] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState(null);
  const [error, setError] = useState(null);

  // Formulario nueva prueba
  const [form, setForm] = useState({
    id_vehiculo: '',
    id_cliente: '',
    id_vendedor: '',
    fecha_prueba: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    duracion_minutos: 45,
    comentarios: 'Ruta en autopista para prueba de modo Sport Plus y chasis adaptativo.'
  });

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      const [resPru, resVeh, resCli, resVend] = await Promise.all([
        modulosService.getPruebasManejo(),
        vehiculoService.getAll({ limit: 100 }),
        clienteService.getAll({ limit: 100 }),
        vendedorService.getAll()
      ]);

      if (resPru.ok) setPruebas(resPru.data || []);
      if (resVeh.ok) setVehiculos(resVeh.data || []);
      if (resCli.ok) setClientes(resCli.data || []);
      if (resVend.ok) setVendedores(resVend.data || []);
    } catch (err) {
      console.error('Error al cargar pruebas de manejo:', err);
      setError('No fue posible cargar las pruebas de manejo agendadas.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const pruebasFiltradas = useMemo(() => {
    if (filtroEstado === 'Todas') return pruebas;
    return pruebas.filter((p) => p.estado === filtroEstado);
  }, [pruebas, filtroEstado]);

  const stats = useMemo(() => {
    const total = pruebas.length;
    const agendadas = pruebas.filter((p) => p.estado === 'Agendada').length;
    const realizadas = pruebas.filter((p) => p.estado === 'Realizada').length;
    return { total, agendadas, realizadas };
  }, [pruebas]);

  const handleCrearPrueba = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      const payload = {
        id_vehiculo: parseInt(form.id_vehiculo, 10),
        id_cliente: parseInt(form.id_cliente, 10),
        id_vendedor: parseInt(form.id_vendedor, 10),
        fecha_prueba: form.fecha_prueba.replace('T', ' ') + ':00',
        duracion_minutos: parseInt(form.duracion_minutos, 10),
        comentarios: form.comentarios
      };

      const res = await modulosService.createPruebaManejo(payload);
      if (res.ok) {
        setMensajeExito('Prueba de manejo VIP programada exitosamente.');
        setModalAbierto(false);
        setForm({
          id_vehiculo: '',
          id_cliente: '',
          id_vendedor: '',
          fecha_prueba: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
          duracion_minutos: 45,
          comentarios: 'Ruta en autopista para prueba de modo Sport Plus y chasis adaptativo.'
        });
        await cargarDatos();
        setTimeout(() => setMensajeExito(null), 4000);
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Error al agendar la prueba.');
    } finally {
      setGuardando(false);
    }
  };

  const handleCompletarPrueba = async () => {
    if (!modalFeedback) return;
    try {
      const payload = {
        id_vehiculo: modalFeedback.id_vehiculo,
        id_cliente: modalFeedback.id_cliente,
        id_vendedor: modalFeedback.id_vendedor,
        fecha_prueba: typeof modalFeedback.fecha_prueba === 'string' ? modalFeedback.fecha_prueba.slice(0, 19).replace('T', ' ') : modalFeedback.fecha_prueba,
        duracion_minutos: modalFeedback.duracion_minutos,
        estado: 'Realizada',
        comentarios: comentariosFeedback || modalFeedback.comentarios
      };

      await modulosService.updatePruebaManejo(modalFeedback.id_prueba, payload);
      setMensajeExito('Prueba marcada como Realizada con retroalimentación del cliente.');
      setModalFeedback(null);
      await cargarDatos();
      setTimeout(() => setMensajeExito(null), 3500);
    } catch (err) {
      console.error(err);
      setError('Error al actualizar el estado de la prueba.');
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Está seguro de cancelar/eliminar esta prueba de manejo?')) return;
    try {
      await modulosService.deletePruebaManejo(id);
      setMensajeExito('Prueba de manejo cancelada.');
      await cargarDatos();
      setTimeout(() => setMensajeExito(null), 3000);
    } catch (err) {
      console.error(err);
      setError('No fue posible eliminar la prueba.');
    }
  };

  return (
    <div className="pruebas-page">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <span className="badge badge-accent">BMW Driving Experience</span>
            <BmwMEmblem height={12} />
          </div>
          <h1 className="page-title">Centro de Pruebas de Manejo VIP (Test Drives)</h1>
          <p className="page-description">
            Programación de experiencias de manejo dinámico en pista y carretera con acompañamiento de asesores certificados.
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
          <span>Agendar Test Drive</span>
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
            <span className="stat-card-title">Pruebas Agendadas</span>
            <div className="stat-card-icon" style={{ background: 'rgba(28, 105, 212, 0.1)', color: '#1c69d4' }}>
              <Calendar size={20} />
            </div>
          </div>
          <div className="stat-card-value">{stats.agendadas}</div>
          <div className="stat-card-hint">Citas próximas con vehículo reservado</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Pruebas Realizadas</span>
            <div className="stat-card-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="stat-card-value">{stats.realizadas}</div>
          <div className="stat-card-hint">Clientes que experimentaron el placer de conducir</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Flota Demo Asignada</span>
            <div className="stat-card-icon" style={{ background: 'rgba(235, 10, 30, 0.1)', color: '#eb0a1e' }}>
              <CarFront size={20} />
            </div>
          </div>
          <div className="stat-card-value">{vehiculos.length}</div>
          <div className="stat-card-hint">Unidades disponibles para pruebas dinámicas</div>
        </div>
      </div>

      {/* Filtro por estado */}
      <div className="card" style={{ padding: '0.75rem 1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['Todas', 'Agendada', 'Realizada', 'Cancelada'].map((st) => (
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

      {/* Tabla de Pruebas de Manejo */}
      <div className="card" style={{ padding: '1.5rem' }}>
        {cargando ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            Cargando programación de test drives...
          </p>
        ) : pruebasFiltradas.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            No hay pruebas registradas bajo este filtro.
          </p>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vehículo de Demostración</th>
                  <th>Cliente VIP</th>
                  <th>Asesor Acompañante</th>
                  <th>Fecha &amp; Hora</th>
                  <th style={{ textAlign: 'center' }}>Duración</th>
                  <th style={{ textAlign: 'center' }}>Estado</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pruebasFiltradas.map((p) => {
                  const esRealizada = p.estado === 'Realizada';
                  return (
                    <tr key={p.id_prueba}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <CarFront size={16} style={{ color: '#1c69d4' }} />
                          <div>
                            <strong>{p.modelo_nombre || 'BMW'} {p.vehiculo_version || ''}</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              VIN: {p.vin || 'N/D'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <User size={15} style={{ color: 'var(--text-secondary)' }} />
                          <span>{p.cliente_nombre ? `${p.cliente_nombre} ${p.cliente_apellidos || ''}` : `Cliente #${p.id_cliente}`}</span>
                        </div>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Briefcase size={14} style={{ color: 'var(--text-secondary)' }} />
                          <span>{p.vendedor_nombre ? `${p.vendedor_nombre} ${p.vendedor_apellidos || ''}` : `Asesor #${p.id_vendedor}`}</span>
                        </div>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                          <Calendar size={14} style={{ color: 'var(--text-secondary)' }} />
                          <span>{new Date(p.fecha_prueba).toLocaleString()}</span>
                        </div>
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <span className="badge badge-secondary">{p.duracion_minutos} min</span>
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${esRealizada ? 'badge-success' : 'badge-primary'}`}>
                          {p.estado}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                          {!esRealizada && (
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => {
                                setModalFeedback(p);
                                setComentariosFeedback(p.comentarios || '');
                              }}
                              title="Registrar Conclusión & Retroalimentación"
                            >
                              <CheckSquare size={13} />
                              <span>Completar</span>
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => handleEliminar(p.id_prueba)}
                            title="Cancelar prueba"
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

      {/* Modal: Retroalimentación de Prueba Realizada */}
      {modalFeedback && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={20} style={{ color: '#10b981' }} />
                <h3>Finalizar Prueba de Manejo</h3>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setModalFeedback(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Ingrese las impresiones del cliente y nivel de interés comercial para avanzar con la propuesta de venta:
              </p>

              <div className="form-group">
                <label>Comentarios &amp; Retroalimentación del Cliente *</label>
                <textarea
                  className="form-control"
                  rows="4"
                  required
                  placeholder="Ej. El cliente quedó sumamente impresionado con la aceleración en modo Sport Plus y solicitó cotización formal con enganche del 30%..."
                  value={comentariosFeedback}
                  onChange={(e) => setComentariosFeedback(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setModalFeedback(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleCompletarPrueba}
              >
                Guardar Conclusión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Agendar Nueva Prueba */}
      {modalAbierto && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Compass size={20} style={{ color: '#1c69d4' }} />
                <h3>Agendar Prueba de Manejo VIP</h3>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setModalAbierto(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCrearPrueba}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label>Vehículo BMW para la Prueba *</label>
                  <select
                    className="form-control"
                    required
                    value={form.id_vehiculo}
                    onChange={(e) => setForm({ ...form, id_vehiculo: e.target.value })}
                  >
                    <option value="">-- Seleccionar vehículo del inventario --</option>
                    {vehiculos.map((v) => (
                      <option key={v.id_vehiculo} value={v.id_vehiculo}>
                        {v.modelo_nombre || 'BMW'} {v.version} ({v.anio}) - {v.color}
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
                        {c.nombre} {c.apellidos} - {c.telefono}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Asesor Comercial Acompañante *</label>
                  <select
                    className="form-control"
                    required
                    value={form.id_vendedor}
                    onChange={(e) => setForm({ ...form, id_vendedor: e.target.value })}
                  >
                    <option value="">-- Seleccionar asesor certificado BMW --</option>
                    {vendedores.map((v) => (
                      <option key={v.id_vendedor} value={v.id_vendedor}>
                        {v.nombre} {v.apellidos} ({v.correo})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Fecha &amp; Hora *</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      required
                      value={form.fecha_prueba}
                      onChange={(e) => setForm({ ...form, fecha_prueba: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Duración Estimada (Minutos) *</label>
                    <select
                      className="form-control"
                      value={form.duracion_minutos}
                      onChange={(e) => setForm({ ...form, duracion_minutos: e.target.value })}
                    >
                      <option value="30">30 minutos (Circuito Corto)</option>
                      <option value="45">45 minutos (Mixto Urbano)</option>
                      <option value="60">60 minutos (Autopista & Dinámico)</option>
                      <option value="90">90 minutos (Experiencia M Completa)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Ruta Planificada &amp; Observaciones</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={form.comentarios}
                    onChange={(e) => setForm({ ...form, comentarios: e.target.value })}
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
                  {guardando ? 'Guardando...' : 'Confirmar Test Drive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

