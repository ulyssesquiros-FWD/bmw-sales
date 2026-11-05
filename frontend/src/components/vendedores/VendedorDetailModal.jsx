import Modal from '../common/Modal';
import { formatUSD, formatDate } from '../../utils/formatters';

export default function VendedorDetailModal({ isOpen, onClose, vendedor, loading = false }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        vendedor
          ? `Perfil de Asesor: ${vendedor.nombre} ${vendedor.apellidos}`
          : 'Detalle del Vendedor'
      }
      size="lg"
      footer={
        <button type="button" className="btn btn-primary" onClick={onClose}>
          Cerrar
        </button>
      }
    >
      {loading || !vendedor ? (
        <div className="loading-state">
          <div className="spinner" />
          <span>Cargando perfil comercial...</span>
        </div>
      ) : (
        <>
          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">Nombre Completo</div>
              <div className="detail-value">
                {vendedor.nombre} {vendedor.apellidos}
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Fecha de Contratación</div>
              <div className="detail-value">{formatDate(vendedor.fecha_contratacion)}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Teléfono</div>
              <div className="detail-value">{vendedor.telefono}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Correo Corporativo</div>
              <div className="detail-value">{vendedor.correo}</div>
            </div>
          </div>

          <h4 className="detail-section-title">
            Operaciones de Venta Gestionadas ({vendedor.ventas?.length || 0})
          </h4>

          {!vendedor.ventas || vendedor.ventas.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '13.5px' }}>
              Este asesor aún no registra operaciones de venta cerradas.
            </p>
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
                  {vendedor.ventas.map((vt) => (
                    <tr key={vt.id_venta}>
                      <td>{formatDate(vt.fecha_venta)}</td>
                      <td className="cell-primary">
                        {vt.modelo_nombre} {vt.version} ({vt.anio})
                      </td>
                      <td>{vt.cliente_nombre_completo}</td>
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

