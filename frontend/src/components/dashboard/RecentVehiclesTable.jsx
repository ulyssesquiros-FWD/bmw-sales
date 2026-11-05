import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import VehiclePlaceholder from '../common/VehiclePlaceholder';
import { BmwMEmblem } from '../common/BmwLogos';
import { isFullMModel } from '../../utils/bmwCatalogMedia';
import { formatUSD, formatMileage } from '../../utils/formatters';

export default function RecentVehiclesTable({ vehiculos = [] }) {
  return (
    <section className="card-panel">
      <div className="card-panel-header">
        <h2 className="card-panel-title">Vehículos Recientes en Showroom</h2>
        <Link to="/vehiculos" className="btn btn-secondary btn-sm">
          <span>Ver Showroom</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {vehiculos.length === 0 ? (
        <div className="empty-state" style={{ padding: '32px 16px' }}>
          <p>No hay vehículos registrados todavía.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Vehículo</th>
                <th>VIN</th>
                <th>Precio (USD)</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {vehiculos.map((veh) => {
                const isM = isFullMModel(veh.modelo_nombre, veh.version);
                return (
                  <tr key={veh.id_vehiculo}>
                    <td>
                      <div className="vehicle-row-info">
                        <VehiclePlaceholder
                          imagenUrl={veh.imagen_url}
                          modeloNombre={veh.modelo_nombre}
                          version={veh.version}
                          anio={veh.anio}
                          color={veh.color}
                          alt={`${veh.modelo_nombre} ${veh.version}`}
                        />
                        <div>
                          <div className="cell-primary">
                            <span>
                              {veh.modelo_nombre} {veh.version}
                            </span>
                            {isM && <BmwMEmblem height={12} />}
                          </div>
                          <div className="cell-secondary">
                            {veh.anio} • {veh.color} • {formatMileage(veh.kilometraje)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="mono-code">{veh.vin}</span>
                    </td>
                    <td className="price-tag">{formatUSD(veh.precio)}</td>
                    <td>
                      <StatusBadge estado={veh.estado} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
