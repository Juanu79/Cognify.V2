import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

const TABS = ["overview", "usuarios", "salas"];
const TAB_LABELS = { overview: "General", usuarios: " Usuarios", salas: " Partidas" };

export default function AdminDashboard({ user }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  // Data states
  const [stats, setStats] = useState({ totalUsuarios: 0, activosHoy: 0, partidasHoy: 0, retosCompletados: 0 });
  const [usuarios, setUsuarios] = useState([]);
  const [salas, setSalas] = useState([]);
  const [actividadDias, setActividadDias] = useState([]);
  const [searchUsuario, setSearchUsuario] = useState("");
  const [modalUsuario, setModalUsuario] = useState(null);
  const [adminNombre, setAdminNombre] = useState("");

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([cargarStats(), cargarUsuarios(), cargarSalas(), cargarActividad()]);
      // Cargar nombre del admin
      const { data } = await supabase.from("admins").select("nombre").eq("email", user.email).single();
      if (data) setAdminNombre(data.nombre);
      setLoading(false);
    };
    init();
  }, []);

  const cargarStats = async () => {
    const hoy = new Date().toISOString().split("T")[0];

    const { count: totalUsuarios } = await supabase.from("usuarios").select("*", { count: "exact", head: true });
    const { count: activosHoy } = await supabase.from("usuarios").select("*", { count: "exact", head: true }).gte("ultimo_login", hoy);
    const { count: partidasHoy } = await supabase.from("salas").select("*", { count: "exact", head: true }).gte("created_at", hoy);
    const { count: retosCompletados } = await supabase.from("progreso").select("*", { count: "exact", head: true }).eq("completado", true);

    setStats({
      totalUsuarios: totalUsuarios || 0,
      activosHoy: activosHoy || 0,
      partidasHoy: partidasHoy || 0,
      retosCompletados: retosCompletados || 0,
    });
  };

  const cargarUsuarios = async () => {
    const { data } = await supabase
      .from("usuarios")
      .select("id, nombre, email, xp, nivel, racha, ultimo_login, created_at")
      .order("xp", { ascending: false });
    setUsuarios(data || []);
  };

  const cargarSalas = async () => {
    const { data } = await supabase
      .from("salas")
      .select(`id, codigo, estado, created_at, areas(nombre)`)
      .order("created_at", { ascending: false })
      .limit(50);
    setSalas(data || []);
  };

  const cargarActividad = async () => {
    const dias = [];
    for (let i = 6; i >= 0; i--) {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - i);
      const fechaStr = fecha.toISOString().split("T")[0];
      const { count } = await supabase
        .from("usuarios")
        .select("*", { count: "exact", head: true })
        .gte("ultimo_login", fechaStr)
        .lt("ultimo_login", new Date(fecha.getTime() + 86400000).toISOString().split("T")[0]);
      dias.push({ fecha: fechaStr, label: fecha.toLocaleDateString("es", { weekday: "short" }), count: count || 0 });
    }
    setActividadDias(dias);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const eliminarUsuario = async (id) => {
    if (!confirm("¿Eliminar este usuario?")) return;
    await supabase.from("usuarios").delete().eq("id", id);
    setUsuarios(prev => prev.filter(u => u.id !== id));
    setModalUsuario(null);
  };

  const usuariosFiltrados = usuarios.filter(u =>
    u.nombre?.toLowerCase().includes(searchUsuario.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchUsuario.toLowerCase())
  );

  const maxActividad = Math.max(...actividadDias.map(d => d.count), 1);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#080b14", fontFamily: "'DM Mono', monospace" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 48, height: 48, border: "3px solid #00ff88", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
        <p style={{ color: "#00ff88", fontSize: "0.85rem", letterSpacing: "0.15em" }}>CARGANDO PANEL...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #080b14;
          --bg2: #0d1220;
          --bg3: #121829;
          --border: rgba(255,255,255,0.07);
          --green: #00ff88;
          --blue: #4d9fff;
          --purple: #a855f7;
          --orange: #ff6b35;
          --text: #e2e8f0;
          --muted: #64748b;
          --font-mono: 'DM Mono', monospace;
          --font-display: 'Syne', sans-serif;
        }

        .admin-root {
          min-height: 100vh;
          background: var(--bg);
          color: var(--text);
          font-family: var(--font-mono);
          display: flex;
        }

        /* ── SIDEBAR ── */
        .sidebar {
          width: 220px;
          background: var(--bg2);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          padding: 28px 16px;
          position: fixed;
          top: 0; left: 0;
          height: 100vh;
          z-index: 100;
        }

        .sidebar-logo {
          font-family: var(--font-display);
          font-size: 1.3rem;
          font-weight: 800;
          color: var(--green);
          letter-spacing: -0.02em;
          margin-bottom: 6px;
          padding: 0 8px;
        }

        .sidebar-badge {
          font-size: 0.65rem;
          letter-spacing: 0.12em;
          color: var(--muted);
          text-transform: uppercase;
          padding: 0 8px;
          margin-bottom: 32px;
        }

        .sidebar-nav { display: flex; flex-direction: column; gap: 4px; flex: 1; }

        .nav-btn {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 8px;
          background: none; border: none;
          color: var(--muted); font-size: 0.82rem;
          font-family: var(--font-mono);
          cursor: pointer; text-align: left;
          transition: all 0.15s;
          letter-spacing: 0.02em;
        }
        .nav-btn:hover { background: var(--bg3); color: var(--text); }
        .nav-btn.active { background: rgba(0,255,136,0.08); color: var(--green); border: 1px solid rgba(0,255,136,0.15); }

        .sidebar-user {
          border-top: 1px solid var(--border);
          padding-top: 16px;
          margin-top: auto;
        }
        .sidebar-user-name { font-size: 0.78rem; color: var(--text); font-weight: 500; margin-bottom: 2px; }
        .sidebar-user-email { font-size: 0.68rem; color: var(--muted); margin-bottom: 12px; word-break: break-all; }

        .btn-logout {
          width: 100%; padding: 8px 12px; border-radius: 8px;
          background: rgba(255,107,53,0.1); border: 1px solid rgba(255,107,53,0.2);
          color: var(--orange); font-size: 0.75rem; font-family: var(--font-mono);
          cursor: pointer; transition: all 0.15s; letter-spacing: 0.05em;
        }
        .btn-logout:hover { background: rgba(255,107,53,0.2); }

        /* ── MAIN ── */
        .main {
          margin-left: 220px;
          flex: 1;
          padding: 32px;
          min-height: 100vh;
        }

        .page-header {
          margin-bottom: 32px;
          animation: fadeUp 0.4s ease both;
        }
        .page-title {
          font-family: var(--font-display);
          font-size: 1.8rem;
          font-weight: 800;
          color: var(--text);
          margin-bottom: 4px;
        }
        .page-sub { font-size: 0.78rem; color: var(--muted); letter-spacing: 0.05em; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── STAT CARDS ── */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 28px;
          animation: fadeUp 0.4s ease 0.05s both;
        }

        .stat-card {
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 20px;
          position: relative;
          overflow: hidden;
        }
        .stat-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
        }
        .stat-card.green::before { background: var(--green); }
        .stat-card.blue::before  { background: var(--blue); }
        .stat-card.purple::before { background: var(--purple); }
        .stat-card.orange::before { background: var(--orange); }

        .stat-label { font-size: 0.7rem; color: var(--muted); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 10px; }
        .stat-value { font-family: var(--font-display); font-size: 2rem; font-weight: 800; }
        .stat-value.green  { color: var(--green); }
        .stat-value.blue   { color: var(--blue); }
        .stat-value.purple { color: var(--purple); }
        .stat-value.orange { color: var(--orange); }

        /* ── GRID 2 cols ── */
        .grid2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          animation: fadeUp 0.4s ease 0.1s both;
        }

        .panel {
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 20px;
        }
        .panel-title {
          font-size: 0.72rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 20px;
          font-weight: 500;
        }

        /* ── CHART ── */
        .chart-bars {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          height: 120px;
        }
        .chart-bar-wrap {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          height: 100%;
          justify-content: flex-end;
        }
        .chart-bar {
          width: 100%;
          background: rgba(0,255,136,0.15);
          border-radius: 4px 4px 0 0;
          border-top: 2px solid var(--green);
          transition: height 0.6s ease;
          min-height: 4px;
        }
        .chart-label { font-size: 0.65rem; color: var(--muted); text-transform: capitalize; }
        .chart-count { font-size: 0.7rem; color: var(--green); font-weight: 500; }

        /* ── TOP USUARIOS ── */
        .top-list { display: flex; flex-direction: column; gap: 10px; }
        .top-item {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 12px; border-radius: 8px;
          background: var(--bg3);
          border: 1px solid var(--border);
        }
        .top-rank { font-size: 0.75rem; color: var(--muted); width: 20px; text-align: center; }
        .top-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: linear-gradient(135deg, var(--green), var(--blue));
          display: flex; align-items: center; justify-content: center;
          font-size: 0.8rem; font-weight: 700; color: #000; flex-shrink: 0;
        }
        .top-name { flex: 1; font-size: 0.82rem; color: var(--text); }
        .top-xp { font-size: 0.75rem; color: var(--green); font-weight: 500; }

        /* ── TABLA USUARIOS ── */
        .search-bar {
          width: 100%; padding: 10px 14px;
          background: var(--bg3); border: 1px solid var(--border);
          border-radius: 8px; color: var(--text);
          font-size: 0.82rem; font-family: var(--font-mono);
          outline: none; margin-bottom: 16px;
          transition: border-color 0.2s;
        }
        .search-bar:focus { border-color: var(--green); }
        .search-bar::placeholder { color: var(--muted); }

        .table-wrap { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; font-size: 0.78rem; }
        thead th {
          text-align: left; padding: 10px 12px;
          color: var(--muted); font-weight: 500;
          font-size: 0.68rem; letter-spacing: 0.1em; text-transform: uppercase;
          border-bottom: 1px solid var(--border);
        }
        tbody tr {
          border-bottom: 1px solid var(--border);
          transition: background 0.15s;
          cursor: pointer;
        }
        tbody tr:hover { background: var(--bg3); }
        tbody td { padding: 12px; color: var(--text); }

        .nivel-badge {
          background: rgba(77,159,255,0.12);
          color: var(--blue); padding: 2px 8px;
          border-radius: 20px; font-size: 0.7rem; font-weight: 500;
        }
        .xp-text { color: var(--green); font-weight: 500; }
        .date-text { color: var(--muted); font-size: 0.72rem; }

        .btn-delete {
          background: rgba(255,107,53,0.1); border: 1px solid rgba(255,107,53,0.2);
          color: var(--orange); padding: 4px 10px; border-radius: 6px;
          font-size: 0.7rem; font-family: var(--font-mono);
          cursor: pointer; transition: all 0.15s;
        }
        .btn-delete:hover { background: rgba(255,107,53,0.25); }

        /* ── SALAS TABLE ── */
        .estado-badge {
          padding: 2px 10px; border-radius: 20px;
          font-size: 0.7rem; font-weight: 500;
        }
        .estado-badge.espera   { background: rgba(255,193,7,0.1);  color: #ffc107; }
        .estado-badge.jugando  { background: rgba(0,255,136,0.1);  color: var(--green); }
        .estado-badge.terminada { background: rgba(100,116,139,0.15); color: var(--muted); }

        /* ── MODAL ── */
        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.7);
          display: flex; align-items: center; justify-content: center;
          z-index: 999; animation: fadeUp 0.2s ease;
        }
        .modal {
          background: var(--bg2); border: 1px solid var(--border);
          border-radius: 16px; padding: 28px; width: 420px;
          max-width: 90vw;
        }
        .modal h3 {
          font-family: var(--font-display); font-size: 1.1rem;
          color: var(--text); margin-bottom: 20px;
        }
        .modal-row {
          display: flex; justify-content: space-between;
          padding: 8px 0; border-bottom: 1px solid var(--border);
          font-size: 0.8rem;
        }
        .modal-row span:first-child { color: var(--muted); }
        .modal-row span:last-child  { color: var(--text); text-align: right; }
        .modal-actions { display: flex; gap: 10px; margin-top: 20px; justify-content: flex-end; }
        .btn-close {
          padding: 8px 16px; border-radius: 8px;
          background: var(--bg3); border: 1px solid var(--border);
          color: var(--muted); font-size: 0.78rem;
          font-family: var(--font-mono); cursor: pointer;
        }

        @media (max-width: 900px) {
          .stats-grid { grid-template-columns: 1fr 1fr; }
          .grid2 { grid-template-columns: 1fr; }
          .sidebar { width: 60px; padding: 20px 8px; }
          .sidebar-logo { display: none; }
          .sidebar-badge { display: none; }
          .nav-btn span:last-child { display: none; }
          .sidebar-user { display: none; }
          .main { margin-left: 60px; padding: 20px 16px; }
        }
      `}</style>

      <div className="admin-root">
        {/* ── SIDEBAR ── */}
        <aside className="sidebar">
          <div className="sidebar-logo">Cognify</div>
          <div className="sidebar-badge">Admin Panel</div>

          <nav className="sidebar-nav">
            {TABS.map(tab => (
              <button
                key={tab}
                className={`nav-btn${activeTab === tab ? " active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {TAB_LABELS[tab]}
              </button>
            ))}
          </nav>

          <div className="sidebar-user">
            <div className="sidebar-user-name">{adminNombre || "Admin"}</div>
            <div className="sidebar-user-email">{user?.email}</div>
            <button className="btn-logout" onClick={handleLogout}>⏻ Cerrar sesión</button>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className="main">

          {/* ══ OVERVIEW ══ */}
          {activeTab === "overview" && (
            <>
              <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
                <p className="page-sub">HOY · {new Date().toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" }).toUpperCase()}</p>
              </div>

              <div className="stats-grid">
                <div className="stat-card green">
                  <div className="stat-label">Total Usuarios</div>
                  <div className="stat-value green">{stats.totalUsuarios}</div>
                </div>
                <div className="stat-card blue">
                  <div className="stat-label">Activos Hoy</div>
                  <div className="stat-value blue">{stats.activosHoy}</div>
                </div>
                <div className="stat-card purple">
                  <div className="stat-label">Partidas Hoy</div>
                  <div className="stat-value purple">{stats.partidasHoy}</div>
                </div>
                <div className="stat-card orange">
                  <div className="stat-label">Retos Completados</div>
                  <div className="stat-value orange">{stats.retosCompletados}</div>
                </div>
              </div>

              <div className="grid2">
                {/* Actividad 7 días */}
                <div className="panel">
                  <div className="panel-title">Usuarios activos — últimos 7 días</div>
                  <div className="chart-bars">
                    {actividadDias.map((d, i) => (
                      <div key={i} className="chart-bar-wrap">
                        <div className="chart-count">{d.count}</div>
                        <div
                          className="chart-bar"
                          style={{ height: `${Math.max((d.count / maxActividad) * 90, 4)}px` }}
                        />
                        <div className="chart-label">{d.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top usuarios por XP */}
                <div className="panel">
                  <div className="panel-title">Top usuarios por XP</div>
                  <div className="top-list">
                    {usuarios.slice(0, 5).map((u, i) => (
                      <div key={u.id} className="top-item">
                        <span className="top-rank">#{i + 1}</span>
                        <div className="top-avatar">
                          {(u.nombre || u.email || "?")[0].toUpperCase()}
                        </div>
                        <span className="top-name">{u.nombre || u.email?.split("@")[0]}</span>
                        <span className="top-xp">{u.xp} XP</span>
                      </div>
                    ))}
                    {usuarios.length === 0 && (
                      <p style={{ color: "var(--muted)", fontSize: "0.8rem" }}>Sin datos aún.</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ══ USUARIOS ══ */}
          {activeTab === "usuarios" && (
            <>
              <div className="page-header">
                <h1 className="page-title">Gestión de Usuarios</h1>
                <p className="page-sub">{usuarios.length} USUARIOS REGISTRADOS</p>
              </div>

              <div className="panel" style={{ animation: "fadeUp 0.4s ease both" }}>
                <input
                  className="search-bar"
                  placeholder="🔍 Buscar por nombre o email..."
                  value={searchUsuario}
                  onChange={e => setSearchUsuario(e.target.value)}
                />
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Usuario</th>
                        <th>Email</th>
                        <th>Nivel</th>
                        <th>XP</th>
                        <th>Racha</th>
                        <th>Último acceso</th>
                        <th>Registro</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {usuariosFiltrados.map(u => (
                        <tr key={u.id} onClick={() => setModalUsuario(u)}>
                          <td>{u.nombre || "—"}</td>
                          <td className="date-text">{u.email}</td>
                          <td><span className="nivel-badge">Nv {u.nivel || 1}</span></td>
                          <td><span className="xp-text">{u.xp || 0}</span></td>
                          <td>{u.racha || 0} 🔥</td>
                          <td className="date-text">{u.ultimo_login ? new Date(u.ultimo_login).toLocaleDateString("es") : "—"}</td>
                          <td className="date-text">{u.created_at ? new Date(u.created_at).toLocaleDateString("es") : "—"}</td>
                          <td onClick={e => e.stopPropagation()}>
                            <button className="btn-delete" onClick={() => eliminarUsuario(u.id)}>Eliminar</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {usuariosFiltrados.length === 0 && (
                    <p style={{ textAlign: "center", padding: "32px", color: "var(--muted)", fontSize: "0.82rem" }}>
                      No se encontraron usuarios.
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ══ SALAS ══ */}
          {activeTab === "salas" && (
            <>
              <div className="page-header">
                <h1 className="page-title">Historial de Partidas</h1>
                <p className="page-sub">{salas.length} PARTIDAS REGISTRADAS</p>
              </div>

              <div className="panel" style={{ animation: "fadeUp 0.4s ease both" }}>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Área</th>
                        <th>Estado</th>
                        <th>Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salas.map(s => (
                        <tr key={s.id}>
                          <td style={{ letterSpacing: "0.15em", color: "var(--green)", fontWeight: 500 }}>{s.codigo}</td>
                          <td>{s.areas?.nombre || "—"}</td>
                          <td>
                            <span className={`estado-badge ${s.estado}`}>
                              {s.estado === "espera" ? "⏳ Espera" : s.estado === "jugando" ? "🎮 Jugando" : "✅ Terminada"}
                            </span>
                          </td>
                          <td className="date-text">{new Date(s.created_at).toLocaleString("es")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {salas.length === 0 && (
                    <p style={{ textAlign: "center", padding: "32px", color: "var(--muted)", fontSize: "0.82rem" }}>
                      No hay partidas registradas.
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

        </main>
      </div>

      {/* ── MODAL USUARIO ── */}
      {modalUsuario && (
        <div className="modal-overlay" onClick={() => setModalUsuario(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>👤 {modalUsuario.nombre || "Usuario"}</h3>
            {[
              ["Email", modalUsuario.email],
              ["Nivel", `Nivel ${modalUsuario.nivel || 1}`],
              ["XP Total", `${modalUsuario.xp || 0} XP`],
              ["Racha", `${modalUsuario.racha || 0} días 🔥`],
              ["Último acceso", modalUsuario.ultimo_login ? new Date(modalUsuario.ultimo_login).toLocaleString("es") : "—"],
              ["Registro", modalUsuario.created_at ? new Date(modalUsuario.created_at).toLocaleString("es") : "—"],
            ].map(([k, v]) => (
              <div key={k} className="modal-row">
                <span>{k}</span>
                <span>{v}</span>
              </div>
            ))}
            <div className="modal-actions">
              <button className="btn-close" onClick={() => setModalUsuario(null)}>Cerrar</button>
              <button className="btn-delete" onClick={() => eliminarUsuario(modalUsuario.id)}>Eliminar usuario</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}