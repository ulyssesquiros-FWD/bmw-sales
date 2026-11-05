import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import VehicleGalleryViewer from '../vehiculos/VehicleGalleryViewer';
import { BmwRoundel, BmwMEmblem } from '../common/BmwLogos';
import { getModelGalleryByText, isFullMModel } from '../../utils/bmwCatalogMedia';
import { formatUSD, formatDate } from '../../utils/formatters';

export default function ModeloDetailModal({ isOpen, onClose, modelo, loading = false }) {
  const isM = modelo ? isFullMModel(modelo.nombre, '') : false;
  const views = modelo
    ? getModelGalleryByText(
        modelo.nombre,
        modelo.nombre === 'BMW X5 M' ? 'E70' : '',
        modelo.nombre === 'BMW X5 M' ? 2012 : 2025
      )
    : [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        modelo ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
            <BmwRoundel size={26} />
            <span>Ficha Oficial: {modelo.nombre}</span>
            {isM && <BmwMEmblem height={15} />}
          </span>
        ) : (
          'Detalle del Modelo'
        )
      }
      size="lg"
      footer={
        <button type="button" className="btn btn-primary" onClick={onClose}>
          Cerrar
        </button>
      }
    >
      {loading || !modelo ? (
        <div className="loading-state">
          <div className="spinner" />
          <span>Cargando detalles y vistas del modelo...</span>
        </div>
      ) : (
        <>
          <VehicleGalleryViewer views={views} title={modelo.nombre} />

          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">ID Modelo</div>
              <div className="detail-value">#{modelo.id_modelo}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Denominación Oficial</div>
              <div className="detail-value">{modelo.nombre}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Tipo de Carrocería</div>
              <div className="detail-value">{modelo.tipo_carroceria}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Motorización / Combustible</div>
              <div className="detail-value">{modelo.combustible}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Transmisión</div>
              <div className="detail-value">{modelo.transmision}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Fecha de Registro</div>
              <div className="detail-value">{formatDate(modelo.created_at)}</div>
            </div>
            <div className="detail-item full-width">
              <div className="detail-label">Descripción de Serie</div>
              <div className="detail-value" style={{ fontWeight: 400 }}>
                {modelo.descripcion || 'Sin descripción registrada.'}
              </div>
            </div>
          </div>

          <h4 className="detail-section-title">
            Unidades Asociadas en Inventario ({modelo.vehiculos?.length || 0})
          </h4>

          {!modelo.vehiculos || modelo.vehiculos.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '13.5px' }}>
              Actualmente no existen vehículos asociados a este modelo.
            </p>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>VIN</th>
                    <th>Versión</th>
                    <th>Año</th>
                    <th>Color</th>
                    <th>Precio (USD)</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {modelo.vehiculos.map((v) => (
                    <tr key={v.id_vehiculo}>
                      <td>
                        <span className="mono-code">{v.vin}</span>
                      </td>
                      <td className="cell-primary">{v.version}</td>
                      <td>{v.anio}</td>
                      <td>{v.color}</td>
                      <td className="price-tag">{formatUSD(v.precio)}</td>
                      <td>
                        <StatusBadge estado={v.estado} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </Modal>
  );
}
