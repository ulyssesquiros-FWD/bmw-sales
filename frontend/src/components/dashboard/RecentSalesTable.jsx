import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { formatUSD, formatDate } from '../../utils/formatters';

export default function RecentSalesTable({ ventas = [] }) {
  return (
    <section className="card-panel">
      <div className="card-panel-header">
        <h2 className="card-panel-title">Ventas Recientes</h2>
        <Link to="/ventas" className="btn btn-secondary btn-sm">
          <span>Ver ventas</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {ventas.length === 0 ? (
        <div className="empty-state" style={{ padding: '32px 16px' }}>
          <p>No se han registrado ventas todavía.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Vehículo</th>
                <th>Cliente</th>
                <th>Importe (USD)</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map((vt) => (
                <tr key={vt.id_venta}>
                  <td>{formatDate(vt.fecha_venta)}</td>
                  <td>
                    <div className="cell-primary">
                      {vt.modelo_nombre} {vt.vehiculo_version}
                    </div>
                    <div className="cell-secondary">VIN: {vt.vehiculo_vin}</div>
                  </td>
                  <td>
                    <div className="cell-primary">{vt.cliente_nombre_completo}</div>
                    <div className="cell-secondary">Asesor: {vt.vendedor_nombre_completo}</div>
                  </td>
                  <td className="price-tag">{formatUSD(vt.precio_venta)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

