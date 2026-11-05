import { useState } from 'react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import { BmwMEmblem } from '../common/BmwLogos';
import {
  getVehicleViews,
  isFullMModel,
  isSpecialX5M2012
} from '../../utils/bmwCatalogMedia';
import { formatUSD, formatMileage } from '../../utils/formatters';

export default function VehicleShowroomCard({
  vehiculo,
  onOpenDetail,
  onOpenEdit,
  onOpenDelete
}) {
  const views = getVehicleViews(vehiculo);
  const [viewIndex, setViewIndex] = useState(0);

  const isM = isFullMModel(vehiculo.modelo_nombre, vehiculo.version);
  const isHeritageX5M = isSpecialX5M2012(vehiculo);
  const currentView = views[viewIndex] || views[0];

  return (
    <article className={`bmw-vehicle-card ${isHeritageX5M ? 'special-heritage' : ''}`}>
      <div className="bmw-card-media">
        <img
          src={currentView.url}
          alt={`${vehiculo.modelo_nombre} ${vehiculo.version} — ${currentView.label}`}
          loading="lazy"
        />

        <div className="bmw-card-top-badges">
          <div>
            {isHeritageX5M ? (
              <span className="bmw-heritage-tag">Mención Especial · E70 2012</span>
            ) : (
              <StatusBadge estado={vehiculo.estado} />
            )}
          </div>

          {isM && (
            <span className="bmw-m-chip" title="BMW M Motorsport / M Performance">
              <BmwMEmblem height={13} />
            </span>
          )}
        </div>

        {views.length > 1 && (
          <div className="bmw-card-view-switcher">
            {views.map((vw, idx) => {
              const shortLabel =
                idx === 0
                  ? 'Frontal'
                  : vw.id === 'side'
                  ? 'Perfil'
                  : vw.id === 'rear'
                  ? 'Trasera'
                  : vw.id === 'interior'
                  ? 'Interior'
                  : `Vista ${idx + 1}`;
              return (
                <button
                  key={`${vw.id}-${idx}`}
                  type="button"
                  className={`bmw-card-view-btn ${idx === viewIndex ? 'active' : ''}`}
                  onClick={() => setViewIndex(idx)}
                >
                  {shortLabel}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="bmw-card-body">
        <div>
          <div className="bmw-card-series-row">
            <span className="bmw-card-series">
              {vehiculo.tipo_carroceria} • Año {vehiculo.anio}
            </span>
            {isHeritageX5M && <StatusBadge estado={vehiculo.estado} />}
          </div>

          <h3 className="bmw-card-title">
            {vehiculo.modelo_nombre} {vehiculo.version}
          </h3>

          <p className="bmw-card-fuel">
            {vehiculo.combustible} • {vehiculo.color}
          </p>
        </div>

        <div>
          <div className="bmw-card-specs-strip">
            <span>{formatMileage(vehiculo.kilometraje)}</span>
            <span className="mono-code" title="Número VIN">
              {vehiculo.vin}
            </span>
          </div>

          <div className="bmw-card-price-block" style={{ marginTop: '12px', marginBottom: '14px' }}>
            <span className="bmw-card-price-label">Precio Contado (USD)</span>
            <span className="bmw-card-price-value">{formatUSD(vehiculo.precio)}</span>
          </div>

          <div className="bmw-card-actions">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => onOpenDetail(vehiculo.id_vehiculo)}
            >
              <Eye size={15} />
              <span>Explorar Vistas</span>
            </button>

            <button
              type="button"
              className="icon-btn"
              title="Editar vehículo"
              onClick={() => onOpenEdit(vehiculo)}
            >
              <Pencil size={15} />
            </button>

            <button
              type="button"
              className="icon-btn danger"
              title="Eliminar vehículo"
              onClick={() => onOpenDelete(vehiculo)}
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

