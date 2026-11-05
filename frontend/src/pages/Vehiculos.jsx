import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
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
import StatusBadge from '../components/common/StatusBadge';
import VehiclePlaceholder from '../components/common/VehiclePlaceholder';
import VehicleShowroomCard from '../components/vehiculos/VehicleShowroomCard';
import VehiculoFormModal from '../components/vehiculos/VehiculoFormModal';
import VehiculoDetailModal from '../components/vehiculos/VehiculoDetailModal';
import { BmwMEmblem } from '../components/common/BmwLogos';
import { isFullMModel, isSpecialX5M2012 } from '../utils/bmwCatalogMedia';
import { vehiculoService } from '../services/vehiculoService';
import { modeloService } from '../services/modeloService';
import { extractErrorMessage } from '../services/api';
import { formatUSD, formatMileage } from '../utils/formatters';

export default function Vehiculos() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [vehiculos, setVehiculos] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState({ type: '', message: '' });

  // Modo de visualización: Showroom estilo bmw.com vs Tabla Ejecutiva
  const [viewMode, setViewMode] = useState('showroom');

  // Pestaña de gama BMW (Todos | M | X5M2012 | SUV | SEDAN | ELECTRIC)
  const [activeSeriesTab, setActiveSeriesTab] = useState(
    searchParams.get('serie') === 'M' ? 'M' : 'ALL'
  );

  // Filtros API
  const [search, setSearch] = useState('');
  const [filtroModelo, setFiltroModelo] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  // Modal Crear / Editar
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingVehiculo, setEditingVehiculo] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formApiError, setFormApiError] = useState('');

  // Modal Detalles y Galería Multi-Vista
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedVehiculo, setSelectedVehiculo] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Modal Eliminar
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    if (searchParams.get('serie') === 'M') {
      setActiveSeriesTab('M');
    }
  }, [searchParams]);

  const loadModelosCatalog = useCallback(async () => {
    try {
      const data = await modeloService.getAll();
      setModelos(data);
    } catch (err) {
      setBanner({ type: 'error', message: extractErrorMessage(err) });
    }
  }, []);

  const loadVehiculos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await vehiculoService.getAll({
        id_modelo: filtroModelo,
        estado: filtroEstado,
        search
      });
      setVehiculos(data);
    } catch (err) {
      setBanner({ type: 'error', message: extractErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  }, [filtroModelo, filtroEstado, search]);

  useEffect(() => {
    loadModelosCatalog();
  }, [loadModelosCatalog]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadVehiculos();
    }, 220);
    return () => clearTimeout(timer);
  }, [loadVehiculos]);

  // Filtrado por pestaña de gama oficial BMW + ordenando primero el X5 M 2012 cuando corresponde
  const vehiculosMostrados = useMemo(() => {
    const filtered = vehiculos.filter((v) => {
      if (activeSeriesTab === 'ALL') return true;
      if (activeSeriesTab === 'M') return isFullMModel(v.modelo_nombre, v.version);
      if (activeSeriesTab === 'X5M2012') return isSpecialX5M2012(v);
      const carr = (v.tipo_carroceria || '').toUpperCase();
      const comb = (v.combustible || '').toUpperCase();
      if (activeSeriesTab === 'SUV') {
        return carr.includes('SUV') || carr.includes('SAV') || carr.includes('SAC');
      }
      if (activeSeriesTab === 'SEDAN') {
        return carr.includes('SEDÁN') || carr.includes('SEDAN') || carr.includes('COUPÉ') || carr.includes('COUPE') || carr.includes('BERLINA');
      }
      if (activeSeriesTab === 'ELECTRIC') {
        return comb.includes('ELÉCTRICO') || comb.includes('ELECTRICO') || comb.includes('HÍBRIDO') || comb.includes('PHEV');
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      const aSpecial = isSpecialX5M2012(a) ? 0 : 1;
      const bSpecial = isSpecialX5M2012(b) ? 0 : 1;
      if (aSpecial !== bSpecial) return aSpecial - bSpecial;
      return b.id_vehiculo - a.id_vehiculo;
    });
  }, [vehiculos, activeSeriesTab]);

  const handleSelectSeriesTab = (tab) => {
    setActiveSeriesTab(tab);
    if (tab === 'M') {
      setSearchParams({ serie: 'M' });
    } else {
      setSearchParams({});
    }
  };

  const handleOpenCreate = async () => {
    await loadModelosCatalog();
    setEditingVehiculo(null);
    setFormApiError('');
    setFormModalOpen(true);
  };

  const handleOpenEdit = async (veh) => {
    await loadModelosCatalog();
    setEditingVehiculo(veh);
    setFormApiError('');
    setFormModalOpen(true);
  };

  const handleOpenDetail = async (id) => {
    setDetailModalOpen(true);
    setDetailLoading(true);
    setSelectedVehiculo(null);
    try {
      const detail = await vehiculoService.getById(id);
      setSelectedVehiculo(detail);
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
      if (editingVehiculo) {
        const res = await vehiculoService.update(editingVehiculo.id_vehiculo, payload);
        setBanner({ type: 'success', message: res.message || 'Vehículo actualizado exitosamente.' });
      } else {
        const res = await vehiculoService.create(payload);
        setBanner({ type: 'success', message: res.message || 'Vehículo creado exitosamente.' });
      }
      setFormModalOpen(false);
      loadVehiculos();
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
      const res = await vehiculoService.remove(deleteTarget.id_vehiculo);
      setBanner({ type: 'success', message: res.message || 'Vehículo eliminado correctamente.' });
      setDeleteTarget(null);
      loadVehiculos();
    } catch (err) {
      const msg = extractErrorMessage(err);
      setDeleteError(msg);
      setBanner({ type: 'error', message: msg });
    } finally {
      setDeleting(false);
    }
  };

  const hasActiveFilters = Boolean(
    search || filtroModelo || filtroEstado || activeSeriesTab !== 'ALL'
  );

  const clearFilters = () => {
    setSearch('');
    setFiltroModelo('');
    setFiltroEstado('');
    handleSelectSeriesTab('ALL');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-kicker">
            <span>ENCUENTRA TU BMW</span>
            <BmwMEmblem height={12} />
          </div>
          <h1 className="page-title">Showroom & Inventario Oficial BMW</h1>
          <p className="page-description">
            Explore cada automóvil desde diferentes ángulos (Frontal, Lateral/Trasera e Interior), gama BMW M y precios en USD.
          </p>
        </div>

        <div className="page-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={loadVehiculos}
            disabled={loading}
          >
            <RefreshCw size={15} />
            <span>Recargar</span>
          </button>
          <button type="button" className="btn btn-primary" onClick={handleOpenCreate}>
            <Plus size={16} />
            <span>Registrar Vehículo</span>
          </button>
        </div>
      </div>

      <AlertBanner
        type={banner.type}
        message={banner.message}
        onClose={() => setBanner({ type: '', message: '' })}
      />

      <div className="card-panel">
        {/* PESTAÑAS ESTILO WWW.BMW.COM/MODELOS */}
        <div className="bmw-series-tabs-bar">
          <div className="bmw-series-tabs" role="tablist">
            <button
              type="button"
              className={`bmw-series-tab ${activeSeriesTab === 'ALL' ? 'active' : ''}`}
              onClick={() => handleSelectSeriesTab('ALL')}
            >
              Todos ({vehiculos.length})
            </button>
            <button
              type="button"
              className={`bmw-series-tab ${activeSeriesTab === 'M' ? 'active' : ''}`}
              onClick={() => handleSelectSeriesTab('M')}
            >
              <BmwMEmblem height={13} />
              <span>BMW M</span>
            </button>
            <button
              type="button"
              className={`bmw-series-tab ${activeSeriesTab === 'X5M2012' ? 'active' : ''}`}
              onClick={() => handleSelectSeriesTab('X5M2012')}
            >
              <span>Especial X5 M 2012</span>
            </button>
            <button
              type="button"
              className={`bmw-series-tab ${activeSeriesTab === 'SUV' ? 'active' : ''}`}
              onClick={() => handleSelectSeriesTab('SUV')}
            >
              SUV / SAV (X)
            </button>
            <button
              type="button"
              className={`bmw-series-tab ${activeSeriesTab === 'SEDAN' ? 'active' : ''}`}
              onClick={() => handleSelectSeriesTab('SEDAN')}
            >
              Sedán & Coupé
            </button>
            <button
              type="button"
              className={`bmw-series-tab ${activeSeriesTab === 'ELECTRIC' ? 'active' : ''}`}
              onClick={() => handleSelectSeriesTab('ELECTRIC')}
            >
              BMW i & Híbridos
            </button>
          </div>

          <div className="view-mode-toggle" role="group" aria-label="Cambiar vista">
            <button
              type="button"
              className={`view-mode-btn ${viewMode === 'showroom' ? 'active' : ''}`}
              onClick={() => setViewMode('showroom')}
            >
              <LayoutGrid size={14} />
              <span>Showroom</span>
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
        </div>

        {/* BARRA DE BÚSQUEDA Y FILTROS */}
        <div className="filters-bar">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Buscar por VIN (17 caracteres), versión o color..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            value={filtroModelo}
            onChange={(e) => setFiltroModelo(e.target.value)}
            aria-label="Filtrar por modelo BMW"
          >
            <option value="">Todos los modelos</option>
            {modelos.map((m) => (
              <option key={m.id_modelo} value={m.id_modelo}>
                {m.nombre}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            aria-label="Filtrar por estado"
          >
            <option value="">Todos los estados</option>
            <option value="Disponible">Disponible</option>
            <option value="Reservado">Reservado</option>
            <option value="Vendido">Vendido</option>
          </select>

          {hasActiveFilters && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={clearFilters}>
              <X size={14} />
              <span>Restablecer</span>
            </button>
          )}
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <span>Cargando unidades BMW desde MySQL...</span>
          </div>
        ) : vehiculosMostrados.length === 0 ? (
          <EmptyState
            title="No se encontraron vehículos en esta selección"
            description={
              hasActiveFilters
                ? 'Ninguna unidad coincide con la categoría o filtros aplicados.'
                : 'Aún no hay vehículos registrados en el inventario.'
            }
            actionLabel={hasActiveFilters ? 'Ver todos los vehículos' : 'Registrar Vehículo'}
            onAction={hasActiveFilters ? clearFilters : handleOpenCreate}
          />
        ) : viewMode === 'showroom' ? (
          <div className="bmw-showroom-grid">
            {vehiculosMostrados.map((v) => (
              <VehicleShowroomCard
                key={v.id_vehiculo}
                vehiculo={v}
                onOpenDetail={handleOpenDetail}
                onOpenEdit={handleOpenEdit}
                onOpenDelete={(veh) => {
                  setDeleteError('');
                  setDeleteTarget(veh);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vehículo</th>
                  <th>VIN</th>
                  <th>Año / Color</th>
                  <th>Kilometraje</th>
                  <th>Precio (USD)</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {vehiculosMostrados.map((v) => {
                  const isM = isFullMModel(v.modelo_nombre, v.version);
                  return (
                    <tr key={v.id_vehiculo}>
                      <td>
                        <div className="vehicle-row-info">
                          <VehiclePlaceholder
                            imagenUrl={v.imagen_url}
                            modeloNombre={v.modelo_nombre}
                            version={v.version}
                            anio={v.anio}
                            color={v.color}
                            alt={`${v.modelo_nombre} ${v.version}`}
                          />
                          <div>
                            <div className="cell-primary">
                              <span>{v.modelo_nombre}</span>
                              {isM && <BmwMEmblem height={12} />}
                            </div>
                            <div className="cell-secondary">{v.version}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="mono-code">{v.vin}</span>
                      </td>
                      <td>
                        <div className="cell-primary">{v.anio}</div>
                        <div className="cell-secondary">{v.color}</div>
                      </td>
                      <td>{formatMileage(v.kilometraje)}</td>
                      <td className="price-tag">{formatUSD(v.precio)}</td>
                      <td>
                        <StatusBadge estado={v.estado} />
                      </td>
                      <td>
                        <div className="actions-cell">
                          <button
                            type="button"
                            className="icon-btn"
                            title="Explorar vistas y ficha técnica"
                            onClick={() => handleOpenDetail(v.id_vehiculo)}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            type="button"
                            className="icon-btn"
                            title="Editar vehículo"
                            onClick={() => handleOpenEdit(v)}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            className="icon-btn danger"
                            title="Eliminar vehículo"
                            onClick={() => {
                              setDeleteError('');
                              setDeleteTarget(v);
                            }}
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

      <VehiculoFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        modelos={modelos}
        initialData={editingVehiculo}
        submitting={submitting}
        apiError={formApiError}
      />

      <VehiculoDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        vehiculo={selectedVehiculo}
        loading={detailLoading}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Vehículo del Inventario"
        description={
          deleteTarget
            ? `¿Confirma eliminar la unidad ${deleteTarget.modelo_nombre} ${deleteTarget.version} (VIN: ${deleteTarget.vin})? Si el vehículo cuenta con una venta asociada, no podrá ser eliminado.`
            : ''
        }
        confirmLabel="Sí, eliminar vehículo"
        loading={deleting}
        errorMessage={deleteError}
      />
    </div>
  );
}
