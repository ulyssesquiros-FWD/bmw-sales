import { useEffect, useState, useCallback } from 'react';
import {
  MapPin,
  Building2,
  Phone,
  CarFront,
  Plus,
  CheckCircle2,
  AlertCircle,
  X,
  Trash2,
  ShieldCheck,
  Zap,
  Sparkles
} from 'lucide-react';
import { modulosService } from '../services/modulosService';
import { BmwRoundel, BmwMEmblem } from '../components/common/BmwLogos';

export default function SucursalesRed() {
  const [sucursales, setSucursales] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState(null);
  const [error, setError] = useState(null);

  // Formulario nueva sucursal
  const [form, setForm] = useState({
    nombre: '',
    ciudad: 'Ciudad de México',
    direccion: '',
    telefono: '',
    capacidad_vehiculos: 50
  });

  const cargarSucursales = useCallback(async () => {
    setCargando(true);
    try {
      const res = await modulosService.getSucursales();
      if (res.ok) {
        setSucursales(res.data || []);
      }
    } catch (err) {
      console.error('Error al cargar sucursales:', err);
      setError('No fue posible cargar la red de concesionarios.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarSucursales();
  }, [cargarSucursales]);

  const handleCrearSucursal = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      const payload = {
        ...form,
        capacidad_vehiculos: parseInt(form.capacidad_vehiculos, 10)
      };

      const res = await modulosService.createSucursal(payload);
      if (res.ok) {
        setMensajeExito('Concesionario oficial BMW incorporado a la red con éxito.');
        setModalAbierto(false);
        setForm({
          nombre: '',
          ciudad: 'Ciudad de México',
          direccion: '',
          telefono: '',
          capacidad_vehiculos: 50
        });
        await cargarSucursales();
        setTimeout(() => setMensajeExito(null), 4000);
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Error al guardar el concesionario.');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id, nombre) => {
    if (!window.confirm(`¿Está seguro de remover la sucursal "${nombre}" de la red oficial?`)) return;
    try {
      await modulosService.deleteSucursal(id);
      setMensajeExito(`Sucursal "${nombre}" eliminada correctamente.`);
      await cargarSucursales();
      setTimeout(() => setMensajeExito(null), 3000);
    } catch (err) {
      console.error(err);
      setError('No fue posible eliminar la sucursal.');
    }
  };

  return (
    <div className="sucursales-page">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <span className="badge badge-accent">Red Oficial de Distribuidores</span>
            <BmwMEmblem height={12} />
          </div>
          <h1 className="page-title">Directorio de Concesionarios BMW Premium Motors</h1>
          <p className="page-description">
            Showrooms insignia, centros de entrega M Performance, estaciones de carga rápida BMW i y talleres mecánicos certificados.
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
          <span>Nueva Sucursal</span>
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

      {/* Grid de Concesionarios */}
      {cargando ? (
        <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          Cargando red de concesionarios oficiales...
        </p>
      ) : sucursales.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <Building2 size={40} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3>No hay sucursales registradas</h3>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {sucursales.map((s) => (
            <div
              key={s.id_sucursal}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '1.5rem',
                borderTop: '4px solid #1c69d4',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <span className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <MapPin size={12} />
                  {s.ciudad}
                </span>

                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => handleEliminar(s.id_sucursal, s.nombre)}
                  title="Eliminar sucursal"
                  style={{ padding: '0.25rem 0.5rem' }}
                >
                  <Trash2 size={13} />
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <BmwRoundel size={32} variant="classic" />
                <h3 style={{ margin: 0, fontSize: '1.2rem', lineHeight: '1.3' }}>
                  {s.nombre}
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <MapPin size={15} style={{ flexShrink: 0, marginTop: '2px', color: '#1c69d4' }} />
                  <span>{s.direccion}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Phone size={15} style={{ flexShrink: 0, color: '#10b981' }} />
                  <strong>{s.telefono}</strong>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CarFront size={15} style={{ flexShrink: 0, color: '#f59e0b' }} />
                  <span>Capacidad en Showroom: <strong>{s.capacidad_vehiculos} unidades</strong></span>
                </div>
              </div>

              {/* Badges de Certificaciones */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <span className="badge badge-secondary" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <ShieldCheck size={12} style={{ color: '#10b981' }} /> Taller M Certified
                </span>
                <span className="badge badge-secondary" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Zap size={12} style={{ color: '#1c69d4' }} /> Carga BMW i
                </span>
                <span className="badge badge-secondary" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Sparkles size={12} style={{ color: '#f59e0b' }} /> Entrega VIP
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Registrar Nueva Sucursal */}
      {modalAbierto && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: '560px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building2 size={20} style={{ color: '#1c69d4' }} />
                <h3>Registrar Concesionario Oficial BMW</h3>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setModalAbierto(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCrearSucursal}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label>Nombre del Concesionario / Showroom *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    placeholder="Ej. BMW Múnich Flagship Polanco"
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Ciudad *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="Ej. Monterrey"
                      value={form.ciudad}
                      onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Teléfono de Contacto VIP *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="+52 55 5280 1234"
                      value={form.telefono}
                      onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Dirección Completa *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    placeholder="Calle, número, colonia, código postal"
                    value={form.direccion}
                    onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Capacidad Máxima de Vehículos en Showroom *</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    required
                    value={form.capacidad_vehiculos}
                    onChange={(e) => setForm({ ...form, capacidad_vehiculos: e.target.value })}
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
                  {guardando ? 'Guardando...' : 'Guardar Sucursal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

