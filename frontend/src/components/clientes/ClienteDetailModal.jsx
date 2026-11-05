import Modal from '../common/Modal';
import { formatUSD, formatDate } from '../../utils/formatters';

export default function ClienteDetailModal({ isOpen, onClose, cliente, loading = false }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        cliente
          ? `Expediente del Cliente: ${cliente.nombre} ${cliente.apellidos}`
          : 'Detalle del Cliente'
      }
      size="lg"
      footer={
        <button type="button" className="btn btn-primary" onClick={onClose}>
          Cerrar
        </button>
      }
    >
      {loading || !cliente ? (
        <div className="loading-state">
          <div className="spinner" />
          <span>Cargando información del cliente...</span>
        </div>
      ) : (
        <>
          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">Nombre Completo</div>
              <div className="detail-value">
                {cliente.nombre} {cliente.apellidos}
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Identificación</div>
              <div className="detail-value">
                <span className="mono-code">{cliente.identificacion}</span>
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Teléfono</div>
              <div className="detail-value">{cliente.telefono}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Correo Electrónico</div>
              <div className="detail-value">{cliente.correo}</div>
            </div>
            <div className="detail-item full-width">
              <div className="detail-label">Dirección</div>
              <div className="detail-value" style={{ fontWeight: 400 }}>
                {cliente.direccion || 'No especificada.'}
              </div>
            </div>
          </div>

          <h4 className="detail-section-title">
            Historial de Vehículos Adquiridos ({cliente.ventas?.length || 0})
          </h4>

          {!cliente.ventas || cliente.ventas.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '13.5px' }}>
              Este cliente aún no registra compras de vehículos.
            </p>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Fecha Venta</th>
                    <th>Vehículo</th>
                    <th>VIN</th>
                    <th>Precio Venta (USD)</th>
                  </tr>
                </thead>
                <tbody>
                  {cliente.ventas.map((vt) => (
                    <tr key={vt.id_venta}>
                      <td>{formatDate(vt.fecha_venta)}</td>
                      <td className="cell-primary">
                        {vt.modelo_nombre} {vt.version} ({vt.anio})
                      </td>
                      <td>
                        <span className="mono-code">{vt.vin}</span>
                      </td>
                      <td className="price-tag">{formatUSD(vt.precio_venta)}</td>
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

