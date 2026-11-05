import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  CarFront,
  CheckCircle2,
  Clock,
  BadgeCheck,
  Users,
  Briefcase,
  Receipt,
  DollarSign,
  RefreshCw,
  Eye,
  ArrowRight
} from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import RecentVehiclesTable from '../components/dashboard/RecentVehiclesTable';
import RecentSalesTable from '../components/dashboard/RecentSalesTable';
import AlertBanner from '../components/common/AlertBanner';
import StatusBadge from '../components/common/StatusBadge';
import VehiculoDetailModal from '../components/vehiculos/VehiculoDetailModal';
import { BmwRoundel, BmwMEmblem } from '../components/common/BmwLogos';
import { getVehicleViews, getModelGalleryByText } from '../utils/bmwCatalogMedia';
import { dashboardService } from '../services/dashboardService';
import { vehiculoService } from '../services/vehiculoService';
import { extractErrorMessage } from '../services/api';
import { formatUSD, formatNumber, formatMileage } from '../utils/formatters';

export default function Dashboard() {
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selector de vistas del Hero Especial X5 M 2012
  const [heroAngleIndex, setHeroAngleIndex] = useState(0);

  // Modal de ficha técnica desde el Hero
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedVehiculo, setSelectedVehiculo] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await dashboardService.getResumen();
      setResumen(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleOpenHeroDetail = async (idVehiculo) => {
    if (!idVehiculo) return;
    setDetailModalOpen(true);
    setDetailLoading(true);
    setSelectedVehiculo(null);
    try {
      const detail = await vehiculoService.getById(idVehiculo);
      setSelectedVehiculo(detail);
    } catch (err) {
      setDetailModalOpen(false);
      setError(extractErrorMessage(err));
    } finally {
      setDetailLoading(false);
    }
  };

  const ind = resumen?.indicadores || {
    total_vehiculos: 0,
    vehiculos_disponibles: 0,
    vehiculos_reservados: 0,
    vehiculos_vendidos: 0,
    total_clientes: 0,
    total_vendedores: 0,
    cantidad_ventas: 0,
    ingresos_ventas: 0
  };

  const destacado = resumen?.vehiculo_destacado;
  const heroViews = destacado
    ? getVehicleViews(destacado)
    : getModelGalleryByText('BMW X5 M', 'E70', 2012);
  const activeHeroView = heroViews[heroAngleIndex] || heroViews[0];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-kicker">
            <span>BMW PREMIUM MOTORS</span>
            <BmwMEmblem height={12} />
          </div>
          <h1 className="page-title">Showroom Oficial & Panel Ejecutivo</h1>
          <p className="page-description">
            Gestión comercial conectada en tiempo real a MySQL • Precios expresados en USD.
          </p>
        </div>

        <div className="page-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={fetchDashboard}
            disabled={loading}
          >
            <RefreshCw size={15} />
            <span>Actualizar</span>
          </button>
          <Link to="/vehiculos" className="btn btn-primary">
            <span>Explorar Showroom</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      {error && <AlertBanner type="error" message={error} />}

      {/* HERO ESTILO OFICIAL BMW-M.COM — MENCIÓN ESPECIAL BMW X5 M 2012 */}
      <section className="bmw-hero-banner" aria-label="Mención Especial BMW X5 M 2012">
        <div className="bmw-hero-grid">
          <div className="bmw-hero-copy">
            <div>
              <div className="bmw-hero-eyebrow">
                <BmwRoundel size={24} variant="flat" />
                <BmwMEmblem height={15} />
                <span>Mención Especial · M Heritage</span>
              </div>

              <div className="bmw-hero-the">THE X5 M</div>
              <h2 className="bmw-hero-headline">
                {destacado ? `${destacado.modelo_nombre} ${destacado.anio}` : 'BMW X5 M 2012'}
              </h2>

              <p className="bmw-hero-sub">
                {destacado
                  ? `${destacado.version} en ${destacado.color}. El legendario SAV de primera generación M (E70) impulsado por el motor S63 V8 4.4L M TwinPower Turbo de 555 HP y escape deportivo cuádruple.`
                  : 'Generación E70 impulsada por el legendario motor S63 V8 4.4L M TwinPower Turbo de 555 HP en Titanium Silver Metallic.'}
              </p>
            </div>

            <div className="bmw-hero-specs">
              <div>
                <div className="bmw-hero-spec-val">555 HP</div>
                <div className="bmw-hero-spec-lbl">V8 4.4L M TwinPower</div>
              </div>
              <div>
                <div className="bmw-hero-spec-val">
                  {destacado ? formatUSD(destacado.precio) : '$48,900.00'}
                </div>
                <div className="bmw-hero-spec-lbl">Precio en Inventario</div>
              </div>
              <div>
                <div className="bmw-hero-spec-val">
                  {destacado ? formatMileage(destacado.kilometraje) : '42,800 km'}
                </div>
                <div className="bmw-hero-spec-lbl">
                  {destacado ? `Estado: ${destacado.estado}` : 'Edición E70 2012'}
                </div>
              </div>
            </div>

            <div className="bmw-hero-actions">
              {destacado && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleOpenHeroDetail(destacado.id_vehiculo)}
                >
                  <Eye size={16} />
                  <span>Abrir Galería & Ficha</span>
                </button>
              )}

              <Link to="/vehiculos?serie=M" className="btn btn-outline-light">
                <BmwMEmblem height={13} />
                <span>Ver Toda la Gama M</span>
              </Link>
            </div>
          </div>

          <div className="bmw-hero-stage">
            <div className="bmw-hero-stage-img-wrap">
              <img
                src={activeHeroView.url}
                alt={`BMW X5 M 2012 — ${activeHeroView.label}`}
              />
              <div className="bmw-hero-stage-badge">
                <BmwMEmblem height={12} />
                <span>{activeHeroView.label}</span>
              </div>
            </div>

            <div className="bmw-hero-angle-bar">
              <div className="bmw-angle-pills">
                {heroViews.map((vw, idx) => (
                  <button
                    key={vw.id}
                    type="button"
                    className={`bmw-angle-pill ${idx === heroAngleIndex ? 'active' : ''}`}
                    onClick={() => setHeroAngleIndex(idx)}
                  >
                    {vw.label}
                  </button>
                ))}
              </div>
              {destacado && <StatusBadge estado={destacado.estado} />}
            </div>
          </div>
        </div>
      </section>

      {loading && !resumen ? (
        <div className="card-panel">
          <div className="loading-state">
            <div className="spinner" />
            <span>Consultando métricas del concesionario en MySQL...</span>
          </div>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <StatCard
              label="Ingresos por Ventas"
              value={formatUSD(ind.ingresos_ventas)}
              subtitle="Facturación acumulada en USD"
              icon={DollarSign}
              highlight
            />
            <StatCard
              label="Cantidad de Ventas"
              value={formatNumber(ind.cantidad_ventas)}
              subtitle="Operaciones cerradas"
              icon={Receipt}
              variant="blue"
            />
            <StatCard
              label="Total de Vehículos"
              value={formatNumber(ind.total_vehiculos)}
              subtitle="Unidades registradas en flota"
              icon={CarFront}
              variant="navy"
            />
            <StatCard
              label="Vehículos Disponibles"
              value={formatNumber(ind.vehiculos_disponibles)}
              subtitle="Listos para entrega inmediata"
              icon={CheckCircle2}
              variant="green"
            />
            <StatCard
              label="Vehículos Reservados"
              value={formatNumber(ind.vehiculos_reservados)}
              subtitle="Con reserva comercial activa"
              icon={Clock}
              variant="amber"
            />
            <StatCard
              label="Vehículos Vendidos"
              value={formatNumber(ind.vehiculos_vendidos)}
              subtitle="Entregados / facturados"
              icon={BadgeCheck}
              variant="blue"
            />
            <StatCard
              label="Total de Clientes"
              value={formatNumber(ind.total_clientes)}
              subtitle="Cartera activa de clientes"
              icon={Users}
              variant="navy"
            />
            <StatCard
              label="Total de Vendedores"
              value={formatNumber(ind.total_vendedores)}
              subtitle="Equipo asesor BMW"
              icon={Briefcase}
              variant="blue"
            />
          </div>

          <div className="dashboard-tables-grid">
            <RecentVehiclesTable vehiculos={resumen?.vehiculos_recientes || []} />
            <RecentSalesTable ventas={resumen?.ventas_recientes || []} />
          </div>
        </>
      )}

      <VehiculoDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        vehiculo={selectedVehiculo}
        loading={detailLoading}
      />
    </div>
  );
}
