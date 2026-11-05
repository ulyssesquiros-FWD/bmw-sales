import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  RefreshCw,
  X,
  LayoutGrid,
  List
} from 'lucide-react';
import AlertBanner from '../components/common/AlertBanner';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import ModeloFormModal from '../components/modelos/ModeloFormModal';
import ModeloDetailModal from '../components/modelos/ModeloDetailModal';
import { BmwMEmblem } from '../components/common/BmwLogos';
import { getModelGalleryByText, isFullMModel } from '../utils/bmwCatalogMedia';
import { modeloService } from '../services/modeloService';
import { extractErrorMessage } from '../services/api';

function ModeloShowroomCard({ modelo, onDetail, onEdit, onDelete }) {
  const isSpecialX5M = modelo.nombre === 'BMW X5 M';
  const views = getModelGalleryByText(
    modelo.nombre,
    isSpecialX5M ? 'E70' : '',
    isSpecialX5M ? 2012 : 2025
  );
  const [idx, setIdx] = useState(0);
  const isM = isFullMModel(modelo.nombre, '');
  const currentView = views[idx] || views[0];

  return (
    <article className={`bmw-vehicle-card ${isSpecialX5M ? 'special-heritage' : ''}`}>
      <div className="bmw-card-media">
        <img src={currentView.url} alt={`${modelo.nombre} — ${currentView.label}`} loading="lazy" />
        <div className="bmw-card-top-badges">
          <div>
            {isSpecialX5M ? (
              <span className="bmw-heritage-tag">Incluye X5 M 2012 (E70)</span>
            ) : (
              <span
                className="mono-code"
                style={{ background: 'rgba(255,255,255,0.92)', fontWeight: 700 }}
              >
                {modelo.total_vehiculos} unidad(es)
              </span>
            )}
          </div>
          {isM && (
            <span className="bmw-m-chip">
              <BmwMEmblem height={13} />
            </span>
          )}
        </div>

        {views.length > 1 && (
          <div className="bmw-card-view-switcher">
            {views.map((vw, i) => (
              <button
                key={vw.id}
                type="button"
                className={`bmw-card-view-btn ${i === idx ? 'active' : ''}`}
                onClick={() => setIdx(i)}
              >
                {i === 0 ? 'Frontal' : vw.id === 'side' ? 'Perfil' : vw.id === 'rear' ? 'Trasera' : 'Interior'}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="bmw-card-body">
        <div>
          <div className="bmw-card-series">{modelo.tipo_carroceria}</div>
          <h3 className="bmw-card-title">{modelo.nombre}</h3>
          <p className="bmw-card-fuel">
            {modelo.combustible} • {modelo.transmision}
          </p>
        </div>

        <div>
          <div className="bmw-card-specs-strip" style={{ marginBottom: '14px' }}>
            <span>Inventario total: {modelo.total_vehiculos}</span>
            <span style={{ color: '#047857', fontWeight: 700 }}>
              {modelo.vehiculos_disponibles} disponible(s)
            </span>
          </div>

          <div className="bmw-card-actions">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => onDetail(modelo.id_modelo)}
            >
              <Eye size={15} />
              <span>Ver Serie & Vistas</span>
            </button>
            <button
              type="button"
              className="icon-btn"
              title="Editar modelo"
              onClick={() => onEdit(modelo)}
            >
              <Pencil size={15} />
            </button>
            <button
              type="button"
              className="icon-btn danger"
              title="Eliminar modelo"
              onClick={() => onDelete(modelo)}
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function Modelos() {
  const [modelos, setModelos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('showroom');
  const [banner, setBanner] = useState({ type: '', message: '' });

  // Estado modal crear/editar
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingModelo, setEditingModelo] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formApiError, setFormApiError] = useState('');

  // Estado modal detalles
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedModelo, setSelectedModelo] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Estado modal confirmación de borrado
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const loadModelos = useCallback(async (query = search) => {
    setLoading(true);
    try {
      const data = await modeloService.getAll(query);
      setModelos(data);
    } catch (err) {
      setBanner({ type: 'error', message: extractErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadModelos(search);
    }, 220);
    return () => clearTimeout(timer);
  }, [search, loadModelos]);

  const handleOpenCreate = () => {
    setEditingModelo(null);
    setFormApiError('');
    setFormModalOpen(true);
  };

  const handleOpenEdit = (modelo) => {
    setEditingModelo(modelo);
    setFormApiError('');
    setFormModalOpen(true);
  };

  const handleOpenDetail = async (id) => {
    setDetailModalOpen(true);
    setDetailLoading(true);
    setSelectedModelo(null);
    try {
      const detail = await modeloService.getById(id);
      setSelectedModelo(detail);
    } catch (err) {
      setDetailModalOpen(false);
      setBanner({ type: 'error', message: extractErrorMessage(err) });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleFormSubmit = async (payload) => {
    setSubmitting(true);
    setFormApiError('');
    try {
      if (editingModelo) {
        const res = await modeloService.update(editingModelo.id_modelo, payload);
        setBanner({ type: 'success', message: res.message || 'Modelo actualizado correctamente.' });
      } else {
        const res = await modeloService.create(payload);
        setBanner({ type: 'success', message: res.message || 'Modelo creado correctamente.' });
      }
      setFormModalOpen(false);
      loadModelos(search);
    } catch (err) {
      setFormApiError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDelete = (modelo) => {
    setDeleteError('');
    setDeleteTarget(modelo);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError('');
    try {
      const res = await modeloService.remove(deleteTarget.id_modelo);
      setBanner({ type: 'success', message: res.message || 'Modelo eliminado correctamente.' });
      setDeleteTarget(null);
      loadModelos(search);
    } catch (err) {
      const msg = extractErrorMessage(err);
      setDeleteError(msg);
      setBanner({ type: 'error', message: msg });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-kicker">
            <span>SERIES Y GAMA OFICIAL</span>
            <BmwMEmblem height={12} />
          </div>
          <h1 className="page-title">Catálogo de Modelos BMW & BMW M</h1>
          <p className="page-description">
            Administre las líneas oficiales BMW, versiones de alto rendimiento M y configuraciones técnicas.
          </p>
        </div>

        <div className="page-actions">
          <div className="view-mode-toggle">
            <button
              type="button"
              className={`view-mode-btn ${viewMode === 'showroom' ? 'active' : ''}`}
              onClick={() => setViewMode('showroom')}
            >
              <LayoutGrid size={14} />
              <span>Galería</span>
            </button>
            <button
              type="button"
              className={`view-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
            >
              <List size={14} />
              <span>Tabla</span>
            </button>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => loadModelos(search)}
            disabled={loading}
          >
            <RefreshCw size={15} />
            <span>Recargar</span>
          </button>
          <button type="button" className="btn btn-primary" onClick={handleOpenCreate}>
            <Plus size={16} />
            <span>Nuevo Modelo</span>
          </button>
        </div>
      </div>

      <AlertBanner
        type={banner.type}
        message={banner.message}
        onClose={() => setBanner({ type: '', message: '' })}
      />

      <div className="card-panel">
        <div className="filters-bar">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Buscar modelo por nombre (ej. X5 M, M3, Serie 3), carrocería o combustible..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {search && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setSearch('')}
            >
              <X size={14} />
              <span>Limpiar</span>
            </button>
          )}
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <span>Cargando catálogo de modelos BMW...</span>
          </div>
        ) : modelos.length === 0 ? (
          <EmptyState
            title="No se encontraron modelos BMW"
            description={
              search
                ? 'No hay coincidencias con la búsqueda aplicada.'
                : 'Comience registrando el primer modelo BMW del concesionario.'
            }
            actionLabel={!search ? 'Crear Modelo BMW' : undefined}
            onAction={!search ? handleOpenCreate : undefined}
          />
        ) : viewMode === 'showroom' ? (
          <div className="bmw-showroom-grid">
            {modelos.map((m) => (
              <ModeloShowroomCard
                key={m.id_modelo}
                modelo={m}
                onDetail={handleOpenDetail}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
              />
            ))}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Modelo</th>
                  <th>Carrocería</th>
                  <th>Combustible</th>
                  <th>Transmisión</th>
                  <th>Unidades</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {modelos.map((m) => {
                  const isM = isFullMModel(m.nombre, '');
                  return (
                    <tr key={m.id_modelo}>
                      <td>
                        <div className="cell-primary">
                          <span>{m.nombre}</span>
                          {isM && <BmwMEmblem height={12} />}
                        </div>
                        {m.descripcion && (
                          <div className="cell-secondary">
                            {m.descripcion.length > 68
                              ? `${m.descripcion.slice(0, 68)}...`
                              : m.descripcion}
                          </div>
                        )}
                      </td>
                      <td>{m.tipo_carroceria}</td>
                      <td>{m.combustible}</td>
                      <td>{m.transmision}</td>
                      <td>
                        <span className="mono-code">
                          {m.total_vehiculos} total ({m.vehiculos_disponibles} disp.)
                        </span>
                      </td>
                      <td>
                        <div className="actions-cell">
                          <button
                            type="button"
                            className="icon-btn"
                            title="Consultar vistas y detalles"
                            onClick={() => handleOpenDetail(m.id_modelo)}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            type="button"
                            className="icon-btn"
                            title="Editar modelo"
                            onClick={() => handleOpenEdit(m)}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            className="icon-btn danger"
                            title="Eliminar modelo"
                            onClick={() => handleOpenDelete(m)}
                          >
                            <Trash2 size={16} />
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

      <ModeloFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingModelo}
        submitting={submitting}
        apiError={formApiError}
      />

      <ModeloDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        modelo={selectedModelo}
        loading={detailLoading}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Modelo BMW"
        description={
          deleteTarget
            ? `¿Está seguro de eliminar el modelo "${deleteTarget.nombre}"? Si existen vehículos vinculados a este modelo, el sistema impedirá la operación para proteger la integridad referencial.`
            : ''
        }
        confirmLabel="Sí, eliminar modelo"
        loading={deleting}
        errorMessage={deleteError}
      />
    </div>
  );
}
