import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { progressManager } from "../utils/progressManager";

export default function Navbar() {
  const [showMenu, setShowMenu] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Cargar usuario desde localStorage o progressManager
  useEffect(() => {
    const savedUser = localStorage.getItem('cognify_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      // Usuario por defecto
      setUser({ name: "Usuario", email: "" });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('cognify_user');
    localStorage.removeItem('cognify_user_progress');
    setUser(null);
    navigate("/");
  };

  return (
    <nav style={navbarStyle}>
      <div style={containerStyle}>
        <Link to="/" style={logoStyle}>
          🧠 Cognify
        </Link>

        <div style={menuStyle}>
          <Link to="/dashboard" style={linkStyle}>Dashboard</Link>
          <Link to="/areas" style={linkStyle}>Áreas</Link>
          <Link to="/progreso" style={linkStyle}>Progreso</Link>
          
          {user ? (
            <div style={userContainerStyle}>
              <div style={userButtonStyle} onClick={() => setShowMenu(!showMenu)}>
                <div style={avatarStyle}>
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <span style={userNameStyle}>
                  {user.name || "Usuario"}
                </span>
                <span style={dropdownArrowStyle}>
                  {showMenu ? "▲" : "▼"}
                </span>
              </div>
              
              {showMenu && (
                <div style={dropdownMenuStyle}>
                  <Link to="/profile" style={dropdownItemStyle}>
                    👤 Mi Perfil
                  </Link>
                  <div style={dropdownDividerStyle}></div>
                  <button onClick={handleLogout} style={logoutItemStyle}>
                    🚪 Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" style={loginButtonStyle}>
              Iniciar Sesión
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

const navbarStyle = {
  backgroundColor: "#ffffff",
  boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  zIndex: 1000,
  padding: "12px 0"
};

const containerStyle = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "0 20px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const logoStyle = {
  fontSize: "1.6rem",
  fontWeight: "800",
  textDecoration: "none",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent"
};

const menuStyle = {
  display: "flex",
  gap: "30px",
  alignItems: "center"
};

const linkStyle = {
  textDecoration: "none",
  color: "#475569",
  fontWeight: "500",
  fontSize: "0.95rem",
  transition: "color 0.2s",
  ":hover": {
    color: "#667eea"
  }
};

const userContainerStyle = {
  position: "relative"
};

const userButtonStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  cursor: "pointer",
  padding: "6px 12px",
  borderRadius: "8px",
  backgroundColor: "#f1f5f9",
  transition: "background 0.2s",
  ":hover": {
    backgroundColor: "#e2e8f0"
  }
};

const avatarStyle = {
  width: "32px",
  height: "32px",
  borderRadius: "50%",
  backgroundColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "700",
  fontSize: "0.9rem"
};

const userNameStyle = {
  color: "#1e293b",
  fontWeight: "600",
  fontSize: "0.9rem"
};

const dropdownArrowStyle = {
  color: "#64748b",
  fontSize: "0.7rem"
};

const dropdownMenuStyle = {
  position: "absolute",
  top: "calc(100% + 8px)",
  right: 0,
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
  minWidth: "200px",
  padding: "8px 0",
  zIndex: 1001,
  border: "1px solid #e2e8f0"
};

const dropdownItemStyle = {
  display: "block",
  padding: "10px 16px",
  textDecoration: "none",
  color: "#1e293b",
  fontSize: "0.9rem",
  transition: "background 0.2s",
  ":hover": {
    backgroundColor: "#f1f5f9"
  }
};

const dropdownDividerStyle = {
  height: "1px",
  backgroundColor: "#e2e8f0",
  margin: "8px 0"
};

const logoutItemStyle = {
  width: "100%",
  padding: "10px 16px",
  border: "none",
  backgroundColor: "transparent",
  color: "#ef4444",
  fontSize: "0.9rem",
  cursor: "pointer",
  textAlign: "left",
  transition: "background 0.2s",
  ":hover": {
    backgroundColor: "#fef2f2"
  }
};

const loginButtonStyle = {
  padding: "8px 16px",
  border: "none",
  borderRadius: "8px",
  backgroundColor: "#667eea",
  color: "white",
  textDecoration: "none",
  fontWeight: "600",
  fontSize: "0.9rem",
  transition: "background 0.2s",
  ":hover": {
    backgroundColor: "#5568d3"
  }
};
