import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import RutaProtegida from '../components/auth/RutaProtegida';
import MainLayout from '../components/layout/MainLayout';
import Login from '../pages/Login';
import Registro from '../pages/Registro';
import Dashboard from '../pages/Dashboard';
import Modelos from '../pages/Modelos';
import Vehiculos from '../pages/Vehiculos';
import Clientes from '../pages/Clientes';
import Vendedores from '../pages/Vendedores';
import Ventas from '../pages/Ventas';
import ReportesAnalytics from '../pages/ReportesAnalytics';
import AccesoriosM from '../pages/AccesoriosM';
import TallerMantenimiento from '../pages/TallerMantenimiento';
import FinanciamientoSimulador from '../pages/FinanciamientoSimulador';
import PruebasManejo from '../pages/PruebasManejo';
import SucursalesRed from '../pages/SucursalesRed';
import ServiciosEmpresariales from '../pages/ServiciosEmpresariales';
import NotFound from '../pages/NotFound';
import { useAuth } from '../context/AuthContext';

/**
 * Si el usuario ya está autenticado e intenta ingresar a /login o /registro,
 * lo redirige automáticamente al /dashboard.
 */
function RutaPublicaSoloInvitados() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Rutas públicas de autenticación */}
      <Route element={<RutaPublicaSoloInvitados />}>
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
      </Route>

      {/* Rutas privadas empresariales protegidas por JWT */}
      <Route element={<RutaProtegida />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Showroom & Ventas */}
          <Route path="/modelos" element={<Modelos />} />
          <Route path="/vehiculos" element={<Vehiculos />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/vendedores" element={<Vendedores />} />
          <Route path="/ventas" element={<Ventas />} />

          {/* Posventa & Servicios M */}
          <Route path="/taller" element={<TallerMantenimiento />} />
          <Route path="/accesorios" element={<AccesoriosM />} />
          <Route path="/pruebas-manejo" element={<PruebasManejo />} />

          {/* Finanzas & Red */}
          <Route path="/financiamiento" element={<FinanciamientoSimulador />} />
          <Route path="/sucursales" element={<SucursalesRed />} />

          {/* Inteligencia de Negocio & Ecosistema 360 */}
          <Route path="/reportes" element={<ReportesAnalytics />} />
          <Route path="/ecosistema" element={<ServiciosEmpresariales />} />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
}
