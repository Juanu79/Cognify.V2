import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

const TABS = ["general", "usuarios", "partidas", "ranking", "ajustes"];
const TAB_ICONS = {
  general:  "⊞",
  usuarios: "👤",
  partidas: "🎮",
  ranking:  "🏆",
  ajustes:  "⚙",
};
const TAB_LABELS = {
  general:  "General",
  usuarios: "Usuarios",
  partidas: "Partidas",
  ranking:  "Ranking",
  ajustes:  "Ajustes",
};

const fmt = (n) => (n ?? 0).toLocaleString("es");
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("es-CO", { day:"numeric", month:"short", year:"numeric" }) : "—";
const today = () => new Date().toLocaleDateString("es-CO", { weekday:"long", day:"numeric", month:"long" });
const todayISO = () => new Date().toISOString().split("T")[0];

export default function AdminDashboard({ user }) {
  const navigate = useNavigate();
  const [tab, setTab]           = useState("general");
  const [loading, setLoading]   = useState(true);
  const [sideOpen, setSideOpen] = useState(true);
  const [adminNombre, setAdminNombre] = useState("");

  // Data
  const [stats, setStats]             = useState({ totalUsuarios:0, activosHoy:0, partidasHoy:0, retosCompletados:0 });
  const [extraStats, setExtraStats]   = useState({ actividadMes:0, tasaCompletacion:0, promedioSesion:24 });
  const [usuarios, setUsuarios]       = useState([]);
  const [salas, setSalas]             = useState([]);
  const [actividadDias, setActividad] = useState([]);
  const [searchU, setSearchU]         = useState("");
  const [modalU, setModalU]           = useState(null);
  const [ajustesMsg, setAjustesMsg]   = useState("");

  // Ajustes form
  const [ajNombre, setAjNombre]       = useState("");
  const [ajEmail, setAjEmail]         = useState("");

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([cargarStats(), cargarUsuarios(), cargarSalas(), cargarActividad()]);
      const { data } = await supabase.from("admins").select("nombre").eq("email", user.email).single();
      if (data) { setAdminNombre(data.nombre); setAjNombre(data.nombre); }
      setAjEmail(user.email);
      setLoading(false);
    };
    init();
  }, []);

  const cargarStats = async () => {
    const hoy = todayISO();
    const [{ count: tu }, { count: ah }, { count: ph }, { count: rc }] = await Promise.all([
      supabase.from("usuarios").select("*", { count:"exact", head:true }),
      supabase.from("usuarios").select("*", { count:"exact", head:true }).gte("ultimo_login", hoy),
      supabase.from("salas").select("*", { count:"exact", head:true }).gte("created_at", hoy),
      supabase.from("progreso").select("*", { count:"exact", head:true }).eq("completado", true),
    ]);
    setStats({ totalUsuarios:tu||0, activosHoy:ah||0, partidasHoy:ph||0, retosCompletados:rc||0 });

    // Extra stats
    const mesInicio = new Date(); mesInicio.setDate(1);
    const { count: am } = await supabase.from("salas").select("*", { count:"exact", head:true }).gte("created_at", mesInicio.toISOString());
    const { count: totalRetos } = await supabase.from("progreso").select("*", { count:"exact", head:true });
    const tasa = totalRetos > 0 ? Math.round(((rc||0) / totalRetos) * 100) : 0;
    setExtraStats({ actividadMes: am||0, tasaCompletacion: tasa, promedioSesion: 24 });
  };

  const cargarUsuarios = async () => {
    const { data } = await supabase.from("usuarios")
      .select("id, nombre, email, xp, nivel, racha, ultimo_login, created_at")
      .order("xp", { ascending:false });
    setUsuarios(data || []);
  };

  const cargarSalas = async () => {
    const { data } = await supabase.from("salas")
      .select("id, codigo, estado, created_at, areas(nombre)")
      .order("created_at", { ascending:false })
      .limit(50);
    setSalas(data || []);
  };

  const cargarActividad = async () => {
    const dias = [];
    for (let i = 6; i >= 0; i--) {
      const f = new Date(); f.setDate(f.getDate() - i);
      const fs = f.toISOString().split("T")[0];
      const fn = new Date(f.getTime() + 86400000).toISOString().split("T")[0];
      const { count } = await supabase.from("usuarios").select("*", { count:"exact", head:true })
        .gte("ultimo_login", fs).lt("ultimo_login", fn);
      dias.push({ label: f.toLocaleDateString("es", { weekday:"short" }), count: count||0 });
    }
    setActividad(dias);
  };

  const eliminarUsuario = async (id) => {
    if (!confirm("¿Eliminar este usuario permanentemente?")) return;
    await supabase.from("usuarios").delete().eq("id", id);
    setUsuarios(prev => prev.filter(u => u.id !== id));
    setModalU(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleExportarCSV = () => {
    const rows = [["Nombre","Email","Nivel","XP","Racha","Último acceso","Registro"]];
    usuarios.forEach(u => rows.push([u.nombre||"", u.email, u.nivel||1, u.xp||0, u.racha||0, fmtDate(u.ultimo_login), fmtDate(u.created_at)]));
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type:"text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "usuarios_cognify.csv"; a.click();
  };

  const handleGuardarAjustes = async () => {
    await supabase.from("admins").update({ nombre: ajNombre }).eq("email", user.email);
    setAdminNombre(ajNombre);
    setAjustesMsg("✅ Cambios guardados correctamente.");
    setTimeout(() => setAjustesMsg(""), 3000);
  };

  const usuariosFiltrados = usuarios.filter(u =>
    u.nombre?.toLowerCase().includes(searchU.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchU.toLowerCase())
  );

  const maxAct  = Math.max(...actividadDias.map(d => d.count), 1);
  const xpProm  = usuarios.length > 0 ? Math.round(usuarios.reduce((s,u) => s+(u.xp||0), 0) / usuarios.length) : 0;
  const nv2     = usuarios.filter(u => (u.nivel||1) >= 2).length;
  const nv1     = usuarios.filter(u => (u.nivel||1) < 2).length;

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", background:"#0d1117" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:48, height:48, border:"3px solid #00c896", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto 16px" }}/>
        <p style={{ color:"#00c896", fontSize:"0.85rem", letterSpacing:"0.1em", fontFamily:"'DM Sans',sans-serif" }}>Cargando panel...</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        :root{
          --bg:       #0d1117;
          --bg2:      #161b22;
          --bg3:      #1c2333;
          --bg4:      #21262d;
          --border:   rgba(255,255,255,0.08);
          --green:    #00c896;
          --green2:   #00e5a8;
          --blue:     #58a6ff;
          --purple:   #a371f7;
          --orange:   #f78166;
          --yellow:   #e3b341;
          --text:     #e6edf3;
          --text2:    #8b949e;
          --font:     'DM Sans', sans-serif;
          --fontd:    'Space Grotesk', sans-serif;
          --radius:   14px;
          --side:     280px;
        }
        body{ background:var(--bg); color:var(--text); font-family:var(--font); }

        @keyframes spin    { to { transform:rotate(360deg); } }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn  { from{opacity:0}to{opacity:1} }

        /* ── LAYOUT ── */
        .ad-root { display:flex; min-height:100vh; background:var(--bg); }

        /* ── SIDEBAR ── */
        .ad-side {
          width:var(--side); background:var(--bg2);
          border-right:1px solid var(--border);
          display:flex; flex-direction:column;
          padding:24px 16px; position:fixed;
          top:0; left:0; height:100vh; z-index:100;
          transition:width 0.25s ease;
        }
        .ad-side.collapsed { width:72px; }
        .ad-side.collapsed .side-label { display:none; }
        .ad-side.collapsed .side-logo-text { display:none; }
        .ad-side.collapsed .side-user-info { display:none; }
        .ad-side.collapsed .side-badge { display:none; }

        .side-logo { display:flex; align-items:center; gap:10px; margin-bottom:6px; padding:0 6px; }
        .side-logo-icon {
          width:38px; height:38px; border-radius:10px; flex-shrink:0;
          background:linear-gradient(135deg,#00c896,#00a878);
          display:flex; align-items:center; justify-content:center;
          font-weight:800; color:#000; font-size:0.85rem; font-family:var(--fontd);
        }
        .side-logo-text { font-family:var(--fontd); font-size:1.15rem; font-weight:700; color:var(--green); }
        .side-badge { font-size:0.62rem; color:var(--text2); letter-spacing:0.1em; text-transform:uppercase; padding:0 6px; margin-bottom:28px; }

        .side-nav { display:flex; flex-direction:column; gap:4px; flex:1; }
        .side-btn {
          display:flex; align-items:center; gap:12px;
          padding:11px 12px; border-radius:10px;
          background:none; border:none; color:var(--text2);
          font-size:0.88rem; font-family:var(--font); font-weight:500;
          cursor:pointer; text-align:left; transition:all 0.15s; white-space:nowrap;
        }
        .side-btn:hover { background:var(--bg3); color:var(--text); }
        .side-btn.active {
          background:rgba(0,200,150,0.1); color:var(--green);
          border:1px solid rgba(0,200,150,0.2);
        }
        .side-btn .icon {
          width:32px; height:32px; border-radius:8px; flex-shrink:0;
          display:flex; align-items:center; justify-content:center;
          font-size:1rem; background:var(--bg3);
          transition:background 0.15s;
        }
        .side-btn.active .icon { background:rgba(0,200,150,0.15); }

        .side-user {
          border-top:1px solid var(--border); padding-top:16px;
          display:flex; align-items:center; gap:10px;
        }
        .side-user-avatar {
          width:36px; height:36px; border-radius:50%; flex-shrink:0;
          background:linear-gradient(135deg,var(--green),var(--blue));
          display:flex; align-items:center; justify-content:center;
          font-weight:700; color:#000; font-size:0.85rem;
        }
        .side-user-info { flex:1; min-width:0; }
        .side-user-name { font-size:0.82rem; font-weight:600; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .side-user-email { font-size:0.68rem; color:var(--text2); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

        /* ── MAIN ── */
        .ad-main { margin-left:var(--side); flex:1; padding:32px 32px 80px; transition:margin-left 0.25s; }
        .ad-main.collapsed { margin-left:72px; }

        /* ── TOP BAR ── */
        .topbar {
          display:flex; justify-content:space-between; align-items:center;
          margin-bottom:28px; animation:fadeUp 0.4s ease both;
        }
        .topbar-left h1 { font-family:var(--fontd); font-size:2rem; font-weight:700; color:var(--text); line-height:1.1; }
        .topbar-left p  { font-size:0.8rem; color:var(--text2); margin-top:4px; display:flex; align-items:center; gap:6px; }
        .topbar-right { display:flex; gap:10px; align-items:center; }

        .btn { display:inline-flex; align-items:center; gap:8px; padding:9px 18px; border-radius:10px; font-size:0.83rem; font-weight:600; font-family:var(--font); cursor:pointer; transition:all 0.15s; border:none; white-space:nowrap; }
        .btn-outline { background:var(--bg3); border:1px solid var(--border); color:var(--text2); }
        .btn-outline:hover { border-color:var(--green); color:var(--green); }
        .btn-primary { background:var(--green); color:#000; box-shadow:0 4px 14px rgba(0,200,150,0.3); }
        .btn-primary:hover { background:var(--green2); transform:translateY(-1px); }
        .btn-danger { background:rgba(247,129,102,0.1); border:1px solid rgba(247,129,102,0.2); color:var(--orange); }
        .btn-danger:hover { background:rgba(247,129,102,0.2); }

        /* ── STAT CARDS ── */
        .stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:24px; animation:fadeUp 0.4s ease 0.05s both; }
        .stat-card {
          background:var(--bg2); border:1px solid var(--border);
          border-radius:var(--radius); padding:22px 20px;
          position:relative; overflow:hidden;
          transition:transform 0.2s, border-color 0.2s;
        }
        .stat-card:hover { transform:translateY(-2px); border-color:rgba(255,255,255,0.14); }
        .stat-card::before { content:''; position:absolute; top:0;left:0;right:0;height:2px; }
        .stat-card.c-green::before { background:var(--green); }
        .stat-card.c-blue::before  { background:var(--blue); }
        .stat-card.c-purple::before{ background:var(--purple); }
        .stat-card.c-orange::before{ background:var(--orange); }

        .stat-top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px; }
        .stat-icon { width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.1rem; }
        .stat-icon.c-green  { background:rgba(0,200,150,0.12); }
        .stat-icon.c-blue   { background:rgba(88,166,255,0.12); }
        .stat-icon.c-purple { background:rgba(163,113,247,0.12); }
        .stat-icon.c-orange { background:rgba(247,129,102,0.12); }
        .stat-pct { font-size:0.72rem; font-weight:600; display:flex; align-items:center; gap:3px; }
        .stat-pct.up   { color:var(--green); }
        .stat-pct.zero { color:var(--text2); }
        .stat-label { font-size:0.72rem; color:var(--text2); text-transform:uppercase; letter-spacing:0.08em; margin-bottom:6px; }
        .stat-value { font-family:var(--fontd); font-size:2.2rem; font-weight:700; color:var(--text); line-height:1; margin-bottom:4px; }
        .stat-sub   { font-size:0.72rem; color:var(--text2); }

        /* ── PANELS ── */
        .grid2 { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px; animation:fadeUp 0.4s ease 0.1s both; }
        .panel { background:var(--bg2); border:1px solid var(--border); border-radius:var(--radius); padding:22px; }
        .panel-head { display:flex; justify-content:space-between; align-items:baseline; margin-bottom:6px; }
        .panel-title { font-family:var(--fontd); font-size:1rem; font-weight:600; color:var(--text); }
        .panel-sub   { font-size:0.75rem; color:var(--text2); margin-bottom:18px; }
        .panel-link  { font-size:0.75rem; color:var(--green); font-weight:600; cursor:pointer; text-decoration:none; background:none; border:none; font-family:var(--font); }
        .panel-link:hover { text-decoration:underline; }

        /* ── CHART ── */
        .chart { display:flex; align-items:flex-end; gap:8px; height:120px; }
        .chart-col { flex:1; display:flex; flex-direction:column; align-items:center; gap:5px; height:100%; justify-content:flex-end; }
        .chart-bar { width:100%; border-radius:5px 5px 0 0; background:rgba(0,200,150,0.15); border-top:2px solid var(--green); min-height:4px; transition:height 0.5s ease; }
        .chart-bar:hover { background:rgba(0,200,150,0.28); }
        .chart-n { font-size:0.68rem; color:var(--green); font-weight:600; }
        .chart-l { font-size:0.65rem; color:var(--text2); text-transform:capitalize; }

        /* ── TOP LIST ── */
        .top-list { display:flex; flex-direction:column; gap:8px; }
        .top-item { display:flex; align-items:center; gap:12px; padding:10px 12px; border-radius:10px; background:var(--bg3); border:1px solid var(--border); transition:border-color 0.15s; }
        .top-item:hover { border-color:rgba(0,200,150,0.2); }
        .top-rank { font-size:0.72rem; color:var(--text2); width:22px; text-align:center; font-weight:600; }
        .top-av { width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,var(--green),var(--blue));display:flex;align-items:center;justify-content:center;font-size:0.8rem;font-weight:700;color:#000;flex-shrink:0; }
        .top-name { flex:1; font-size:0.83rem; color:var(--text); font-weight:500; }
        .top-xp-badge { background:rgba(0,200,150,0.12); color:var(--green); padding:3px 10px; border-radius:20px; font-size:0.72rem; font-weight:700; }

        /* ── MINI STATS ── */
        .mini-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:20px; animation:fadeUp 0.4s ease 0.15s both; }
        .mini-card { background:var(--bg2); border:1px solid var(--border); border-radius:var(--radius); padding:20px; display:flex; align-items:center; gap:14px; transition:transform 0.2s; }
        .mini-card:hover { transform:translateY(-2px); }
        .mini-icon { width:46px;height:46px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0; }
        .mini-icon.c-blue   { background:rgba(88,166,255,0.12); }
        .mini-icon.c-purple { background:rgba(163,113,247,0.12); }
        .mini-icon.c-orange { background:rgba(247,129,102,0.12); }
        .mini-val { font-family:var(--fontd); font-size:1.7rem; font-weight:700; color:var(--text); line-height:1; }
        .mini-label { font-size:0.72rem; color:var(--text2); margin-top:3px; }
        .mini-sub   { font-size:0.68rem; color:var(--text2); }

        /* ── TABLA ── */
        .search-row { display:flex; gap:10px; margin-bottom:16px; flex-wrap:wrap; }
        .search-inp {
          flex:1; min-width:200px; padding:10px 14px 10px 38px;
          background:var(--bg3); border:1px solid var(--border);
          border-radius:10px; color:var(--text); font-size:0.85rem;
          font-family:var(--font); outline:none; transition:border-color 0.2s;
          background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%238b949e' viewBox='0 0 16 16'%3E%3Cpath d='M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.099zm-5.44 1.406a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z'/%3E%3C/svg%3E");
          background-repeat:no-repeat; background-position:12px center;
        }
        .search-inp:focus { border-color:var(--green); }
        .search-inp::placeholder { color:var(--text2); }

        .u-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:20px; }
        .u-stat { background:var(--bg3); border:1px solid var(--border); border-radius:10px; padding:14px 16px; }
        .u-stat-label { font-size:0.68rem; color:var(--text2); text-transform:uppercase; letter-spacing:0.08em; margin-bottom:6px; }
        .u-stat-val { font-family:var(--fontd); font-size:1.5rem; font-weight:700; color:var(--blue); }

        .tbl { width:100%; border-collapse:collapse; font-size:0.82rem; }
        .tbl thead th { text-align:left; padding:10px 14px; color:var(--text2); font-size:0.7rem; text-transform:uppercase; letter-spacing:0.08em; border-bottom:1px solid var(--border); font-weight:500; }
        .tbl tbody tr { border-bottom:1px solid var(--border); transition:background 0.15s; cursor:pointer; }
        .tbl tbody tr:hover { background:var(--bg3); }
        .tbl tbody td { padding:14px; color:var(--text); vertical-align:middle; }
        .tbl-avatar { width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,var(--green),var(--blue));display:inline-flex;align-items:center;justify-content:center;font-weight:700;color:#000;font-size:0.82rem;margin-right:10px;vertical-align:middle; }
        .badge-nv { background:rgba(88,166,255,0.12); color:var(--blue); padding:3px 10px; border-radius:20px; font-size:0.72rem; font-weight:600; }
        .badge-xp { color:var(--green); font-weight:600; }
        .badge-estado { padding:3px 10px; border-radius:20px; font-size:0.72rem; font-weight:600; }
        .badge-estado.espera    { background:rgba(227,179,65,0.12); color:var(--yellow); }
        .badge-estado.jugando   { background:rgba(0,200,150,0.12); color:var(--green); }
        .badge-estado.terminada { background:rgba(139,148,158,0.12); color:var(--text2); }
        .muted { color:var(--text2); font-size:0.75rem; }

        /* ── RANKING ── */
        .rank-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; animation:fadeUp 0.4s ease both; }
        .rank-item { display:flex; align-items:center; gap:14px; padding:14px 16px; border-radius:12px; background:var(--bg3); border:1px solid var(--border); transition:all 0.15s; }
        .rank-item:hover { border-color:rgba(0,200,150,0.2); transform:translateY(-1px); }
        .rank-num { font-family:var(--fontd); font-size:1.1rem; font-weight:700; width:28px; text-align:center; }
        .rank-num.gold   { color:#f0c040; }
        .rank-num.silver { color:#c0c8d0; }
        .rank-num.bronze { color:#cd7f32; }
        .rank-num.other  { color:var(--text2); }
        .rank-av { width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,var(--green),var(--blue));display:flex;align-items:center;justify-content:center;font-weight:700;color:#000;font-size:0.9rem;flex-shrink:0; }
        .rank-info { flex:1; }
        .rank-name { font-weight:600; color:var(--text); font-size:0.88rem; }
        .rank-email { font-size:0.72rem; color:var(--text2); }
        .rank-xp-pill { background:rgba(0,200,150,0.1); border:1px solid rgba(0,200,150,0.2); color:var(--green); padding:5px 14px; border-radius:20px; font-weight:700; font-size:0.8rem; white-space:nowrap; }

        /* ── AJUSTES ── */
        .ajustes-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; animation:fadeUp 0.4s ease both; }
        .aj-section { background:var(--bg2); border:1px solid var(--border); border-radius:var(--radius); padding:24px; }
        .aj-title { font-family:var(--fontd); font-size:1rem; font-weight:600; color:var(--text); margin-bottom:4px; }
        .aj-sub { font-size:0.75rem; color:var(--text2); margin-bottom:20px; }
        .aj-field { margin-bottom:16px; }
        .aj-label { font-size:0.75rem; color:var(--text2); font-weight:500; margin-bottom:6px; display:block; }
        .aj-input {
          width:100%; padding:10px 14px; background:var(--bg3);
          border:1px solid var(--border); border-radius:10px;
          color:var(--text); font-size:0.85rem; font-family:var(--font);
          outline:none; transition:border-color 0.2s;
        }
        .aj-input:focus { border-color:var(--green); }
        .aj-input:disabled { opacity:0.5; cursor:not-allowed; }
        .aj-msg { font-size:0.8rem; color:var(--green); margin-top:10px; min-height:18px; }
        .danger-zone { border-color:rgba(247,129,102,0.2); }
        .danger-title { color:var(--orange); }

        /* ── MODAL ── */
        .overlay { position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:999;animation:fadeIn 0.2s ease; }
        .modal { background:var(--bg2);border:1px solid var(--border);border-radius:18px;padding:28px;width:440px;max-width:92vw;animation:fadeUp 0.25s ease; }
        .modal h3 { font-family:var(--fontd);font-size:1.1rem;font-weight:700;color:var(--text);margin-bottom:20px;display:flex;align-items:center;gap:10px; }
        .modal-row { display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);font-size:0.82rem; }
        .modal-row span:first-child { color:var(--text2); }
        .modal-actions { display:flex;gap:10px;margin-top:20px;justify-content:flex-end; }
        .btn-ghost { padding:8px 16px;border-radius:8px;background:var(--bg3);border:1px solid var(--border);color:var(--text2);font-size:0.78rem;font-family:var(--font);cursor:pointer;transition:all 0.15s; }
        .btn-ghost:hover { border-color:var(--text2); color:var(--text); }

        /* ── LOGOUT BTN ── */
        .logout-btn { width:100%;margin-top:12px;padding:10px;border-radius:10px;background:rgba(247,129,102,0.08);border:1px solid rgba(247,129,102,0.15);color:var(--orange);font-size:0.82rem;font-weight:600;font-family:var(--font);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:all 0.15s; }
        .logout-btn:hover { background:rgba(247,129,102,0.18); }

        /* ── RESPONSIVE ── */
        @media(max-width:1100px){
          .stats-grid{ grid-template-columns:repeat(2,1fr); }
          .grid2{ grid-template-columns:1fr; }
          .mini-grid{ grid-template-columns:1fr 1fr; }
          .rank-grid{ grid-template-columns:1fr; }
          .ajustes-grid{ grid-template-columns:1fr; }
          .u-stats{ grid-template-columns:1fr 1fr; }
        }
        @media(max-width:768px){
          :root{ --side:72px; }
          .ad-side{ width:72px!important; padding:20px 8px; }
          .ad-side .side-label,.ad-side .side-logo-text,.ad-side .side-user-info,.ad-side .side-badge{ display:none!important; }
          .ad-main{ margin-left:72px!important; padding:20px 16px 60px; }
          .stats-grid{ grid-template-columns:1fr 1fr; }
          .topbar{ flex-direction:column; align-items:flex-start; gap:12px; }
          .topbar-right{ width:100%; justify-content:flex-start; flex-wrap:wrap; }
          .topbar-left h1{ font-size:1.5rem; }
          .mini-grid{ grid-template-columns:1fr; }
          .u-stats{ grid-template-columns:1fr 1fr; }
          .search-row{ flex-direction:column; }
          .tbl thead{ display:none; }
          .tbl tbody tr{ display:flex; flex-wrap:wrap; padding:10px; gap:6px; }
          .tbl tbody td{ padding:4px 8px; border:none; }
        }
        @media(max-width:480px){
          .stats-grid{ grid-template-columns:1fr; }
          .u-stats{ grid-template-columns:1fr; }
        }
      `}</style>

      <div className="ad-root">
        {/* ══ SIDEBAR ══ */}
        <aside className={`ad-side${sideOpen ? "" : " collapsed"}`}>
          <div className="side-logo">
            <div className="side-logo-icon">CF</div>
            <span className="side-logo-text side-label">Cognify</span>
          </div>
          <div className="side-badge side-label">Admin Panel</div>

          <nav className="side-nav">
            {TABS.map(t => (
              <button key={t} className={`side-btn${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>
                <span className="icon">{TAB_ICONS[t]}</span>
                <span className="side-label">{TAB_LABELS[t]}</span>
              </button>
            ))}
          </nav>

          <div className="side-user">
            <div className="side-user-avatar">
              {(adminNombre || user?.email || "A")[0].toUpperCase()}
            </div>
            <div className="side-user-info">
              <div className="side-user-name">{adminNombre || "Admin"}</div>
              <div className="side-user-email">{user?.email}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <span>↪</span> <span className="side-label">Cerrar sesión</span>
          </button>
        </aside>

        {/* ══ MAIN ══ */}
        <main className={`ad-main${sideOpen ? "" : " collapsed"}`}>

          {/* ══ GENERAL ══ */}
          {tab === "general" && (
            <>
              <div className="topbar">
                <div className="topbar-left">
                  <h1>Dashboard</h1>
                  <p>📅 Hoy • {today().charAt(0).toUpperCase() + today().slice(1)}</p>
                </div>
                <div className="topbar-right">
                  <button className="btn btn-outline" onClick={handleExportarCSV}>⬇ Exportar datos</button>
                  <button className="btn btn-primary" onClick={() => setTab("usuarios")}>+ Nuevo usuario</button>
                </div>
              </div>

              {/* Stats principales */}
              <div className="stats-grid">
                {[
                  { label:"Total Usuarios",      val:stats.totalUsuarios,    sub:"Desde el inicio",      icon:"👥", color:"c-green",  pct:8  },
                  { label:"Activos Hoy",         val:stats.activosHoy,       sub:"En las últimas 24h",   icon:"⚡", color:"c-blue",   pct:0  },
                  { label:"Partidas Hoy",        val:stats.partidasHoy,      sub:"Nuevas partidas",      icon:"🎮", color:"c-purple", pct:15 },
                  { label:"Retos Completados",   val:stats.retosCompletados, sub:"Esta semana",          icon:"🎯", color:"c-orange", pct:12 },
                ].map(s => (
                  <div key={s.label} className={`stat-card ${s.color}`}>
                    <div className="stat-top">
                      <div className={`stat-icon ${s.color}`}>{s.icon}</div>
                      <span className={`stat-pct ${s.pct > 0 ? "up" : "zero"}`}>
                        {s.pct > 0 ? "↑" : "↔"} {s.pct}%
                      </span>
                    </div>
                    <div className="stat-label">{s.label}</div>
                    <div className="stat-value">{fmt(s.val)}</div>
                    <div className="stat-sub">{s.sub}</div>
                  </div>
                ))}
              </div>

              {/* Gráfico + Top usuarios */}
              <div className="grid2">
                <div className="panel">
                  <div className="panel-head">
                    <span className="panel-title">Usuarios Activos</span>
                  </div>
                  <p className="panel-sub">Actividad diaria — últimos 7 días</p>
                  <div className="chart">
                    {actividadDias.map((d, i) => (
                      <div key={i} className="chart-col">
                        <span className="chart-n">{d.count}</span>
                        <div className="chart-bar" style={{ height:`${Math.max((d.count/maxAct)*95,4)}px` }}/>
                        <span className="chart-l">{d.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="panel">
                  <div className="panel-head">
                    <span className="panel-title">Top Usuarios por XP</span>
                    <button className="panel-link" onClick={() => setTab("ranking")}>Ver todos →</button>
                  </div>
                  <p className="panel-sub">Los 5 usuarios con más experiencia</p>
                  <div className="top-list">
                    {usuarios.slice(0,5).map((u, i) => (
                      <div key={u.id} className="top-item">
                        <span className="top-rank">#{i+1}</span>
                        <div className="top-av">{(u.nombre||u.email||"?")[0].toUpperCase()}</div>
                        <span className="top-name">{u.nombre || u.email?.split("@")[0]}</span>
                        <span className="top-xp-badge">{fmt(u.xp)} XP</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mini stats */}
              <div className="mini-grid">
                {[
                  { icon:"📅", color:"c-blue",   val:fmt(extraStats.actividadMes),      label:"Actividad Mensual",   sub:"Sesiones este mes" },
                  { icon:"🎯", color:"c-purple", val:`${extraStats.tasaCompletacion}%`, label:"Tasa de Completación",sub:"De retos finalizados" },
                  { icon:"👤", color:"c-orange", val:`${extraStats.promedioSesion}m`,   label:"Promedio Sesión",      sub:"Tiempo promedio por usuario" },
                ].map(m => (
                  <div key={m.label} className="mini-card">
                    <div className={`mini-icon ${m.color}`}>{m.icon}</div>
                    <div>
                      <div className="mini-val">{m.val}</div>
                      <div className="mini-label">{m.label}</div>
                      <div className="mini-sub">{m.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ══ USUARIOS ══ */}
          {tab === "usuarios" && (
            <>
              <div className="topbar">
                <div className="topbar-left">
                  <h1>Gestión de Usuarios</h1>
                  <p>👤 {usuarios.length} usuarios registrados</p>
                </div>
                <div className="topbar-right">
                  <button className="btn btn-outline" onClick={handleExportarCSV}>⬇ Exportar CSV</button>
                </div>
              </div>

              <div className="u-stats" style={{ animation:"fadeUp 0.4s ease both" }}>
                {[
                  { label:"Total", val: usuarios.length },
                  { label:"Nivel 2+", val: nv2 },
                  { label:"Nivel 1", val: nv1 },
                  { label:"XP Promedio", val: fmt(xpProm) },
                ].map(s => (
                  <div key={s.label} className="u-stat">
                    <div className="u-stat-label">{s.label}</div>
                    <div className="u-stat-val">{s.val}</div>
                  </div>
                ))}
              </div>

              <div className="panel" style={{ animation:"fadeUp 0.4s ease 0.05s both" }}>
                <div className="search-row">
                  <input className="search-inp" placeholder="Buscar por nombre o email..." value={searchU} onChange={e => setSearchU(e.target.value)}/>
                </div>
                <div style={{ overflowX:"auto" }}>
                  <table className="tbl">
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
                        <tr key={u.id} onClick={() => setModalU(u)}>
                          <td>
                            <span className="tbl-avatar">{(u.nombre||u.email||"?")[0].toUpperCase()}</span>
                            {u.nombre || "—"}
                          </td>
                          <td className="muted">{u.email}</td>
                          <td><span className="badge-nv">Nv {u.nivel||1}</span></td>
                          <td><span className="badge-xp">{fmt(u.xp)}</span></td>
                          <td>{u.racha||0} 🔥</td>
                          <td className="muted">{fmtDate(u.ultimo_login)}</td>
                          <td className="muted">{fmtDate(u.created_at)}</td>
                          <td onClick={e => e.stopPropagation()}>
                            <button className="btn btn-danger" style={{ padding:"5px 12px", fontSize:"0.72rem" }} onClick={() => eliminarUsuario(u.id)}>Eliminar</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {usuariosFiltrados.length === 0 && (
                    <p style={{ textAlign:"center", padding:"32px", color:"var(--text2)", fontSize:"0.85rem" }}>No se encontraron usuarios.</p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ══ PARTIDAS ══ */}
          {tab === "partidas" && (
            <>
              <div className="topbar">
                <div className="topbar-left">
                  <h1>Historial de Partidas</h1>
                  <p>🎮 {salas.length} partidas registradas</p>
                </div>
              </div>

              <div className="panel" style={{ animation:"fadeUp 0.4s ease both" }}>
                <div style={{ overflowX:"auto" }}>
                  <table className="tbl">
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
                          <td style={{ color:"var(--green)", fontWeight:600, letterSpacing:"0.1em" }}>{s.codigo}</td>
                          <td>{s.areas?.nombre || "—"}</td>
                          <td>
                            <span className={`badge-estado ${s.estado}`}>
                              {s.estado === "espera" ? "⏳ Espera" : s.estado === "jugando" ? "🎮 Jugando" : "✅ Terminada"}
                            </span>
                          </td>
                          <td className="muted">{new Date(s.created_at).toLocaleString("es-CO")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {salas.length === 0 && (
                    <p style={{ textAlign:"center", padding:"32px", color:"var(--text2)", fontSize:"0.85rem" }}>No hay partidas registradas.</p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ══ RANKING ══ */}
          {tab === "ranking" && (
            <>
              <div className="topbar">
                <div className="topbar-left">
                  <h1>Ranking Global</h1>
                  <p>🏆 Clasificación por XP acumulado</p>
                </div>
              </div>

              <div className="rank-grid">
                {usuarios.map((u, i) => (
                  <div key={u.id} className="rank-item">
                    <span className={`rank-num ${i===0?"gold":i===1?"silver":i===2?"bronze":"other"}`}>
                      {i===0?"🥇":i===1?"🥈":i===2?"🥉":`#${i+1}`}
                    </span>
                    <div className="rank-av">{(u.nombre||u.email||"?")[0].toUpperCase()}</div>
                    <div className="rank-info">
                      <div className="rank-name">{u.nombre || u.email?.split("@")[0]}</div>
                      <div className="rank-email">{u.email}</div>
                    </div>
                    <span className="rank-xp-pill">{fmt(u.xp)} XP</span>
                  </div>
                ))}
                {usuarios.length === 0 && (
                  <p style={{ color:"var(--text2)", padding:"20px" }}>Sin datos aún.</p>
                )}
              </div>
            </>
          )}

          {/* ══ AJUSTES ══ */}
          {tab === "ajustes" && (
            <>
              <div className="topbar">
                <div className="topbar-left">
                  <h1>Ajustes</h1>
                  <p>⚙ Configuración del panel de administración</p>
                </div>
              </div>

              <div className="ajustes-grid">
                <div className="aj-section">
                  <div className="aj-title">Perfil de Administrador</div>
                  <div className="aj-sub">Actualiza tu información de administrador</div>
                  <div className="aj-field">
                    <label className="aj-label">Nombre</label>
                    <input className="aj-input" value={ajNombre} onChange={e => setAjNombre(e.target.value)} placeholder="Tu nombre"/>
                  </div>
                  <div className="aj-field">
                    <label className="aj-label">Email (no editable)</label>
                    <input className="aj-input" value={ajEmail} disabled/>
                  </div>
                  <button className="btn btn-primary" style={{ width:"100%", justifyContent:"center" }} onClick={handleGuardarAjustes}>
                    Guardar cambios
                  </button>
                  <div className="aj-msg">{ajustesMsg}</div>
                </div>

                <div className="aj-section danger-zone">
                  <div className="aj-title danger-title">Zona de peligro</div>
                  <div className="aj-sub">Estas acciones son irreversibles. Úsalas con precaución.</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                    <button className="btn btn-danger" style={{ width:"100%", justifyContent:"center", padding:"12px" }}
                      onClick={() => { if(confirm("¿Cerrar sesión?")) handleLogout(); }}>
                      ↪ Cerrar sesión
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

        </main>
      </div>

      {/* ══ MODAL USUARIO ══ */}
      {modalU && (
        <div className="overlay" onClick={() => setModalU(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>
              <div className="rank-av" style={{ width:36, height:36, fontSize:"0.85rem" }}>
                {(modalU.nombre||modalU.email||"?")[0].toUpperCase()}
              </div>
              {modalU.nombre || "Usuario"}
            </h3>
            {[
              ["Email",          modalU.email],
              ["Nivel",          `Nivel ${modalU.nivel||1}`],
              ["XP Total",       `${fmt(modalU.xp||0)} XP`],
              ["Racha",          `${modalU.racha||0} días 🔥`],
              ["Último acceso",  fmtDate(modalU.ultimo_login)],
              ["Registro",       fmtDate(modalU.created_at)],
            ].map(([k,v]) => (
              <div key={k} className="modal-row">
                <span>{k}</span><span>{v}</span>
              </div>
            ))}
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setModalU(null)}>Cerrar</button>
              <button className="btn btn-danger" onClick={() => eliminarUsuario(modalU.id)}>Eliminar usuario</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}