import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import VehicleGalleryViewer from './VehicleGalleryViewer';
import { BmwRoundel, BmwMEmblem } from '../common/BmwLogos';
import {
  getVehicleViews,
  isFullMModel,
  isSpecialX5M2012
} from '../../utils/bmwCatalogMedia';
import { formatUSD, formatMileage, formatDate } from '../../utils/formatters';

export default function VehiculoDetailModal({ isOpen, onClose, vehiculo, loading = false }) {
  const isM = vehiculo ? isFullMModel(vehiculo.modelo_nombre, vehiculo.version) : false;
  const isHeritage = isSpecialX5M2012(vehiculo);
  const views = vehiculo ? getVehicleViews(vehiculo) : [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        vehiculo ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <BmwRoundel size={26} />
            <span>
              {vehiculo.modelo_nombre} — {vehiculo.version} ({vehiculo.anio})
            </span>
            {isM && <BmwMEmblem height={15} />}
          </span>
        ) : (
          'Showroom & Ficha Técnica BMW'
        )
      }
      size="lg"
      footer={
        <button type="button" className="btn btn-primary" onClick={onClose}>
          Cerrar Galería
        </button>
      }
    >
      {loading || !vehiculo ? (
        <div className="loading-state">
          <div className="spinner" />
          <span>Cargando galería multi-vista y ficha técnica...</span>
        </div>
      ) : (
        <>
          {isHeritage && (
            <div
              className="reference-box"
              style={{
                marginBottom: '16px',
                background: 'linear-gradient(95deg, #0b192c 0%, #16335b 100%)',
                borderColor: '#1c69d4',
                color: '#ffffff'
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: '#93c5fd'
                  }}
                >
                  Mención Especial · Colección BMW M Heritage
                </div>
                <div style={{ fontSize: '15px', fontWeight: 700, marginTop: '3px' }}>
                  BMW X5 M 2012 (Generación E70) • Motor S63 V8 4.4L M TwinPower Turbo • 555 HP
                </div>
              </div>
              <BmwMEmblem height={20} />
            </div>
          )}

          <VehicleGalleryViewer
            views={views}
            title={`${vehiculo.modelo_nombre} ${vehiculo.version}`}
          />

          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">Modelo y Versión</div>
              <div className="detail-value">
                {vehiculo.modelo_nombre} — {vehiculo.version}
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Estado Comercial</div>
              <div className="detail-value">
                <StatusBadge estado={vehiculo.estado} />
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Número de Chasis (VIN)</div>
              <div className="detail-value">
                <span className="mono-code">{vehiculo.vin}</span>
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Precio Contado (USD)</div>
              <div className="detail-value" style={{ color: '#1c69d4', fontSize: '17px' }}>
                {formatUSD(vehiculo.precio)}
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Año / Color Oficial</div>
              <div className="detail-value">
                {vehiculo.anio} • {vehiculo.color}
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Kilometraje</div>
              <div className="detail-value">{formatMileage(vehiculo.kilometraje)}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Carrocería / Motorización</div>
              <div className="detail-value">
                {vehiculo.tipo_carroceria} • {vehiculo.combustible}
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Transmisión</div>
              <div className="detail-value">{vehiculo.transmision}</div>
            </div>
          </div>

          {vehiculo.id_venta && (
            <>
              <h4 className="detail-section-title">Información de Venta Registrada</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <div className="detail-label">Operación de Venta</div>
                  <div className="detail-value">
                    Venta #{vehiculo.id_venta} ({formatDate(vehiculo.fecha_venta)})
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Precio Final de Venta (USD)</div>
                  <div className="detail-value">{formatUSD(vehiculo.precio_venta)}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Cliente Comprador</div>
                  <div className="detail-value">{vehiculo.cliente_nombre_completo}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Asesor BMW Responsable</div>
                  <div className="detail-value">{vehiculo.vendedor_nombre_completo}</div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </Modal>
  );
}
