import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="card-panel">
      <div className="empty-state" style={{ padding: '64px 24px' }}>
        <div
          style={{
            fontSize: '42px',
            fontWeight: 800,
            color: '#1c69d4',
            lineHeight: 1
          }}
        >
          404
        </div>
        <h3>Página no encontrada</h3>
        <p>La ruta solicitada no existe dentro del sistema BMW Premium Motors.</p>
        <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: '10px' }}>
          <ArrowLeft size={16} />
          <span>Volver al Dashboard</span>
        </Link>
      </div>
    </div>
  );
}

