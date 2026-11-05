import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Sparkles,
  Plus,
  Search,
  Package,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Tag,
  DollarSign,
  Wrench,
  X,
  Trash2,
  Edit2
} from 'lucide-react';
import { modulosService } from '../services/modulosService';
import { BmwMEmblem } from '../components/common/BmwLogos';

export default function AccesoriosM() {
  const [accesorios, setAccesorios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalCotizar, setModalCotizar] = useState(null);
  const [incluirInstalacion, setIncluirInstalacion] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState(null);
  const [error, setError] = useState(null);

  // Formulario nuevo accesorio
  const [form, setForm] = useState({
    nombre: '',
    categoria: 'Aerodinámica M',
    codigo_parte: '',
    precio: '',
    stock: 5,
    descripcion: ''
  });

  const cargarAccesorios = useCallback(async () => {
    setCargando(true);
    try {
      const res = await modulosService.getAccesorios();
      if (res.ok) {
        setAccesorios(res.data || []);
      }
    } catch (err) {
      console.error('Error al cargar accesorios:', err);
      setError('No fue posible cargar el catálogo de accesorios.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarAccesorios();
  }, [cargarAccesorios]);

  // Categorías únicas
  const categorias = useMemo(() => {
    const cats = new Set(accesorios.map((a) => a.categoria).filter(Boolean));
    return ['Todas', ...Array.from(cats)];
  }, [accesorios]);

  // Filtrado
  const accesoriosFiltrados = useMemo(() => {
    return accesorios.filter((a) => {
      const coincideCat = categoriaFiltro === 'Todas' || a.categoria === categoriaFiltro;
      const q = busqueda.toLowerCase().trim();
      const coincideBusqueda =
        !q ||
        a.nombre.toLowerCase().includes(q) ||
        a.codigo_parte.toLowerCase().includes(q) ||
        (a.descripcion && a.descripcion.toLowerCase().includes(q));
      return coincideCat && coincideBusqueda;
    });
  }, [accesorios, categoriaFiltro, busqueda]);

  const formatearUSD = (val) => {
    const n = Number(val) || 0;
    return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleCrearAccesorio = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      const payload = {
        ...form,
        precio: parseFloat(form.precio),
        stock: parseInt(form.stock, 10)
      };
      const res = await modulosService.createAccesorio(payload);
      if (res.ok) {
        setMensajeExito('Accesorio BMW M Performance agregado exitosamente.');
        setModalAbierto(false);
        setForm({
          nombre: '',
          categoria: 'Aerodinámica M',
          codigo_parte: '',
          precio: '',
          stock: 5,
          descripcion: ''
        });
        await cargarAccesorios();
        setTimeout(() => setMensajeExito(null), 4000);
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Error al guardar la pieza M.');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id, nombre) => {
    if (!window.confirm(`¿Está seguro de eliminar "${nombre}" del catálogo oficial?`)) return;
    try {
      await modulosService.deleteAccesorio(id);
      setMensajeExito(`Pieza "${nombre}" eliminada correctamente.`);
      await cargarAccesorios();
      setTimeout(() => setMensajeExito(null), 3500);
    } catch (err) {
      console.error(err);
      setError('No fue posible eliminar el accesorio.');
    }
  };

  return (
    <div className="accesorios-page">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <span className="badge badge-accent">Original BMW Accessories</span>
            <BmwMEmblem height={13} />
          </div>
          <h1 className="page-title">Catálogo Oficial BMW M Performance</h1>
          <p className="page-description">
            Partes de fibra de carbono, escapes de titanio, rines forjados y accesorios certificados con homologación de fábrica.
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
          <span>Nueva Pieza M</span>
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
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Barra de Filtros y Búsqueda */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Búsqueda */}
          <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '400px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '36px' }}
              placeholder="Buscar por nombre o código BMW OEM..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          {/* Categoría Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {categorias.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`badge ${categoriaFiltro === cat ? 'badge-primary' : 'badge-secondary'}`}
                style={{ cursor: 'pointer', padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
                onClick={() => setCategoriaFiltro(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid de Piezas M */}
      {cargando ? (
        <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          Cargando catálogo M Performance...
        </p>
      ) : accesoriosFiltrados.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <Package size={40} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3>No se encontraron componentes</h3>
          <p>Intente modificando los filtros de categoría o el término de búsqueda.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {accesoriosFiltrados.map((item) => {
            const stock = item.stock ?? 0;
            const esBajo = stock > 0 && stock <= 3;
            const agotado = stock === 0;

            return (
              <div
                key={item.id_accesorio}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '1.25rem',
                  borderTop: '3px solid #1c69d4',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span className="badge badge-accent" style={{ fontSize: '0.75rem' }}>
                    {item.categoria}
                  </span>
                  
                  {agotado ? (
                    <span className="badge badge-error" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <XCircle size={12} /> Agotado
                    </span>
                  ) : esBajo ? (
                    <span className="badge badge-warning" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <AlertTriangle size={12} /> Stock Crítico ({stock})
                    </span>
                  ) : (
                    <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <CheckCircle2 size={12} /> En Stock ({stock})
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.4rem', lineHeight: '1.3' }}>
                  {item.nombre}
                </h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  <Tag size={13} />
                  <span>Código OEM: <strong>{item.codigo_parte}</strong></span>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', flex: '1', margin: '0 0 1rem', lineHeight: '1.4' }}>
                  {item.descripcion || 'Accesorio genuino BMW M Performance con certificación y garantía oficial.'}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.85rem', borderTop: '1px solid var(--border-color)' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Precio Oficial</span>
                    <strong style={{ fontSize: '1.3rem', color: 'var(--text-primary)' }}>
                      {formatearUSD(item.precio)}
                    </strong>
                  </div>

                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setModalCotizar(item)}
                      title="Calcular cotización formal con instalación"
                    >
                      <Wrench size={14} />
                      <span>Cotizar</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => handleEliminar(item.id_accesorio, item.nombre)}
                      title="Eliminar de catálogo"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Cotizar Instalación Certificada */}
      {modalCotizar && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Wrench size={20} style={{ color: '#1c69d4' }} />
                <h3>Cotización Taller M Performance</h3>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setModalCotizar(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', marginBottom: '1.25rem' }}>
                <strong style={{ display: 'block', fontSize: '1.05rem', marginBottom: '0.25rem' }}>
                  {modalCotizar.nombre}
                </strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Código BMW: {modalCotizar.codigo_parte} • Categoría: {modalCotizar.categoria}
                </span>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={incluirInstalacion}
                    onChange={(e) => setIncluirInstalacion(e.target.checked)}
                  />
                  <span>Incluir Mano de Obra Certificada en Taller BMW (+ $280 USD)</span>
                </label>
              </div>

              {/* Resumen numérico */}
              {(() => {
                const precioBase = Number(modalCotizar.precio) || 0;
                const manoObra = incluirInstalacion ? 280 : 0;
                const subtotal = precioBase + manoObra;
                const iva = subtotal * 0.16;
                const total = subtotal + iva;

                return (
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
                      <span>Pieza M Performance:</span>
                      <span>{formatearUSD(precioBase)}</span>
                    </div>
                    {incluirInstalacion && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem', color: '#1c69d4' }}>
                        <span>Montaje certificado en bahía:</span>
                        <span>$280.00</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      <span>Impuestos (IVA 16%):</span>
                      <span>{formatearUSD(iva)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed var(--border-color)', fontSize: '1.2rem', fontWeight: 700 }}>
                      <span>Presupuesto Estimado:</span>
                      <span style={{ color: '#1c69d4' }}>{formatearUSD(total)}</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setModalCotizar(null)}
              >
                Cerrar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  alert(`Cotización oficial generada para ${modalCotizar.nombre}. Un asesor se pondrá en contacto para programar cita de taller.`);
                  setModalCotizar(null);
                }}
              >
                Confirmar Orden de Servicio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Registrar Nueva Pieza */}
      {modalAbierto && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={20} style={{ color: '#1c69d4' }} />
                <h3>Registrar Pieza M Performance</h3>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setModalAbierto(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCrearAccesorio}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label>Nombre del Accesorio / Pieza *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    placeholder="Ej. Spoiler Trasero en Fibra de Carbono M3 G80"
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Categoría *</label>
                    <select
                      className="form-control"
                      value={form.categoria}
                      onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                    >
                      <option value="Aerodinámica M">Aerodinámica M</option>
                      <option value="Escape y Motor">Escape y Motor</option>
                      <option value="Rines y Neumáticos">Rines y Neumáticos</option>
                      <option value="Interior">Interior</option>
                      <option value="Frenos y Rendimiento">Frenos y Rendimiento</option>
                      <option value="Exterior y Estilo">Exterior y Estilo</option>
                      <option value="BMW i Eléctricos">BMW i Eléctricos</option>
                      <option value="Audio y Tecnología">Audio y Tecnología</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Código de Parte BMW OEM *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="Ej. BMW-MP-5119245"
                      value={form.codigo_parte}
                      onChange={(e) => setForm({ ...form, codigo_parte: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Precio de Venta ($ USD) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-control"
                      required
                      placeholder="1850.00"
                      value={form.precio}
                      onChange={(e) => setForm({ ...form, precio: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Unidades en Stock *</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      required
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Descripción Técnica</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Detalles sobre materiales, compatibilidad de chasis y homologación..."
                    value={form.descripcion}
                    onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
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
                  {guardando ? 'Guardando...' : 'Guardar Pieza M'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

