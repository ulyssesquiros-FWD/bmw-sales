import { useEffect, useState, useCallback } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, LogOut, UserCheck, Wrench, Calculator, BarChart3, Sparkles } from 'lucide-react';
import { BmwRoundel, BmwMEmblem } from '../common/BmwLogos';
import { dashboardService } from '../../services/dashboardService';
import { useAuth } from '../../context/AuthContext';

export default function Topbar({ onToggleSidebar }) {
  const { usuario, logout } = useAuth();
  const [health, setHealth] = useState({ checked: false, online: false });

  const checkApiHealth = useCallback(async () => {
    try {
      const res = await dashboardService.getHealth();
      setHealth({
        checked: true,
        online: Boolean(res?.ok && res?.database?.connected)
      });
    } catch {
      setHealth({ checked: true, online: false });
    }
  }, []);

  useEffect(() => {
    checkApiHealth();
    const interval = setInterval(checkApiHealth, 30000);
    return () => clearInterval(interval);
  }, [checkApiHealth]);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="menu-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Abrir menú lateral"
        >
          <Menu size={20} />
        </button>

        <Link to="/dashboard" className="topbar-brand-lockup">
          <BmwRoundel size={38} variant="classic" />
          <span className="topbar-divider" aria-hidden="true" />
          <div>
            <div className="topbar-dealership-name">
              <span>BMW Premium Motors</span>
              <BmwMEmblem height={14} />
            </div>
            <div className="topbar-slogan">
              Sheer Driving Pleasure • Showroom &amp; Gestión Corporativa
            </div>
          </div>
        </Link>

        <nav className="topbar-nav-links" aria-label="Accesos rápidos estilo BMW.com">
          <NavLink
            to="/modelos"
            className={({ isActive }) => `topbar-nav-item ${isActive ? 'active' : ''}`}
          >
            Modelos
          </NavLink>
          <NavLink
            to="/vehiculos"
            className={({ isActive }) => `topbar-nav-item ${isActive ? 'active' : ''}`}
          >
            Showroom
          </NavLink>
          <Link to="/vehiculos?serie=M" className="topbar-nav-item">
            <BmwMEmblem height={12} />
            <span>Gama M</span>
          </Link>
          <NavLink
            to="/taller"
            className={({ isActive }) => `topbar-nav-item ${isActive ? 'active' : ''}`}
          >
            <Wrench size={13} style={{ marginRight: '4px' }} />
            Taller ISTA+
          </NavLink>
          <NavLink
            to="/financiamiento"
            className={({ isActive }) => `topbar-nav-item ${isActive ? 'active' : ''}`}
          >
            <Calculator size={13} style={{ marginRight: '4px' }} />
            Financiamiento
          </NavLink>
          <NavLink
            to="/reportes"
            className={({ isActive }) => `topbar-nav-item ${isActive ? 'active' : ''}`}
          >
            <BarChart3 size={13} style={{ marginRight: '4px' }} />
            Analytics BI
          </NavLink>
          <NavLink
            to="/asistente-ia"
            className={({ isActive }) => `topbar-nav-item ${isActive ? 'active' : ''}`}
            style={{ color: '#38bdf8', fontWeight: 700 }}
          >
            <Sparkles size={13} style={{ marginRight: '4px' }} />
            Genius AI
          </NavLink>
        </nav>
      </div>

      <div className="topbar-right">
        <span className="currency-pill">USD ($)</span>

        {health.checked && (
          <button
            type="button"
            onClick={checkApiHealth}
            className={`health-pill ${health.online ? 'online' : 'offline'}`}
            title="Haga clic para volver a comprobar el estado de MySQL y la API"
          >
            <span className="health-dot" />
            <span>{health.online ? 'MySQL Activo' : 'MySQL Desconectado'}</span>
          </button>
        )}

        {usuario && (
          <div className="topbar-user-block">
            <div className="topbar-user-info">
              <div className="topbar-user-name">
                <UserCheck size={14} className="topbar-user-icon" />
                <span>{usuario.nombre}</span>
              </div>
              <div className="topbar-user-email">{usuario.correo}</div>
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-sm topbar-logout-btn"
              onClick={() => logout('Ha cerrado sesión correctamente.')}
              title="Cerrar sesión y limpiar token en memoria"
            >
              <LogOut size={15} />
              <span>Cerrar sesión</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
