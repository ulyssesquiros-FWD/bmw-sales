import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Eye, Pencil, Trash2, RefreshCw, X } from 'lucide-react';
import AlertBanner from '../components/common/AlertBanner';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import VehiclePlaceholder from '../components/common/VehiclePlaceholder';
import { BmwMEmblem } from '../components/common/BmwLogos';
import VentaFormModal from '../components/ventas/VentaFormModal';
import VentaDetailModal from '../components/ventas/VentaDetailModal';
import { ventaService } from '../services/ventaService';
import { vehiculoService } from '../services/vehiculoService';
import { clienteService } from '../services/clienteService';
import { vendedorService } from '../services/vendedorService';
import { extractErrorMessage } from '../services/api';
import { isFullMModel } from '../utils/bmwCatalogMedia';
import { formatUSD, formatDate } from '../utils/formatters';

export default function Ventas() {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [banner, setBanner] = useState({ type: '', message: '' });

  // Catálogos relacionados para el modal de ventas
  const [vehiculos, setVehiculos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [vendedores, setVendedores] = useState([]);

  // Modal Crear / Editar
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingVenta, setEditingVenta] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formApiError, setFormApiError] = useState('');

  // Modal Detalle
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedVenta, setSelectedVenta] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Modal Eliminar
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const loadVentas = useCallback(async (query = search) => {
    setLoading(true);
    try {
      const data = await ventaService.getAll(query);
      setVentas(data);
    } catch (err) {
      setBanner({ type: 'error', message: extractErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  }, [search]);

  const loadRelaciones = useCallback(async () => {
    try {
      const [vehList, cliList, vendList] = await Promise.all([
        vehiculoService.getAll(),
        clienteService.getAll(),
        vendedorService.getAll()
      ]);
      setVehiculos(vehList);
      setClientes(cliList);
      setVendedores(vendList);
    } catch (err) {
      setBanner({ type: 'error', message: extractErrorMessage(err) });
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadVentas(search);
    }, 220);
    return () => clearTimeout(timer);
  }, [search, loadVentas]);

  const handleOpenCreate = async () => {
    await loadRelaciones();
    setEditingVenta(null);
    setFormApiError('');
    setFormModalOpen(true);
  };

  const handleOpenEdit = async (venta) => {
    await loadRelaciones();
    setEditingVenta(venta);
    setFormApiError('');
    setFormModalOpen(true);
  };

  const handleOpenDetail = async (id) => {
    setDetailModalOpen(true);
    setDetailLoading(true);
    setSelectedVenta(null);
    try {
      const detail = await ventaService.getById(id);
      setSelectedVenta(detail);
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
      if (editingVenta) {
        const res = await ventaService.update(editingVenta.id_venta, payload);
        setBanner({
          type: 'success',
          message: res.message || 'Venta actualizada correctamente.'
        });
      } else {
        const res = await ventaService.create(payload);
        setBanner({
          type: 'success',
          message:
            res.message ||
            'Venta registrada exitosamente. El vehículo pasó automáticamente a Vendido.'
        });
      }
      setFormModalOpen(false);
      loadVentas(search);
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
      const res = await ventaService.remove(deleteTarget.id_venta);
      setBanner({
        type: 'success',
        message:
          res.message ||
          'Venta eliminada correctamente. El vehículo volvió a estado Disponible.'
      });
      setDeleteTarget(null);
      loadVentas(search);
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
          <h1 className="page-title">Gestión de Ventas</h1>
          <p className="page-description">
            Operaciones transaccionales de venta en USD con sincronización automática de inventario.
          </p>
        </div>

        <div className="page-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => loadVentas(search)}
            disabled={loading}
          >
            <RefreshCw size={16} />
            <span>Recargar</span>
          </button>
          <button type="button" className="btn btn-primary" onClick={handleOpenCreate}>
            <Plus size={16} />
            <span>Registrar Venta</span>
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
              placeholder="Buscar venta por VIN, modelo, cliente, identificación o asesor..."
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
            <span>Cargando registro de ventas...</span>
          </div>
        ) : ventas.length === 0 ? (
          <EmptyState
            title="No se encontraron operaciones de venta"
            description={
              search
                ? 'Ninguna venta coincide con la búsqueda ingresada.'
                : 'Registre la primera venta seleccionando un vehículo disponible.'
            }
            actionLabel={!search ? 'Registrar Venta' : undefined}
            onAction={!search ? handleOpenCreate : undefined}
          />
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID / Fecha</th>
                  <th>Vehículo BMW</th>
                  <th>Cliente Comprador</th>
                  <th>Vendedor</th>
                  <th>Precio Venta (USD)</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ventas.map((vt) => (
                  <tr key={vt.id_venta}>
                    <td>
                      <div className="cell-primary">#{vt.id_venta}</div>
                      <div className="cell-secondary">{formatDate(vt.fecha_venta)}</div>
                    </td>
                    <td>
                      <div className="vehicle-row-info">
                        <VehiclePlaceholder
                          imagenUrl={vt.vehiculo_imagen_url}
                          alt={`${vt.modelo_nombre} ${vt.vehiculo_version}`}
                          modeloNombre={vt.modelo_nombre}
                          version={vt.vehiculo_version}
                          anio={vt.vehiculo_anio}
                          color={vt.vehiculo_color}
                        />
                        <div>
                          <div
                            className="cell-primary"
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}
                          >
                            <span>
                              {vt.modelo_nombre} {vt.vehiculo_version} ({vt.vehiculo_anio})
                            </span>
                            {isFullMModel(vt.modelo_nombre, vt.vehiculo_version) && (
                              <BmwMEmblem height={12} />
                            )}
                          </div>
                          <div className="cell-secondary">
                            VIN: <span className="mono-code">{vt.vehiculo_vin}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="cell-primary">
                        {vt.cliente_nombre} {vt.cliente_apellidos}
                      </div>
                      <div className="cell-secondary">ID: {vt.cliente_identificacion}</div>
                    </td>
                    <td>
                      <div className="cell-primary">
                        {vt.vendedor_nombre} {vt.vendedor_apellidos}
                      </div>
                      <div className="cell-secondary">{vt.vendedor_correo}</div>
                    </td>
                    <td>
                      <div className="price-tag">{formatUSD(vt.precio_venta)}</div>
                      <div className="cell-secondary">
                        Lista: {formatUSD(vt.vehiculo_precio_lista)}
                      </div>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button
                          type="button"
                          className="icon-btn"
                          title="Consultar detalle"
                          onClick={() => handleOpenDetail(vt.id_venta)}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          className="icon-btn"
                          title="Editar venta"
                          onClick={() => handleOpenEdit(vt)}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          className="icon-btn danger"
                          title="Eliminar venta y liberar vehículo"
                          onClick={() => {
                            setDeleteError('');
                            setDeleteTarget(vt);
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

      <VentaFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        vehiculos={vehiculos}
        clientes={clientes}
        vendedores={vendedores}
        initialData={editingVenta}
        submitting={submitting}
        apiError={formApiError}
      />

      <VentaDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        venta={selectedVenta}
        loading={detailLoading}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Anular / Eliminar Venta"
        description={
          deleteTarget
            ? `¿Confirma eliminar la Venta #${deleteTarget.id_venta} correspondiente al vehículo ${deleteTarget.modelo_nombre} ${deleteTarget.vehiculo_version} (VIN: ${deleteTarget.vehiculo_vin})? Mediante transacción SQL se eliminará la venta y el vehículo volverá automáticamente al estado Disponible.`
            : ''
        }
        confirmLabel="Confirmar y liberar vehículo"
        loading={deleting}
        errorMessage={deleteError}
      />
    </div>
  );
}

