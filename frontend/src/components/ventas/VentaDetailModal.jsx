import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import VehicleGalleryViewer from '../vehiculos/VehicleGalleryViewer';
import { BmwMEmblem } from '../common/BmwLogos';
import { getVehicleViews, isFullMModel } from '../../utils/bmwCatalogMedia';
import { formatUSD, formatMileage, formatDate } from '../../utils/formatters';

export default function VentaDetailModal({ isOpen, onClose, venta, loading = false }) {
  const views = venta
    ? getVehicleViews({
        modelo_nombre: venta.modelo_nombre,
        version: venta.vehiculo_version,
        anio: venta.vehiculo_anio,
        color: venta.vehiculo_color,
        imagen_url: venta.vehiculo_imagen_url
      })
    : [];

  const isM = venta ? isFullMModel(venta.modelo_nombre, venta.vehiculo_version) : false;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={venta ? `Comprobante Ejecutivo de Venta #${venta.id_venta}` : 'Detalle de Venta'}
      size="lg"
      footer={
        <button type="button" className="btn btn-primary" onClick={onClose}>
          Cerrar
        </button>
      }
    >
      {loading || !venta ? (
        <div className="loading-state">
          <div className="spinner" />
          <span>Cargando detalle de la operación...</span>
        </div>
      ) : (
        <>
          <VehicleGalleryViewer
            views={views}
            title={`${venta.modelo_nombre} ${venta.vehiculo_version}`}
          />

          <div className="reference-box" style={{ marginBottom: '18px' }}>
            <div>
              <div className="reference-box-title">Importe Cerrado de la Operación</div>
              <div className="reference-box-price">{formatUSD(venta.precio_venta)} USD</div>
              <div style={{ fontSize: '12.5px', color: '#334155', marginTop: '2px' }}>
                Precio de lista referencial: {formatUSD(venta.vehiculo_precio_lista)} USD
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: '#475569', marginBottom: '4px' }}>
                Fecha de venta: <strong>{formatDate(venta.fecha_venta)}</strong>
              </div>
              <StatusBadge estado={venta.vehiculo_estado || 'Vendido'} />
            </div>
          </div>

          <h4 className="detail-section-title" style={{ marginTop: 0 }}>
            Vehículo Comercializado
          </h4>
          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">Modelo y Versión</div>
              <div
                className="detail-value"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}
              >
                <span>
                  {venta.modelo_nombre} {venta.vehiculo_version}
                </span>
                {isM && <BmwMEmblem height={14} />}
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Número VIN</div>
              <div className="detail-value">
                <span className="mono-code">{venta.vehiculo_vin}</span>
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Año / Color</div>
              <div className="detail-value">
                {venta.vehiculo_anio} • {venta.vehiculo_color}
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Kilometraje al Cierre</div>
              <div className="detail-value">{formatMileage(venta.vehiculo_kilometraje)}</div>
            </div>
          </div>

          <h4 className="detail-section-title">Cliente Comprador y Asesor</h4>
          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">Cliente</div>
              <div className="detail-value">
                {venta.cliente_nombre} {venta.cliente_apellidos}
              </div>
              <div className="cell-secondary">
                ID: {venta.cliente_identificacion} • {venta.cliente_telefono}
              </div>
              <div className="cell-secondary">{venta.cliente_correo}</div>
            </div>

            <div className="detail-item">
              <div className="detail-label">Vendedor Responsable</div>
              <div className="detail-value">
                {venta.vendedor_nombre} {venta.vendedor_apellidos}
              </div>
              <div className="cell-secondary">{venta.vendedor_telefono}</div>
              <div className="cell-secondary">{venta.vendedor_correo}</div>
            </div>

            <div className="detail-item full-width">
              <div className="detail-label">Observaciones de la Operación</div>
              <div className="detail-value" style={{ fontWeight: 400 }}>
                {venta.observaciones || 'Sin observaciones adicionales registradas.'}
              </div>
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}

