import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Protege todas las rutas empresariales de BMW Premium Motors.
 * Si no existe una sesión válida en memoria, redirige inmediatamente a /login
 * evitando que se monte o muestre cualquier vista de información comercial.
 */
export default function RutaProtegida() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
}

