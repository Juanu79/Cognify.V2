import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';

// Estilos como objeto JavaScript
const styles = {
  navbar: {
    background: 'linear-gradient(135deg, #1e1e2f, #2d2d44)',
    color: '#fff',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    borderBottom: '2px solid rgba(79, 70, 229, 0.5)',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '15px 25px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
    color: '#fff',
    fontSize: '1.8rem',
    fontWeight: '800',
    letterSpacing: '-0.5px',
  },
  logoIcon: {
    fontSize: '2.2rem',
    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
  },
  logoText: {
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed, #ff7675)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  linksContainer: {
    display: 'flex',
    gap: '30px',
    alignItems: 'center',
  },
  link: {
    color: '#e0e0ff',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '1rem',
    padding: '10px 16px',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  linkHover: {
    color: '#fff',
    background: 'rgba(255, 255, 255, 0.1)',
    transform: 'translateY(-2px)',
  },
  linkActive: {
    color: '#fff',
    background: 'rgba(79, 70, 229, 0.4)',
    boxShadow: 'inset 0 0 15px rgba(79, 70, 229, 0.6)',
    border: '2px solid #4f46e5',
  },
  linkIcon: {
    fontSize: '1.1rem',
  },
  logoutButton: {
    background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.95rem',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 10px rgba(231, 76, 60, 0.3)',
  },
  logoutButtonHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 15px rgba(231, 76, 60, 0.4)',
    background: 'linear-gradient(135deg, #c0392b, #a93226)',
  },
  logoutButtonActive: {
    transform: 'translateY(0)',
    boxShadow: '0 2px 5px rgba(231, 76, 60, 0.3)',
  },
  mobileMenuButton: {
    display: 'none',
    background: 'none',
    border: 'none',
    color: '#fff',
    fontSize: '1.8rem',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '6px',
    transition: 'all 0.3s ease',
  },
  mobileMenuButtonHover: {
    background: 'rgba(255, 255, 255, 0.1)',
  },
  mobileMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    background: 'linear-gradient(135deg, #1e1e2f, #2d2d44)',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    borderTop: '2px solid rgba(79, 70, 229, 0.5)',
  },
  userContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  userAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: '#4f46e5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '1.1rem',
    color: '#fff',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
  },
  userName: {
    fontSize: '0.95rem',
    fontWeight: '500',
    color: '#e0e0ff',
  },
  badge: {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    background: '#ff7675',
    color: '#fff',
    fontSize: '0.7rem',
    fontWeight: '700',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #1e1e2f',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
  },
  progressBar: {
    height: '4px',
    background: 'rgba(255, 255, 255, 0.1)',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  progressBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #4f46e5, #7c3aed)',
    transition: 'width 0.5s ease',
  },
};

// Mapeo de rutas con iconos y nombres
const navItems = [
  { path: '/dashboard', icon: '🏠', label: 'Inicio' },
  { path: '/areas', icon: '📚', label: 'Áreas' },
  { path: '/progreso', icon: '📊', label: 'Progreso' },
];

// Componente NavLink personalizado
function NavLink({ to, icon, label, isActive, onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      to={to}
      style={{
        ...styles.link,
        ...(isActive ? styles.linkActive : {}),
        ...(isHovered && !isActive ? styles.linkHover : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
    >
      <span style={styles.linkIcon} aria-hidden="true">
        {icon}
      </span>
      {label}
    </Link>
  );
}

export default function Navbar({ user, onLogout, progress = 0, showProgressBar = false }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogoutHovered, setIsLogoutHovered] = useState(false);
  const [isLogoutActive, setIsLogoutActive] = useState(false);
  const [isMenuButtonHovered, setIsMenuButtonHovered] = useState(false);

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Detectar click fuera del menú móvil
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('.navbar-container')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    if (onLogout) {
      await onLogout();
    } else {
      localStorage.removeItem('user');
      navigate('/');
    }
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const getInitials = (name) => {
    if (!name) return '👤';
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
  };

  // Verificar si la ruta actual es la activa
  const isActive = (path) => {
    if (path === '/') return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <nav style={styles.navbar} className="navbar-container" aria-label="Navegación principal">
      <div style={styles.container}>
        {/* Logo */}
        <Link
          to="/dashboard"
          style={{
            ...styles.logo,
          }}
          aria-label="Ir a inicio - Cognify"
        >
          <span style={styles.logoIcon} aria-hidden="true">
            🧠
          </span>
          <span style={styles.logoText}>Cognify</span>
        </Link>

        {/* Botón de menú móvil */}
        <button
          style={{
            ...styles.mobileMenuButton,
            ...(isMenuButtonHovered ? styles.mobileMenuButtonHover : {}),
          }}
          onClick={handleMobileMenuToggle}
          onMouseEnter={() => setIsMenuButtonHovered(true)}
          onMouseLeave={() => setIsMenuButtonHovered(false)}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label="Menú de navegación"
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>

        {/* Links de navegación - Desktop */}
        <div style={styles.linksContainer} id="desktop-links">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              icon={item.icon}
              label={item.label}
              isActive={isActive(item.path)}
            />
          ))}
        </div>

        {/* Información del usuario y logout */}
        {user && (
          <div style={styles.userContainer}>
            {/* Avatar del usuario */}
            <div style={styles.userAvatar} aria-label={`Usuario: ${user.name}`}>
              {getInitials(user.name)}
            </div>

            {/* Nombre del usuario */}
            <span style={styles.userName}>{user.name}</span>

            {/* Botón de logout */}
            <button
              onClick={handleLogout}
              style={{
                ...styles.logoutButton,
                ...(isLogoutHovered && !isLogoutActive ? styles.logoutButtonHover : {}),
                ...(isLogoutActive ? styles.logoutButtonActive : {}),
              }}
              onMouseEnter={() => setIsLogoutHovered(true)}
              onMouseLeave={() => setIsLogoutHovered(false)}
              onMouseDown={() => setIsLogoutActive(true)}
              onMouseUp={() => setIsLogoutActive(false)}
              aria-label="Cerrar sesión"
            >
              <span aria-hidden="true">🚪</span>
              Salir
            </button>
          </div>
        )}

        {/* Menú móvil - Solo visible en móviles */}
        {isMobileMenuOpen && (
          <div style={styles.mobileMenu} id="mobile-menu" role="menu">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                icon={item.icon}
                label={item.label}
                isActive={isActive(item.path)}
                onClick={() => setIsMobileMenuOpen(false)}
              />
            ))}
            
            {user && (
              <>
                <div style={{ 
                  height: '1px', 
                  background: 'rgba(255, 255, 255, 0.1)', 
                  margin: '10px 0' 
                }} />
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={styles.userAvatar}>
                    {getInitials(user.name)}
                  </div>
                  <span style={{ color: '#fff', fontWeight: '500' }}>
                    {user.name}
                  </span>
                </div>
                
                <button
                  onClick={handleLogout}
                  style={{
                    ...styles.logoutButton,
                    width: '100%',
                    justifyContent: 'center',
                  }}
                  aria-label="Cerrar sesión"
                >
                  <span aria-hidden="true">🚪</span>
                  Cerrar sesión
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Barra de progreso (opcional) */}
      {showProgressBar && (
        <div style={styles.progressBar}>
          <div
            style={{
              ...styles.progressBarFill,
              width: `${progress}%`,
            }}
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            role="progressbar"
          ></div>
        </div>
      )}
    </nav>
  );
}