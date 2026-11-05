import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Eye, Pencil, Trash2, RefreshCw, X } from 'lucide-react';
import AlertBanner from '../components/common/AlertBanner';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import VendedorFormModal from '../components/vendedores/VendedorFormModal';
import VendedorDetailModal from '../components/vendedores/VendedorDetailModal';
import { vendedorService } from '../services/vendedorService';
import { extractErrorMessage } from '../services/api';
import { formatUSD, formatDate } from '../utils/formatters';

export default function Vendedores() {
  const [vendedores, setVendedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [banner, setBanner] = useState({ type: '', message: '' });

  // Crear / Editar
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingVendedor, setEditingVendedor] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formApiError, setFormApiError] = useState('');

  // Detalles
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedVendedor, setSelectedVendedor] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Eliminar
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const loadVendedores = useCallback(async (query = search) => {
    setLoading(true);
    try {
      const data = await vendedorService.getAll(query);
      setVendedores(data);
    } catch (err) {
      setBanner({ type: 'error', message: extractErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadVendedores(search);
    }, 220);
    return () => clearTimeout(timer);
  }, [search, loadVendedores]);

  const handleOpenCreate = () => {
    setEditingVendedor(null);
    setFormApiError('');
    setFormModalOpen(true);
  };

  const handleOpenEdit = (vend) => {
    setEditingVendedor(vend);
    setFormApiError('');
    setFormModalOpen(true);
  };

  const handleOpenDetail = async (id) => {
    setDetailModalOpen(true);
    setDetailLoading(true);
    setSelectedVendedor(null);
    try {
      const detail = await vendedorService.getById(id);
      setSelectedVendedor(detail);
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
      if (editingVendedor) {
        const res = await vendedorService.update(editingVendedor.id_vendedor, payload);
        setBanner({ type: 'success', message: res.message || 'Vendedor actualizado exitosamente.' });
      } else {
        const res = await vendedorService.create(payload);
        setBanner({ type: 'success', message: res.message || 'Vendedor creado exitosamente.' });
      }
      setFormModalOpen(false);
      loadVendedores(search);
    } catch (err) {
      setFormApiError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError('');
    try {
      const res = await vendedorService.remove(deleteTarget.id_vendedor);
      setBanner({ type: 'success', message: res.message || 'Vendedor eliminado correctamente.' });
      setDeleteTarget(null);
      loadVendedores(search);
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
          <h1 className="page-title">Equipo de Vendedores</h1>
          <p className="page-description">
            Administración de asesores comerciales, fechas de contratación y desempeño en ventas.
          </p>
        </div>

        <div className="page-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => loadVendedores(search)}
            disabled={loading}
          >
            <RefreshCw size={16} />
            <span>Recargar</span>
          </button>
          <button type="button" className="btn btn-primary" onClick={handleOpenCreate}>
            <Plus size={16} />
            <span>Nuevo Vendedor</span>
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
              placeholder="Buscar vendedor por nombre o correo electrónico..."
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
            <span>Cargando equipo de asesores comerciales...</span>
          </div>
        ) : vendedores.length === 0 ? (
          <EmptyState
            title="No se encontraron vendedores"
            description={
              search
                ? 'Ningún asesor coincide con el criterio de búsqueda.'
                : 'Registre el primer asesor comercial del concesionario.'
            }
            actionLabel={!search ? 'Registrar Vendedor' : undefined}
            onAction={!search ? handleOpenCreate : undefined}
          />
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Asesor Comercial</th>
                  <th>Teléfono</th>
                  <th>Correo</th>
                  <th>Contratación</th>
                  <th>Ventas / Facturación</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {vendedores.map((vd) => (
                  <tr key={vd.id_vendedor}>
                    <td className="cell-primary">
                      {vd.nombre} {vd.apellidos}
                    </td>
                    <td>{vd.telefono}</td>
                    <td>{vd.correo}</td>
                    <td>{formatDate(vd.fecha_contratacion)}</td>
                    <td>
                      <div className="cell-primary">{vd.total_ventas} venta(s)</div>
                      <div className="cell-secondary">{formatUSD(vd.ingresos_generados)}</div>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button
                          type="button"
                          className="icon-btn"
                          title="Ver detalles"
                          onClick={() => handleOpenDetail(vd.id_vendedor)}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          className="icon-btn"
                          title="Editar vendedor"
                          onClick={() => handleOpenEdit(vd)}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          className="icon-btn danger"
                          title="Eliminar vendedor"
                          onClick={() => {
                            setDeleteError('');
                            setDeleteTarget(vd);
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <VendedorFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingVendedor}
        submitting={submitting}
        apiError={formApiError}
      />

      <VendedorDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        vendedor={selectedVendedor}
        loading={detailLoading}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Vendedor"
        description={
          deleteTarget
            ? `¿Confirma eliminar al asesor "${deleteTarget.nombre} ${deleteTarget.apellidos}"? No se permitirá eliminar vendedores asociados a ventas registradas.`
            : ''
        }
        confirmLabel="Sí, eliminar vendedor"
        loading={deleting}
        errorMessage={deleteError}
      />
    </div>
  );
}

