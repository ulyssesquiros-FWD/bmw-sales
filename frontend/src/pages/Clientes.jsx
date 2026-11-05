import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Eye, Pencil, Trash2, RefreshCw, X } from 'lucide-react';
import AlertBanner from '../components/common/AlertBanner';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import ClienteFormModal from '../components/clientes/ClienteFormModal';
import ClienteDetailModal from '../components/clientes/ClienteDetailModal';
import { clienteService } from '../services/clienteService';
import { extractErrorMessage } from '../services/api';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [banner, setBanner] = useState({ type: '', message: '' });

  // Crear / Editar
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formApiError, setFormApiError] = useState('');

  // Detalles
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Eliminar
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const loadClientes = useCallback(async (query = search) => {
    setLoading(true);
    try {
      const data = await clienteService.getAll(query);
      setClientes(data);
    } catch (err) {
      setBanner({ type: 'error', message: extractErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadClientes(search);
    }, 220);
    return () => clearTimeout(timer);
  }, [search, loadClientes]);

  const handleOpenCreate = () => {
    setEditingCliente(null);
    setFormApiError('');
    setFormModalOpen(true);
  };

  const handleOpenEdit = (cli) => {
    setEditingCliente(cli);
    setFormApiError('');
    setFormModalOpen(true);
  };

  const handleOpenDetail = async (id) => {
    setDetailModalOpen(true);
    setDetailLoading(true);
    setSelectedCliente(null);
    try {
      const detail = await clienteService.getById(id);
      setSelectedCliente(detail);
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
      if (editingCliente) {
        const res = await clienteService.update(editingCliente.id_cliente, payload);
        setBanner({ type: 'success', message: res.message || 'Cliente actualizado exitosamente.' });
      } else {
        const res = await clienteService.create(payload);
        setBanner({ type: 'success', message: res.message || 'Cliente registrado exitosamente.' });
      }
      setFormModalOpen(false);
      loadClientes(search);
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
      const res = await clienteService.remove(deleteTarget.id_cliente);
      setBanner({ type: 'success', message: res.message || 'Cliente eliminado correctamente.' });
      setDeleteTarget(null);
      loadClientes(search);
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
          <h1 className="page-title">Directorio de Clientes</h1>
          <p className="page-description">
            Gestión de titulares, documentos de identificación, contacto e historial de compras.
          </p>
        </div>

        <div className="page-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => loadClientes(search)}
            disabled={loading}
          >
            <RefreshCw size={16} />
            <span>Recargar</span>
          </button>
          <button type="button" className="btn btn-primary" onClick={handleOpenCreate}>
            <Plus size={16} />
            <span>Nuevo Cliente</span>
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
              placeholder="Buscar por nombre, apellido o número de identificación..."
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
            <span>Cargando directorio de clientes...</span>
          </div>
        ) : clientes.length === 0 ? (
          <EmptyState
            title="No se encontraron clientes"
            description={
              search
                ? 'No hay clientes que coincidan con el criterio ingresado.'
                : 'Registre el primer cliente de BMW Premium Motors.'
            }
            actionLabel={!search ? 'Registrar Cliente' : undefined}
            onAction={!search ? handleOpenCreate : undefined}
          />
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Identificación</th>
                  <th>Teléfono</th>
                  <th>Correo</th>
                  <th>Compras</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((c) => (
                  <tr key={c.id_cliente}>
                    <td>
                      <div className="cell-primary">
                        {c.nombre} {c.apellidos}
                      </div>
                      {c.direccion && <div className="cell-secondary">{c.direccion}</div>}
                    </td>
                    <td>
                      <span className="mono-code">{c.identificacion}</span>
                    </td>
                    <td>{c.telefono}</td>
                    <td>{c.correo}</td>
                    <td>
                      <span className="mono-code">{c.total_compras}</span>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button
                          type="button"
                          className="icon-btn"
                          title="Ver detalles"
                          onClick={() => handleOpenDetail(c.id_cliente)}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          className="icon-btn"
                          title="Editar cliente"
                          onClick={() => handleOpenEdit(c)}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          className="icon-btn danger"
                          title="Eliminar cliente"
                          onClick={() => {
                            setDeleteError('');
                            setDeleteTarget(c);
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

      <ClienteFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingCliente}
        submitting={submitting}
        apiError={formApiError}
      />

      <ClienteDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        cliente={selectedCliente}
        loading={detailLoading}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Cliente"
        description={
          deleteTarget
            ? `¿Confirma eliminar al cliente "${deleteTarget.nombre} ${deleteTarget.apellidos}" (ID: ${deleteTarget.identificacion})? No se permitirá eliminar clientes con ventas registradas.`
            : ''
        }
        confirmLabel="Sí, eliminar cliente"
        loading={deleting}
        errorMessage={deleteError}
      />
    </div>
  );
}

