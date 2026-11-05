import { useEffect, useState, useCallback } from 'react';
import {
  TrendingUp,
  BarChart3,
  DollarSign,
  CarFront,
  Users,
  Download,
  RefreshCw,
  Award,
  Layers,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { modulosService } from '../services/modulosService';
import { BmwMEmblem } from '../components/common/BmwLogos';

export default function ReportesAnalytics() {
  const [resumen, setResumen] = useState(null);
  const [ventasPeriodo, setVentasPeriodo] = useState([]);
  const [inventario, setInventario] = useState([]);
  const [asesores, setAsesores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const [resResumen, resVentas, resInv, resAsesores] = await Promise.all([
        modulosService.getReporteResumen(),
        modulosService.getReportesVentas(),
        modulosService.getReportesInventario(),
        modulosService.getReportesRendimiento()
      ]);

      if (resResumen.ok) setResumen(resResumen.data);
      if (resVentas.ok) setVentasPeriodo(resVentas.data || []);
      if (resInv.ok) setInventario(resInv.data || []);
      if (resAsesores.ok) setAsesores(resAsesores.data || []);
    } catch (err) {
      console.error('Error al cargar analíticas:', err);
      setError('No fue posible cargar las analíticas ejecutivas en este momento.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const formatearUSD = (valor) => {
    const num = Number(valor) || 0;
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const exportarCSV = () => {
    if (!inventario.length) return;
    const cabeceras = ['Modelo', 'Carroceria', 'Unidades', 'Disponibles', 'Vendidas', 'Valor Total USD', 'Precio Promedio USD'];
    const filas = inventario.map((row) => [
      `"${row.modelo}"`,
      `"${row.tipo_carroceria}"`,
      row.unidades_en_inventario,
      row.unidades_disponibles,
      row.unidades_vendidas,
      row.valor_total_inventario_usd,
      row.precio_promedio_usd
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [cabeceras.join(','), ...filas.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BMW_Reporte_Inventario_Valorizado_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="analytics-page">
      {/* Encabezado Principal */}
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <span className="badge badge-accent">Business Intelligence</span>
            <BmwMEmblem height={12} />
          </div>
          <h1 className="page-title">Centro Ejecutivo de Reportes &amp; Analytics</h1>
          <p className="page-description">
            Monitoreo en tiempo real del valor de inventario, facturación comercial, rendimiento por asesor y salud financiera.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={cargarDatos}
            disabled={cargando}
            title="Recargar analíticas"
          >
            <RefreshCw size={15} className={cargando ? 'spin' : ''} />
            <span>Actualizar</span>
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={exportarCSV}
            disabled={inventario.length === 0}
            title="Exportar valoración a archivo CSV"
          >
            <Download size={15} />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Ejecutivos */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Facturación Bruta (Ventas)</span>
            <div className="stat-card-icon" style={{ background: 'rgba(28, 105, 212, 0.1)', color: '#1c69d4' }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div className="stat-card-value">
            {formatearUSD(resumen?.ventas?.ingresos_brutos_usd)}
          </div>
          <div className="stat-card-hint">
            <strong>{resumen?.ventas?.total_ventas || 0}</strong> operaciones de venta completadas
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Valor Inventario Disponible</span>
            <div className="stat-card-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="stat-card-value">
            {formatearUSD(resumen?.inventario?.valor_disponible_usd)}
          </div>
          <div className="stat-card-hint">
            Capital activo listo para entrega inmediata
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Ticket Promedio Venta</span>
            <div className="stat-card-icon" style={{ background: 'rgba(235, 10, 30, 0.1)', color: '#eb0a1e' }}>
              <BarChart3 size={20} />
            </div>
          </div>
          <div className="stat-card-value">
            {formatearUSD(resumen?.ventas?.promedio_venta_usd)}
          </div>
          <div className="stat-card-hint">
            Precio promedio de comercialización en USD
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Total Unidades en Flota</span>
            <div className="stat-card-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
              <CarFront size={20} />
            </div>
          </div>
          <div className="stat-card-value">
            {resumen?.inventario?.total_unidades || 0} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>unidades</span>
          </div>
          <div className="stat-card-hint">
            En catálogo físico y red de concesionarios
          </div>
        </div>
      </div>

      {/* Grid de Secciones Analíticas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Rendimiento de Asesores */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Award size={20} style={{ color: '#1c69d4' }} />
              <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Ranking de Asesores Comerciales</h3>
            </div>
            <span className="badge badge-primary">{asesores.length} Asesores</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {asesores.map((a, idx) => {
              const maxVol = Math.max(...asesores.map((x) => Number(x.volumen_facturado_usd) || 1));
              const pct = Math.round(((Number(a.volumen_facturado_usd) || 0) / maxVol) * 100);

              return (
                <div key={a.id_vendedor} style={{ padding: '0.85rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, color: idx === 0 ? '#1c69d4' : 'var(--text-secondary)', width: '22px' }}>
                        #{idx + 1}
                      </span>
                      <strong>{a.nombre} {a.apellidos}</strong>
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {formatearUSD(a.volumen_facturado_usd)}
                    </span>
                  </div>

                  {/* Barra de progreso */}
                  <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden', marginBottom: '0.4rem' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: idx === 0 ? 'linear-gradient(90deg, #1c69d4, #0066b1)' : '#64748b',
                        borderRadius: '3px',
                        transition: 'width 0.4s ease'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <span>{a.total_ventas} ventas concretadas</span>
                    <span>{a.correo}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Facturación por Periodo */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Calendar size={20} style={{ color: '#10b981' }} />
              <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Ventas Facturadas por Periodo</h3>
            </div>
            <span className="badge badge-accent">Mensual</span>
          </div>

          {ventasPeriodo.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem 0' }}>
              No se registran transacciones previas.
            </p>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Mes</th>
                    <th style={{ textAlign: 'center' }}>Operaciones</th>
                    <th style={{ textAlign: 'right' }}>Ingresos USD</th>
                    <th style={{ textAlign: 'right' }}>Ticket Promedio</th>
                  </tr>
                </thead>
                <tbody>
                  {ventasPeriodo.map((p) => (
                    <tr key={p.periodo}>
                      <td>
                        <strong>{p.periodo}</strong>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge badge-primary">{p.total_operaciones}</span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {formatearUSD(p.ingresos_totales)}
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>
                        {formatearUSD(p.ticket_promedio)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Valoración Detallada del Inventario por Modelo */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Layers size={20} style={{ color: '#1c69d4' }} />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Distribución &amp; Valoración de Capital en Inventario</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Capital inmovilizado y disponible distribuido por modelo y tipología de carrocería
              </p>
            </div>
          </div>
          <span className="badge badge-secondary">{inventario.length} Modelos Representados</span>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Modelo BMW</th>
                <th>Carrocería</th>
                <th style={{ textAlign: 'center' }}>Unidades</th>
                <th style={{ textAlign: 'center' }}>Disponibles</th>
                <th style={{ textAlign: 'center' }}>Vendidas</th>
                <th style={{ textAlign: 'right' }}>Precio Promedio</th>
                <th style={{ textAlign: 'right' }}>Capital Total (USD)</th>
              </tr>
            </thead>
            <tbody>
              {inventario.map((row) => (
                <tr key={row.modelo}>
                  <td>
                    <strong>{row.modelo}</strong>
                  </td>
                  <td>
                    <span className="badge badge-secondary">{row.tipo_carroceria}</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>{row.unidades_en_inventario}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="badge badge-success">{row.unidades_disponibles}</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="badge badge-neutral">{row.unidades_vendidas}</span>
                  </td>
                  <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>
                    {formatearUSD(row.precio_promedio_usd)}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {formatearUSD(row.valor_total_inventario_usd)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
