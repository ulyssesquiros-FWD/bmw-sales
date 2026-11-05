import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  CarFront,
  Users,
  Briefcase,
  BadgeDollarSign,
  Wrench,
  Sparkles,
  Compass,
  Calculator,
  Building2,
  BarChart3,
  ShieldCheck,
  Cpu,
  LogOut
} from 'lucide-react';
import { BmwRoundel, BmwMEmblem } from '../common/BmwLogos';
import { useAuth } from '../../context/AuthContext';

const NAV_GROUPS = [
  {
    titulo: 'Showroom & Comercial',
    items: [
      { to: '/dashboard', label: 'Showroom & Dashboard', icon: LayoutDashboard, end: true },
      { to: '/modelos', label: 'Modelos BMW & ///M', icon: Layers },
      { to: '/vehiculos', label: 'Inventario & 360°', icon: CarFront },
      { to: '/clientes', label: 'Clientes VIP', icon: Users },
      { to: '/vendedores', label: 'Asesores BMW', icon: Briefcase },
      { to: '/ventas', label: 'Operaciones de Venta', icon: BadgeDollarSign }
    ]
  },
  {
    titulo: 'Posventa & Servicios M',
    items: [
      { to: '/taller', label: 'Taller & Bahías ISTA+', icon: Wrench },
      { to: '/accesorios', label: 'Boutique M Performance', icon: Sparkles },
      { to: '/pruebas-manejo', label: 'Pruebas de Manejo VIP', icon: Compass }
    ]
  },
  {
    titulo: 'Finanzas & Red Oficial',
    items: [
      { to: '/financiamiento', label: 'Simulador Financiero', icon: Calculator },
      { to: '/sucursales', label: 'Red de Concesionarios', icon: Building2 }
    ]
  },
  {
    titulo: 'Inteligencia & BI',
    items: [
      { to: '/asistente-ia', label: 'BMW Genius AI (DeepSeek)', icon: Cpu },
      { to: '/reportes', label: 'Reportes & Analytics BI', icon: BarChart3 },
      { to: '/ecosistema', label: 'Ecosistema Integral 360°', icon: ShieldCheck }
    ]
  }
];

export default function Sidebar({ isOpen, onClose }) {
  const { usuario, logout } = useAuth();

  const handleSidebarLogout = () => {
    onClose();
    logout('Ha cerrado sesión correctamente.');
  };

  return (
    <>
      <div
        className={`sidebar-backdrop ${isOpen ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-row">
            <BmwRoundel size={42} variant="classic" />
            <div>
              <div className="sidebar-brand-title">BMW Premium Motors</div>
              <div className="sidebar-brand-subtitle">
                <span>Concesionario Oficial</span>
                <BmwMEmblem height={11} />
              </div>
            </div>
          </div>
          <div className="m-stripe-bar" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Navegación principal">
          {NAV_GROUPS.map((group) => (
            <div key={group.titulo} style={{ marginBottom: '0.85rem' }}>
              <div className="sidebar-section-label">{group.titulo}</div>
              {group.items.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={onClose}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <Icon size={17} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <Link to="/vehiculos?serie=M" onClick={onClose} className="sidebar-m-Promo">
          <BmwMEmblem height={15} />
          <div className="sidebar-m-Promo-title">Gama BMW M &amp; X5 M 2012</div>
          <div className="sidebar-m-Promo-sub">
            Explorar versiones M Competition y Mención Especial E70 →
          </div>
        </Link>

        <div className="sidebar-footer">
          {usuario && (
            <div className="sidebar-user-summary">
              <div className="sidebar-user-name">{usuario.nombre}</div>
              <div className="sidebar-user-email">{usuario.correo}</div>
              <button
                type="button"
                className="sidebar-logout-btn"
                onClick={handleSidebarLogout}
              >
                <LogOut size={14} />
                <span>Cerrar sesión</span>
              </button>
            </div>
          )}
          <strong>EL PLACER DE CONDUCIR</strong>
          <span>BMW Premium Motors • Precios en USD</span>
        </div>
      </aside>
    </>
  );
}
