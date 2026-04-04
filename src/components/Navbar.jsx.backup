import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  // Cargar estado del usuario
  useEffect(() => {
    const loadUser = async () => {
      const { data: session, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Error al obtener sesión:", error);
        return;
      }
      
      if (session?.session) {
        setUser(session.session.user);
      } else {
        setUser(null);
      }
    };

    loadUser();
    
    // Suscribirse a cambios de autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Cerrar sesión
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate("/");
  };

  return (
    <nav style={navbarStyle}>
      <div style={containerStyle}>
        <Link to="/" style={logoStyle}>
          <span style={logoIcon}>🧠</span>
          <span style={logoText}>Cognify</span>
        </Link>

        <div style={navItems}>
          <Link to="/dashboard" style={navLink}>Dashboard</Link>
          <Link to="/areas" style={navLink}>Áreas</Link>
          <Link to="/progreso" style={navLink}>Progreso</Link>
          
          {user && (
            <div style={userMenuContainer}>
              <button 
                style={userButton}
                onClick={() => setShowMenu(!showMenu)}
                aria-label="Menú de usuario"
              >
                <span style={userName}>{user.email.split('@')[0]}</span>
                <span style={userIcon}>▼</span>
              </button>
              
              {showMenu && (
                <div style={userMenu}>
                  <Link to="/profile" style={userMenuItem}>
                    Configuración de Perfil
                  </Link>
                  <Link to="/history" style={userMenuItem}>
                    Historial de Actividad
                  </Link>
                  <button 
                    style={userMenuItem}
                    onClick={handleLogout}
                  >
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          )}
          
          {!user && (
            <div style={authButtons}>
              <Link to="/" style={authButton}>Iniciar Sesión</Link>
              <Link to="/register" style={authButton}>Registrarse</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

/* ====== ESTILOS ====== */

const navbarStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  background: "white",
  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  zIndex: 1000,
  padding: "15px 0"
};

const containerStyle = {
  maxWidth: "1200px",
  margin: "0 auto",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0 20px"
};

const logoStyle = {
  display: "flex",
  alignItems: "center",
  textDecoration: "none",
  color: "#2563eb"
};

const logoIcon = {
  fontSize: "1.8rem",
  marginRight: "10px"
};

const logoText = {
  fontSize: "1.6rem",
  fontWeight: "700"
};

const navItems = {
  display: "flex",
  alignItems: "center",
  gap: "25px"
};

const navLink = {
  textDecoration: "none",
  color: "#475569",
  fontWeight: "500",
  fontSize: "1rem",
  transition: "all 0.3s",
  padding: "8px 0",
  position: "relative"
};

const navLinkHover = {
  color: "#2563eb"
};

const navLinkActive = {
  color: "#2563eb",
  fontWeight: "600"
};

const navLinkActiveAfter = {
  content: '""',
  position: "absolute",
  bottom: 0,
  left: 0,
  width: "100%",
  height: "3px",
  background: "#2563eb"
};

const authButtons = {
  display: "flex",
  gap: "15px"
};

const authButton = {
  textDecoration: "none",
  padding: "8px 18px",
  borderRadius: "8px",
  fontWeight: "500",
  fontSize: "1rem",
  transition: "all 0.3s",
  border: "1px solid #e2e8f0"
};

const authButtonHover = {
  backgroundColor: "#f8fafc"
};

const authButtonPrimary = {
  backgroundColor: "#2563eb",
  color: "white",
  borderColor: "#2563eb"
};

const authButtonPrimaryHover = {
  backgroundColor: "#1d4ed8"
};

const userMenuContainer = {
  position: "relative"
};

const userButton = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  background: "none",
  border: "none",
  padding: "8px 12px",
  borderRadius: "8px",
  cursor: "pointer",
  transition: "all 0.3s"
};

const userButtonHover = {
  backgroundColor: "#f8fafc"
};

const userName = {
  fontWeight: "500",
  color: "#1e293b"
};

const userIcon = {
  fontSize: "0.8rem"
};

const userMenu = {
  position: "absolute",
  top: "100%",
  right: 0,
  background: "white",
  borderRadius: "12px",
  boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
  width: "250px",
  marginTop: "10px",
  overflow: "hidden",
  zIndex: 100
};

const userMenuItem = {
  display: "block",
  padding: "12px 18px",
  textDecoration: "none",
  color: "#475569",
  fontWeight: "500",
  fontSize: "1rem",
  transition: "all 0.3s",
  border: "none",
  background: "none",
  width: "100%",
  textAlign: "left"
};

const userMenuItemHover = {
  backgroundColor: "#f8fafc",
  color: "#2563eb"
};