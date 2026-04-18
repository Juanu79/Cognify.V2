import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import CognifyLogo from "../assets/CognifyLogo.png";

export default function Navbar() {
  const [user,     setUser]     = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();

  useEffect(() => {
    const loadUser = async () => {
      const { data: session } = await supabase.auth.getSession();
      setUser(session?.session?.user || null);
    };
    loadUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
    });

    // Cerrar menú al hacer click fuera
    const handleClickOutside = (e) => {
      if (!e.target.closest(".user-menu-wrap")) setShowMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      authListener.subscription.unsubscribe();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setShowMenu(false);
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

        .navbar {
          position: fixed; top: 0; left: 0; width: 100%;
          background: #fff;
          box-shadow: 0 2px 16px rgba(0,0,0,0.08);
          z-index: 1000;
          font-family: 'Poppins', sans-serif;
        }

        .navbar-inner {
          max-width: 1200px; margin: 0 auto;
          display: flex; justify-content: space-between; align-items: center;
          padding: 10px 24px;
        }

        /* ── Logo ── */
        .nav-logo {
          display: flex; align-items: center; gap: 10px;
          text-decoration: none;
        }
        .nav-logo img {
          height: 42px; width: auto; object-fit: contain;
        }
        .nav-logo-text {
          font-size: 1.4rem; font-weight: 700;
          background: linear-gradient(135deg, #7c3aed, #2563eb);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }

        /* ── Links ── */
        .nav-links {
          display: flex; align-items: center; gap: 8px;
        }

        .nav-link {
          text-decoration: none; color: #475569;
          font-weight: 500; font-size: 0.95rem;
          padding: 8px 14px; border-radius: 10px;
          transition: background 0.2s, color 0.2s;
          position: relative;
        }
        .nav-link:hover { background: #f1f5f9; color: #7c3aed; }
        .nav-link.active {
          color: #7c3aed; font-weight: 600;
          background: #ede9fe;
        }

        /* ── Salas badge ── */
        .nav-link.salas-link {
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          color: #fff !important; font-weight: 600;
          display: flex; align-items: center; gap: 6px;
        }
        .nav-link.salas-link:hover { opacity: 0.9; background: linear-gradient(135deg, #6d28d9, #5b21b6); }

        /* ── User menu ── */
        .user-menu-wrap { position: relative; }

        .user-btn {
          display: flex; align-items: center; gap: 8px;
          background: #f8fafc; border: 1px solid #e2e8f0;
          padding: 8px 14px; border-radius: 10px;
          cursor: pointer; transition: all 0.2s;
          font-family: 'Poppins', sans-serif;
        }
        .user-btn:hover { background: #ede9fe; border-color: #7c3aed; }

        .user-avatar {
          width: 30px; height: 30px; border-radius: 50%;
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-weight: 700; font-size: 0.85rem;
          flex-shrink: 0;
        }
        .user-name { font-weight: 600; color: #1e293b; font-size: 0.9rem; }
        .user-chevron {
          font-size: 0.7rem; color: #94a3b8;
          transition: transform 0.2s;
        }
        .user-chevron.open { transform: rotate(180deg); }

        .dropdown {
          position: absolute; top: calc(100% + 8px); right: 0;
          background: #fff; border-radius: 14px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          width: 220px; overflow: hidden;
          border: 1px solid #f1f5f9;
          animation: dropIn 0.18s ease;
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .dropdown-header {
          padding: 14px 16px;
          border-bottom: 1px solid #f1f5f9;
          background: #fafafa;
        }
        .dropdown-header p { font-size: 0.75rem; color: #94a3b8; margin-bottom: 2px; }
        .dropdown-header strong { font-size: 0.9rem; color: #1e293b; }

        .dropdown-item {
          display: flex; align-items: center; gap: 10px;
          padding: 11px 16px; text-decoration: none;
          color: #475569; font-size: 0.9rem; font-weight: 500;
          transition: background 0.15s, color 0.15s;
          border: none; background: none; width: 100%;
          text-align: left; cursor: pointer;
          font-family: 'Poppins', sans-serif;
        }
        .dropdown-item:hover { background: #f8fafc; color: #7c3aed; }
        .dropdown-item.logout { color: #ef4444; }
        .dropdown-item.logout:hover { background: #fee2e2; color: #dc2626; }
        .dropdown-divider { height: 1px; background: #f1f5f9; }

        /* ── Auth buttons ── */
        .auth-btns { display: flex; gap: 10px; }
        .auth-btn {
          text-decoration: none; padding: 8px 18px;
          border-radius: 10px; font-weight: 600; font-size: 0.9rem;
          transition: all 0.2s; font-family: 'Poppins', sans-serif;
        }
        .auth-btn-outline {
          border: 1.5px solid #e2e8f0; color: #475569; background: #fff;
        }
        .auth-btn-outline:hover { border-color: #7c3aed; color: #7c3aed; }
        .auth-btn-fill {
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          color: #fff; border: none;
          box-shadow: 0 4px 12px rgba(124,58,237,0.3);
        }
        .auth-btn-fill:hover { opacity: 0.9; }
      `}</style>

      <nav className="navbar">
        <div className="navbar-inner">

          {/* Logo */}
          <Link to="/dashboard" className="nav-logo">
            <img src={CognifyLogo} alt="Cognify Logo" />
            <span className="nav-logo-text">Cognify</span>
          </Link>

          {/* Links */}
          <div className="nav-links">
            <Link to="/dashboard" className={`nav-link${isActive("/dashboard") ? " active" : ""}`}>
              Dashboard
            </Link>
            <Link to="/areas" className={`nav-link${isActive("/areas") ? " active" : ""}`}>
              Áreas
            </Link>
            <Link to="/progreso" className={`nav-link${isActive("/progreso") ? " active" : ""}`}>
              Progreso
            </Link>
            <Link to="/salas" className="nav-link salas-link">
              🎮 Salas
            </Link>

            {/* Usuario autenticado */}
            {user && (
              <div className="user-menu-wrap">
                <button className="user-btn" onClick={() => setShowMenu(!showMenu)}>
                  {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="avatar"
                      style={{ width:30, height:30, borderRadius:"50%", objectFit:"cover" }}
                    />
                  ) : (
                    <div className="user-avatar">
                      {(user.user_metadata?.full_name || user.email)[0].toUpperCase()}
                    </div>
                  )}
                  <span className="user-name">
                    {user.user_metadata?.full_name?.split(" ")[0] ||
                     user.user_metadata?.user_name ||
                     user.email.split("@")[0]}
                  </span>
                  <span className={`user-chevron${showMenu ? " open" : ""}`}>▼</span>
                </button>

                {showMenu && (
                  <div className="dropdown">
                    <div className="dropdown-header">
                      <p>Conectado como</p>
                      <strong>{user.email}</strong>
                    </div>

                    <Link to="/profile" className="dropdown-item" onClick={() => setShowMenu(false)}>
                      👤 Perfil
                    </Link>
                    <Link to="/history" className="dropdown-item" onClick={() => setShowMenu(false)}>
                      📋 Historial
                    </Link>
                    <Link to="/ranking" className="dropdown-item" onClick={() => setShowMenu(false)}>
                      🏆 Ranking
                    </Link>

                    <div className="dropdown-divider" />

                    <button className="dropdown-item logout" onClick={handleLogout}>
                      🚪 Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* No autenticado */}
            {!user && (
              <div className="auth-btns">
                <Link to="/" className="auth-btn auth-btn-outline">Iniciar Sesión</Link>
                <Link to="/register" className="auth-btn auth-btn-fill">Registrarse</Link>
              </div>
            )}
          </div>

        </div>
      </nav>
    </>
  );
}