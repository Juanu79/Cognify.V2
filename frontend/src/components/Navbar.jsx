import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import LogoDash from "../assets/LogoDash.png";

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

  const displayName =
    user?.user_metadata?.full_name?.split(" ")[0] ||
    user?.user_metadata?.user_name ||
    user?.email?.split("@")[0] || "";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

        .navbar {
          position: fixed; top: 0; left: 0; width: 100%;
          background: #ffffff;
          box-shadow: 0 2px 16px rgba(0,0,0,0.07);
          z-index: 1000;
          font-family: 'Poppins', sans-serif;
        }
        .navbar-inner {
          max-width: 1200px; margin: 0 auto;
          display: flex; justify-content: space-between; align-items: center;
          padding: 0 24px; height: 64px;
          position: relative;
        }

        .nav-logo {
          display: flex; align-items: center; gap: 10px;
          text-decoration: none; flex-shrink: 0;
        }
        .nav-logo img {
          height: 40px; width: 40px;
          object-fit: cover; border-radius: 10px;
        }
        .nav-logo-text { font-size: 1.3rem; font-weight: 700; color: #7c3aed; }

        .nav-center {
          display: flex; align-items: center; gap: 4px;
          position: absolute; left: 50%; transform: translateX(-50%);
        }
        .nav-link {
          text-decoration: none; color: #475569;
          font-weight: 500; font-size: 0.95rem;
          padding: 8px 16px; border-radius: 10px;
          transition: background 0.2s, color 0.2s;
          white-space: nowrap;
        }
        .nav-link:hover  { background: #f1f5f9; color: #7c3aed; }
        .nav-link.active { color: #7c3aed; font-weight: 600; background: #ede9fe; }

        .salas-btn {
          display: inline-flex; align-items: center; gap: 6px;
          text-decoration: none;
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          color: #fff !important; font-weight: 600; font-size: 0.92rem;
          padding: 8px 18px; border-radius: 10px;
          transition: opacity 0.2s, transform 0.2s;
          box-shadow: 0 4px 12px rgba(124,58,237,0.3);
          white-space: nowrap;
        }
        .salas-btn:hover { opacity: 0.9; transform: translateY(-1px); }

        .nav-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
        .user-menu-wrap { position: relative; }

        .user-btn {
          display: flex; align-items: center; gap: 8px;
          background: none; border: none;
          padding: 4px 8px 4px 4px; border-radius: 50px;
          cursor: pointer; transition: background 0.2s;
          font-family: 'Poppins', sans-serif;
        }
        .user-btn:hover { background: #f1f5f9; }

        .user-avatar {
          width: 34px; height: 34px; border-radius: 50%;
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-weight: 700; font-size: 0.9rem;
          flex-shrink: 0; overflow: hidden;
        }
        .user-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .user-name  { font-weight: 600; color: #1e293b; font-size: 0.9rem; }
        .user-arrow { font-size: 0.65rem; color: #94a3b8; transition: transform 0.2s; }
        .user-arrow.open { transform: rotate(180deg); }

        .dropdown {
          position: absolute; top: calc(100% + 8px); right: 0;
          background: #fff; border-radius: 14px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.13);
          width: 220px; overflow: hidden;
          border: 1px solid #f1f5f9;
          animation: dropIn 0.18s ease;
          z-index: 999;
        }
        @keyframes dropIn {
          from { opacity:0; transform:translateY(-6px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .dd-header {
          padding: 14px 16px; background: #fafafa;
          border-bottom: 1px solid #f1f5f9;
        }
        .dd-header p      { font-size: 0.73rem; color: #94a3b8; margin-bottom: 2px; }
        .dd-header strong { font-size: 0.88rem; color: #1e293b; word-break: break-all; }

        .dd-item {
          display: flex; align-items: center; gap: 10px;
          padding: 11px 16px; text-decoration: none;
          color: #475569; font-size: 0.88rem; font-weight: 500;
          transition: background 0.15s, color 0.15s;
          border: none; background: none; width: 100%;
          text-align: left; cursor: pointer;
          font-family: 'Poppins', sans-serif;
        }
        .dd-item:hover        { background: #f8fafc; color: #7c3aed; }
        .dd-item.logout       { color: #ef4444; }
        .dd-item.logout:hover { background: #fee2e2; color: #dc2626; }
        .dd-divider { height: 1px; background: #f1f5f9; }

        .auth-btns { display: flex; gap: 10px; }
        .auth-outline {
          text-decoration: none; padding: 8px 16px;
          border-radius: 10px; font-weight: 600; font-size: 0.88rem;
          border: 1.5px solid #e2e8f0; color: #475569; transition: all 0.2s;
        }
        .auth-outline:hover { border-color: #7c3aed; color: #7c3aed; }
        .auth-fill {
          text-decoration: none; padding: 8px 16px;
          border-radius: 10px; font-weight: 600; font-size: 0.88rem;
          background: linear-gradient(135deg,#7c3aed,#6d28d9);
          color: #fff; border: none;
          box-shadow: 0 4px 12px rgba(124,58,237,0.28);
          transition: opacity 0.2s;
        }
        .auth-fill:hover { opacity: 0.9; }
      `}</style>

      <nav className="navbar">
        <div className="navbar-inner">

          <Link to="/dashboard" className="nav-logo">
            <img src={LogoDash} alt="Cognify" />
            <span className="nav-logo-text">Cognify</span>
          </Link>

          <div className="nav-center">
            <Link to="/dashboard" className={`nav-link${isActive("/dashboard") ? " active" : ""}`}>Dashboard</Link>
            <Link to="/areas"     className={`nav-link${isActive("/areas")     ? " active" : ""}`}>Áreas</Link>
            <Link to="/progreso"  className={`nav-link${isActive("/progreso")  ? " active" : ""}`}>Progreso</Link>
            <Link to="/salas"     className="salas-btn">🎮 Salas</Link>
          </div>

          <div className="nav-right">
            {user && (
              <div className="user-menu-wrap">
                <button className="user-btn" onClick={() => setShowMenu(!showMenu)}>
                  <div className="user-avatar">
                    {user.user_metadata?.avatar_url
                      ? <img src={user.user_metadata.avatar_url} alt="avatar" />
                      : displayName[0]?.toUpperCase()
                    }
                  </div>
                  <span className="user-name">{displayName}</span>
                  <span className={`user-arrow${showMenu ? " open" : ""}`}>▼</span>
                </button>

                {showMenu && (
                  <div className="dropdown">
                    <div className="dd-header">
                      <p>Conectado como</p>
                      <strong>{user.email}</strong>
                    </div>
                    <Link to="/profile"  className="dd-item" onClick={() => setShowMenu(false)}>👤 Perfil</Link>
                    <Link to="/progreso" className="dd-item" onClick={() => setShowMenu(false)}>📊 Mi Progreso</Link>
                    <Link to="/ranking"  className="dd-item" onClick={() => setShowMenu(false)}>🏆 Ranking</Link>
                    <Link to="/history"  className="dd-item" onClick={() => setShowMenu(false)}>📋 Historial</Link>
                    <div className="dd-divider" />
                    <button className="dd-item logout" onClick={handleLogout}>🚪 Cerrar sesión</button>
                  </div>
                )}
              </div>
            )}

            {!user && (
              <div className="auth-btns">
                <Link to="/"         className="auth-outline">Iniciar Sesión</Link>
                <Link to="/register" className="auth-fill">Registrarse</Link>
              </div>
            )}
          </div>

        </div>
      </nav>
    </>
  );
}