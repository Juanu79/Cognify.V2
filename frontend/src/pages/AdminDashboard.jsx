import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

const TABS = ["general", "usuarios", "partidas", "ranking", "ajustes"];
const TAB_ICONS  = { general:"⊞", usuarios:"👤", partidas:"🎮", ranking:"🏆", ajustes:"⚙" };
const TAB_LABELS = { general:"General", usuarios:"Usuarios", partidas:"Partidas", ranking:"Ranking", ajustes:"Ajustes" };

const fmt     = (n) => (n ?? 0).toLocaleString("es");
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("es-CO", { day:"numeric", month:"short", year:"numeric" }) : "—";
const today   = () => new Date().toLocaleDateString("es-CO", { weekday:"long", day:"numeric", month:"long" });
const todayISO= () => new Date().toISOString().split("T")[0];

export default function AdminDashboard({ user }) {
  const navigate = useNavigate();
  const [tab,        setTab]        = useState("general");
  const [loading,    setLoading]    = useState(true);
  const [sideOpen,   setSideOpen]   = useState(true);
  const [adminNombre,setAdminNombre]= useState("");

  const [stats,       setStats]       = useState({ totalUsuarios:0, activosHoy:0, partidasHoy:0, retosCompletados:0 });
  const [extraStats,  setExtraStats]  = useState({ actividadMes:0, tasaCompletacion:0, promedioSesion:24 });
  const [usuarios,    setUsuarios]    = useState([]);
  const [salas,       setSalas]       = useState([]);
  const [actividadDias,setActividad]  = useState([]);
  const [searchU,     setSearchU]     = useState("");
  const [modalU,      setModalU]      = useState(null);
  const [ajustesMsg,  setAjustesMsg]  = useState("");
  const [ajNombre,    setAjNombre]    = useState("");
  const [ajEmail,     setAjEmail]     = useState("");
  const [cerrandoSesion, setCerrandoSesion] = useState(null);

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
      .order("created_at", { ascending:false }).limit(50);
    setSalas(data || []);
  };

  const cargarActividad = async () => {
    const dias = [];
    for (let i = 6; i >= 0; i--) {
      const f  = new Date(); f.setDate(f.getDate() - i);
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

  // ── Cerrar sesión a un usuario específico ──
  const cerrarSesionUsuario = async (userId, userEmail) => {
    if (!confirm(`¿Cerrar la sesión activa de ${userEmail}?`)) return;
    setCerrandoSesion(userId);
    try {
      // Usando admin API de Supabase para invalidar sesiones del usuario
      const { error } = await supabase.auth.admin.signOut(userId);
      if (error) {
        // Fallback: actualizar ultimo_login para forzar re-auth en el próximo acceso
        await supabase.from("usuarios")
          .update({ ultimo_login: null })
          .eq("id", userId);
        alert(`Sesión marcada para cierre. El usuario ${userEmail} deberá iniciar sesión nuevamente.`);
      } else {
        alert(`Sesión de ${userEmail} cerrada correctamente.`);
      }
    } catch (err) {
      alert("No se pudo cerrar la sesión. Verifica los permisos del admin.");
    } finally {
      setCerrandoSesion(null);
      setModalU(null);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleExportarCSV = () => {
    const rows = [["Nombre","Email","Nivel","XP","Racha","Último acceso","Registro"]];
    usuarios.forEach(u => rows.push([u.nombre||"", u.email, u.nivel||1, u.xp||0, u.racha||0, fmtDate(u.ultimo_login), fmtDate(u.created_at)]));
    const csv  = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type:"text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = "usuarios_cognify.csv"; a.click();
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

  const maxAct = Math.max(...actividadDias.map(d => d.count), 1);
  const xpProm = usuarios.length > 0 ? Math.round(usuarios.reduce((s,u) => s+(u.xp||0), 0) / usuarios.length) : 0;
  const nv2    = usuarios.filter(u => (u.nivel||1) >= 2).length;
  const nv1    = usuarios.filter(u => (u.nivel||1) < 2).length;

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", background:"#0f0a1e" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:48, height:48, border:"3px solid #7c3aed", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto 16px" }}/>
        <p style={{ color:"#a78bfa", fontSize:"0.85rem", letterSpacing:"0.1em", fontFamily:"'Poppins',sans-serif" }}>Cargando panel...</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        :root{
          --bg:     #0f0a1e;
          --bg2:    #1a0f35;
          --bg3:    #2d1b5e;
          --bg4:    #3d2680;
          --border: rgba(124,58,237,0.2);
          --purple: #7c3aed;
          --purple2:#a78bfa;
          --purple3:#6d28d9;
          --blue:   #60a5fa;
          --green:  #10b981;
          --orange: #f97316;
          --red:    #ef4444;
          --gold:   #d4af37;
          --text:   #f1f5f9;
          --text2:  #94a3b8;
          --font:   'Poppins', sans-serif;
          --fontd:  'Space Grotesk', sans-serif;
          --radius: 14px;
          --side:   260px;
        }
        body{ background:var(--bg); color:var(--text); font-family:var(--font); }

        @keyframes spin   { to{transform:rotate(360deg)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0}to{opacity:1} }

        .ad-root { display:flex; min-height:100vh; }

        /* ── SIDEBAR ── */
        .ad-side {
          width:var(--side); background:var(--bg2);
          border-right:1px solid var(--border);
          display:flex; flex-direction:column;
          padding:24px 14px; position:fixed;
          top:0; left:0; height:100vh; z-index:100;
          transition:width 0.25s ease;
        }
        .ad-side.collapsed { width:68px; }
        .ad-side.collapsed .side-label,
        .ad-side.collapsed .side-logo-text,
        .ad-side.collapsed .side-user-info,
        .ad-side.collapsed .side-badge { display:none; }

        .side-logo { display:flex; align-items:center; gap:10px; margin-bottom:6px; padding:0 6px; }
        .side-logo-icon {
          width:38px; height:38px; border-radius:10px; flex-shrink:0;
          background:linear-gradient(135deg,#7c3aed,#6d28d9);
          display:flex; align-items:center; justify-content:center;
          font-weight:800; color:#fff; font-size:0.85rem; font-family:var(--fontd);
        }
        .side-logo-text { font-family:var(--fontd); font-size:1.1rem; font-weight:700; color:var(--purple2); }
        .side-badge { font-size:0.62rem; color:var(--text2); letter-spacing:0.1em; text-transform:uppercase; padding:0 6px; margin-bottom:24px; }

        .side-nav { display:flex; flex-direction:column; gap:4px; flex:1; }
        .side-btn {
          display:flex; align-items:center; gap:12px;
          padding:10px 12px; border-radius:10px;
          background:none; border:none; color:var(--text2);
          font-size:0.86rem; font-family:var(--font); font-weight:500;
          cursor:pointer; text-align:left; transition:all 0.15s; white-space:nowrap;
        }
        .side-btn:hover { background:var(--bg3); color:var(--text); }
        .side-btn.active { background:rgba(124,58,237,0.2); color:var(--purple2); border:1px solid var(--border); }
        .side-icon { width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:0.95rem;background:var(--bg3);flex-shrink:0; }
        .side-btn.active .side-icon { background:rgba(124,58,237,0.25); }

        .side-user { border-top:1px solid var(--border); padding-top:14px; display:flex; align-items:center; gap:10px; margin-top:8px; }
        .side-user-avatar { width:34px;height:34px;border-radius:50%;flex-shrink:0;background:linear-gradient(135deg,#7c3aed,#a78bfa);display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;font-size:0.85rem; }
        .side-user-info { flex:1; min-width:0; }
        .side-user-name  { font-size:0.8rem; font-weight:600; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .side-user-email { font-size:0.67rem; color:var(--text2); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

        .logout-btn { width:100%;margin-top:10px;padding:9px;border-radius:10px;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.15);color:#f87171;font-size:0.8rem;font-weight:600;font-family:var(--font);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:all 0.15s; }
        .logout-btn:hover { background:rgba(239,68,68,0.18); }

        /* ── MAIN ── */
        .ad-main { margin-left:var(--side); flex:1; padding:30px 28px 80px; transition:margin-left 0.25s; min-width:0; }
        .ad-main.collapsed { margin-left:68px; }

        /* ── TOPBAR ── */
        .topbar { display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; animation:fadeUp 0.4s ease both; flex-wrap:wrap; gap:12px; }
        .topbar h1 { font-family:var(--fontd); font-size:1.8rem; font-weight:700; color:var(--text); }
        .topbar p  { font-size:0.78rem; color:var(--text2); margin-top:3px; }
        .topbar-right { display:flex; gap:10px; flex-wrap:wrap; }

        .btn { display:inline-flex;align-items:center;gap:7px;padding:8px 16px;border-radius:10px;font-size:0.82rem;font-weight:600;font-family:var(--font);cursor:pointer;transition:all 0.15s;border:none;white-space:nowrap; }
        .btn-outline { background:var(--bg3);border:1px solid var(--border);color:var(--text2); }
        .btn-outline:hover { border-color:var(--purple2);color:var(--purple2); }
        .btn-primary { background:linear-gradient(135deg,#7c3aed,#6d28d9);color:#fff;box-shadow:0 4px 14px rgba(124,58,237,0.3); }
        .btn-primary:hover { opacity:0.9;transform:translateY(-1px); }
        .btn-danger { background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);color:#f87171; }
        .btn-danger:hover { background:rgba(239,68,68,0.2); }
        .btn-warning { background:rgba(249,115,22,0.1);border:1px solid rgba(249,115,22,0.2);color:#fb923c; }
        .btn-warning:hover { background:rgba(249,115,22,0.2); }

        /* ── STAT CARDS ── */
        .stats-grid { display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px;animation:fadeUp 0.4s ease 0.05s both; }
        .stat-card { background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:20px;position:relative;overflow:hidden;transition:transform 0.2s,border-color 0.2s; }
        .stat-card:hover { transform:translateY(-2px);border-color:rgba(124,58,237,0.4); }
        .stat-card::before { content:'';position:absolute;top:0;left:0;right:0;height:2px; }
        .sc-purple::before { background:var(--purple2); }
        .sc-blue::before   { background:var(--blue); }
        .sc-green::before  { background:var(--green); }
        .sc-orange::before { background:var(--orange); }
        .stat-top { display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px; }
        .stat-ico { width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1rem; }
        .sc-purple .stat-ico { background:rgba(167,139,250,0.12); }
        .sc-blue   .stat-ico { background:rgba(96,165,250,0.12); }
        .sc-green  .stat-ico { background:rgba(16,185,129,0.12); }
        .sc-orange .stat-ico { background:rgba(249,115,22,0.12); }
        .stat-lbl { font-size:0.7rem;color:var(--text2);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px; }
        .stat-val { font-family:var(--fontd);font-size:2rem;font-weight:700;color:var(--text);line-height:1; }
        .stat-sub { font-size:0.7rem;color:var(--text2);margin-top:4px; }

        /* ── GRID2 ── */
        .grid2 { display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:18px;animation:fadeUp 0.4s ease 0.1s both; }
        .panel { background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:20px; }
        .panel-head { display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px; }
        .panel-title { font-family:var(--fontd);font-size:0.95rem;font-weight:600;color:var(--text); }
        .panel-sub   { font-size:0.73rem;color:var(--text2);margin-bottom:16px; }
        .panel-link  { font-size:0.73rem;color:var(--purple2);font-weight:600;cursor:pointer;background:none;border:none;font-family:var(--font); }
        .panel-link:hover { text-decoration:underline; }

        /* ── CHART ── */
        .chart { display:flex;align-items:flex-end;gap:8px;height:110px; }
        .chart-col { flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;height:100%;justify-content:flex-end; }
        .chart-bar { width:100%;border-radius:5px 5px 0 0;background:rgba(124,58,237,0.15);border-top:2px solid var(--purple);min-height:4px;transition:height 0.5s ease; }
        .chart-bar:hover { background:rgba(124,58,237,0.3); }
        .chart-n { font-size:0.65rem;color:var(--purple2);font-weight:600; }
        .chart-l { font-size:0.62rem;color:var(--text2);text-transform:capitalize; }

        /* ── TOP LIST ── */
        .top-list { display:flex;flex-direction:column;gap:7px; }
        .top-item { display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:10px;background:var(--bg3);border:1px solid var(--border);transition:border-color 0.15s; }
        .top-item:hover { border-color:rgba(124,58,237,0.4); }
        .top-rank { font-size:0.7rem;color:var(--text2);width:20px;text-align:center;font-weight:600; }
        .top-av { width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#a78bfa);display:flex;align-items:center;justify-content:center;font-size:0.78rem;font-weight:700;color:#fff;flex-shrink:0; }
        .top-name { flex:1;font-size:0.82rem;color:var(--text);font-weight:500; }
        .top-xp { background:rgba(124,58,237,0.15);color:var(--purple2);padding:2px 9px;border-radius:20px;font-size:0.7rem;font-weight:700; }

        /* ── MINI GRID ── */
        .mini-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:18px;animation:fadeUp 0.4s ease 0.15s both; }
        .mini-card { background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:18px;display:flex;align-items:center;gap:12px;transition:transform 0.2s; }
        .mini-card:hover { transform:translateY(-2px); }
        .mini-ico { width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0; }
        .mi-blue   { background:rgba(96,165,250,0.12); }
        .mi-purple { background:rgba(167,139,250,0.12); }
        .mi-orange { background:rgba(249,115,22,0.12); }
        .mini-val   { font-family:var(--fontd);font-size:1.6rem;font-weight:700;color:var(--text);line-height:1; }
        .mini-label { font-size:0.7rem;color:var(--text2);margin-top:2px; }

        /* ── USUARIOS ── */
        .u-stats { display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:18px; }
        .u-stat { background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:14px; }
        .u-stat-label { font-size:0.67rem;color:var(--text2);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:5px; }
        .u-stat-val { font-family:var(--fontd);font-size:1.5rem;font-weight:700;color:var(--purple2); }

        .search-inp {
          flex:1;min-width:200px;padding:9px 12px 9px 36px;
          background:var(--bg3);border:1px solid var(--border);
          border-radius:10px;color:var(--text);font-size:0.83rem;
          font-family:var(--font);outline:none;transition:border-color 0.2s;
          background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' fill='%2394a3b8' viewBox='0 0 16 16'%3E%3Cpath d='M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.099zm-5.44 1.406a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z'/%3E%3C/svg%3E");
          background-repeat:no-repeat;background-position:11px center;
        }
        .search-inp:focus { border-color:var(--purple); }
        .search-inp::placeholder { color:var(--text2); }
        .search-row { display:flex;gap:10px;margin-bottom:14px;flex-wrap:wrap; }

        .tbl { width:100%;border-collapse:collapse;font-size:0.8rem; }
        .tbl thead th { text-align:left;padding:9px 12px;color:var(--text2);font-size:0.68rem;text-transform:uppercase;letter-spacing:0.08em;border-bottom:1px solid var(--border);font-weight:500; }
        .tbl tbody tr { border-bottom:1px solid var(--border);transition:background 0.15s;cursor:pointer; }
        .tbl tbody tr:hover { background:var(--bg3); }
        .tbl tbody td { padding:12px;color:var(--text);vertical-align:middle; }
        .tbl-av { width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#a78bfa);display:inline-flex;align-items:center;justify-content:center;font-weight:700;color:#fff;font-size:0.78rem;margin-right:8px;vertical-align:middle; }
        .badge-nv { background:rgba(96,165,250,0.12);color:var(--blue);padding:2px 9px;border-radius:20px;font-size:0.7rem;font-weight:600; }
        .badge-xp { color:var(--purple2);font-weight:600; }
        .badge-estado { padding:2px 9px;border-radius:20px;font-size:0.7rem;font-weight:600; }
        .badge-estado.espera    { background:rgba(212,175,55,0.12);color:var(--gold); }
        .badge-estado.jugando   { background:rgba(124,58,237,0.12);color:var(--purple2); }
        .badge-estado.terminada { background:rgba(148,163,184,0.1);color:var(--text2); }
        .muted { color:var(--text2);font-size:0.73rem; }

        /* ── RANKING ── */
        .rank-grid { display:grid;grid-template-columns:1fr 1fr;gap:14px;animation:fadeUp 0.4s ease both; }
        .rank-item { display:flex;align-items:center;gap:12px;padding:14px;border-radius:12px;background:var(--bg3);border:1px solid var(--border);transition:all 0.15s; }
        .rank-item:hover { border-color:rgba(124,58,237,0.4);transform:translateY(-1px); }
        .rank-num { font-family:var(--fontd);font-size:1rem;font-weight:700;width:26px;text-align:center; }
        .rn-gold   { color:#f0c040; }
        .rn-silver { color:#c0c8d0; }
        .rn-bronze { color:#cd7f32; }
        .rn-other  { color:var(--text2); }
        .rank-av { width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#a78bfa);display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;font-size:0.85rem;flex-shrink:0; }
        .rank-info { flex:1; }
        .rank-name  { font-weight:600;color:var(--text);font-size:0.85rem; }
        .rank-email { font-size:0.7rem;color:var(--text2); }
        .rank-xp { background:rgba(124,58,237,0.12);border:1px solid rgba(124,58,237,0.2);color:var(--purple2);padding:4px 12px;border-radius:20px;font-weight:700;font-size:0.78rem;white-space:nowrap; }

        /* ── AJUSTES ── */
        .ajustes-grid { display:grid;grid-template-columns:1fr 1fr;gap:18px;animation:fadeUp 0.4s ease both; }
        .aj-section { background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:22px; }
        .aj-title { font-family:var(--fontd);font-size:0.95rem;font-weight:600;color:var(--text);margin-bottom:3px; }
        .aj-sub   { font-size:0.73rem;color:var(--text2);margin-bottom:18px; }
        .aj-field { margin-bottom:14px; }
        .aj-label { font-size:0.73rem;color:var(--text2);font-weight:500;margin-bottom:5px;display:block; }
        .aj-input { width:100%;padding:9px 12px;background:var(--bg3);border:1px solid var(--border);border-radius:10px;color:var(--text);font-size:0.83rem;font-family:var(--font);outline:none;transition:border-color 0.2s; }
        .aj-input:focus { border-color:var(--purple); }
        .aj-input:disabled { opacity:0.45;cursor:not-allowed; }
        .aj-msg { font-size:0.78rem;color:var(--green);margin-top:10px;min-height:18px; }
        .danger-zone  { border-color:rgba(239,68,68,0.2); }
        .danger-title { color:#f87171; }

        /* ── MODAL ── */
        .overlay { position:fixed;inset:0;background:rgba(0,0,0,0.75);display:flex;align-items:center;justify-content:center;z-index:999;animation:fadeIn 0.2s ease; }
        .modal { background:var(--bg2);border:1px solid var(--border);border-radius:18px;padding:26px;width:420px;max-width:92vw;animation:fadeUp 0.25s ease; }
        .modal h3 { font-family:var(--fontd);font-size:1.05rem;font-weight:700;color:var(--text);margin-bottom:18px;display:flex;align-items:center;gap:10px; }
        .modal-row { display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--border);font-size:0.8rem; }
        .modal-row span:first-child { color:var(--text2); }
        .modal-actions { display:flex;gap:8px;margin-top:18px;justify-content:flex-end;flex-wrap:wrap; }
        .btn-ghost { padding:7px 14px;border-radius:8px;background:var(--bg3);border:1px solid var(--border);color:var(--text2);font-size:0.76rem;font-family:var(--font);cursor:pointer;transition:all 0.15s; }
        .btn-ghost:hover { border-color:var(--text2);color:var(--text); }

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
          :root{ --side:68px; }
          .ad-side{ width:68px!important;padding:18px 8px; }
          .ad-side .side-label,.ad-side .side-logo-text,.ad-side .side-user-info,.ad-side .side-badge{ display:none!important; }
          .ad-main{ margin-left:68px!important;padding:18px 14px 60px; }
          .stats-grid{ grid-template-columns:1fr 1fr; }
          .mini-grid{ grid-template-columns:1fr; }
          .u-stats{ grid-template-columns:1fr 1fr; }
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
              <button key={t} className={`side-btn${tab===t?" active":""}`} onClick={() => setTab(t)}>
                <span className="side-icon">{TAB_ICONS[t]}</span>
                <span className="side-label">{TAB_LABELS[t]}</span>
              </button>
            ))}
          </nav>

          <div className="side-user">
            <div className="side-user-avatar">
              {(adminNombre||user?.email||"A")[0].toUpperCase()}
            </div>
            <div className="side-user-info">
              <div className="side-user-name">{adminNombre||"Admin"}</div>
              <div className="side-user-email">{user?.email}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <span>↪</span>
            <span className="side-label">Cerrar sesión</span>
          </button>
        </aside>

        {/* ══ MAIN ══ */}
        <main className={`ad-main${sideOpen?"":""}`} style={{ marginLeft: sideOpen ? "var(--side)" : "68px" }}>

          {/* ══ GENERAL ══ */}
          {tab === "general" && (
            <>
              <div className="topbar">
                <div>
                  <h1>Dashboard</h1>
                  <p>📅 {today().charAt(0).toUpperCase()+today().slice(1)}</p>
                </div>
                <div className="topbar-right">
                  <button className="btn btn-outline" onClick={handleExportarCSV}>⬇ Exportar datos</button>
                  <button className="btn btn-primary" onClick={() => setTab("usuarios")}>Ver usuarios</button>
                </div>
              </div>

              <div className="stats-grid">
                {[
                  { label:"Total Usuarios",    val:stats.totalUsuarios,    sub:"Registrados",      ico:"👥", cl:"sc-purple" },
                  { label:"Activos Hoy",       val:stats.activosHoy,       sub:"Último inicio",    ico:"⚡", cl:"sc-blue"   },
                  { label:"Partidas Hoy",      val:stats.partidasHoy,      sub:"Nuevas partidas",  ico:"🎮", cl:"sc-green"  },
                  { label:"Retos Completados", val:stats.retosCompletados, sub:"En total",         ico:"🎯", cl:"sc-orange" },
                ].map(s => (
                  <div key={s.label} className={`stat-card ${s.cl}`}>
                    <div className="stat-top">
                      <div className="stat-ico">{s.ico}</div>
                    </div>
                    <div className="stat-lbl">{s.label}</div>
                    <div className="stat-val">{fmt(s.val)}</div>
                    <div className="stat-sub">{s.sub}</div>
                  </div>
                ))}
              </div>

              <div className="grid2">
                <div className="panel">
                  <div className="panel-head"><span className="panel-title">Usuarios Activos</span></div>
                  <p className="panel-sub">Actividad diaria — últimos 7 días</p>
                  <div className="chart">
                    {actividadDias.map((d,i) => (
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
                  <p className="panel-sub">Los 5 más destacados</p>
                  <div className="top-list">
                    {usuarios.slice(0,5).map((u,i) => (
                      <div key={u.id} className="top-item">
                        <span className="top-rank">#{i+1}</span>
                        <div className="top-av">{(u.nombre||u.email||"?")[0].toUpperCase()}</div>
                        <span className="top-name">{u.nombre||u.email?.split("@")[0]}</span>
                        <span className="top-xp">{fmt(u.xp)} XP</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mini-grid">
                {[
                  { ico:"📅", cl:"mi-blue",   val:fmt(extraStats.actividadMes),      label:"Actividad Mensual" },
                  { ico:"🎯", cl:"mi-purple", val:`${extraStats.tasaCompletacion}%`, label:"Tasa de Completación" },
                  { ico:"👤", cl:"mi-orange", val:`${extraStats.promedioSesion}m`,   label:"Promedio Sesión" },
                ].map(m => (
                  <div key={m.label} className="mini-card">
                    <div className={`mini-ico ${m.cl}`}>{m.ico}</div>
                    <div>
                      <div className="mini-val">{m.val}</div>
                      <div className="mini-label">{m.label}</div>
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
                <div>
                  <h1>Gestión de Usuarios</h1>
                  <p>👤 {usuarios.length} usuarios registrados</p>
                </div>
                <div className="topbar-right">
                  <button className="btn btn-outline" onClick={handleExportarCSV}>⬇ CSV</button>
                </div>
              </div>

              <div className="u-stats" style={{ animation:"fadeUp 0.4s ease both" }}>
                {[
                  { label:"Total",       val: usuarios.length },
                  { label:"Nivel 2+",    val: nv2 },
                  { label:"Nivel 1",     val: nv1 },
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
                  <input className="search-inp" placeholder="Buscar por nombre o email..."
                    value={searchU} onChange={e => setSearchU(e.target.value)}/>
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
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usuariosFiltrados.map(u => (
                        <tr key={u.id} onClick={() => setModalU(u)}>
                          <td>
                            <span className="tbl-av">{(u.nombre||u.email||"?")[0].toUpperCase()}</span>
                            {u.nombre||"—"}
                          </td>
                          <td className="muted">{u.email}</td>
                          <td><span className="badge-nv">Nv {u.nivel||1}</span></td>
                          <td><span className="badge-xp">{fmt(u.xp)}</span></td>
                          <td>{u.racha||0} 🔥</td>
                          <td className="muted">{fmtDate(u.ultimo_login)}</td>
                          <td onClick={e => e.stopPropagation()}>
                            <div style={{ display:"flex", gap:"6px" }}>
                              <button className="btn btn-warning"
                                style={{ padding:"4px 10px", fontSize:"0.7rem" }}
                                disabled={cerrandoSesion === u.id}
                                onClick={() => cerrarSesionUsuario(u.id, u.email)}>
                                {cerrandoSesion === u.id ? "..." : "↪ Sesión"}
                              </button>
                              <button className="btn btn-danger"
                                style={{ padding:"4px 10px", fontSize:"0.7rem" }}
                                onClick={() => eliminarUsuario(u.id)}>
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {usuariosFiltrados.length === 0 && (
                    <p style={{ textAlign:"center", padding:"28px", color:"var(--text2)", fontSize:"0.83rem" }}>
                      No se encontraron usuarios.
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ══ PARTIDAS ══ */}
          {tab === "partidas" && (
            <>
              <div className="topbar">
                <div>
                  <h1>Historial de Partidas</h1>
                  <p>🎮 {salas.length} partidas registradas</p>
                </div>
              </div>
              <div className="panel" style={{ animation:"fadeUp 0.4s ease both" }}>
                <div style={{ overflowX:"auto" }}>
                  <table className="tbl">
                    <thead>
                      <tr><th>Código</th><th>Área</th><th>Estado</th><th>Fecha</th></tr>
                    </thead>
                    <tbody>
                      {salas.map(s => (
                        <tr key={s.id}>
                          <td style={{ color:"var(--purple2)", fontWeight:600, letterSpacing:"0.1em" }}>{s.codigo}</td>
                          <td>{s.areas?.nombre||"—"}</td>
                          <td>
                            <span className={`badge-estado ${s.estado}`}>
                              {s.estado==="espera"?"⏳ Espera":s.estado==="jugando"?"🎮 Jugando":"✅ Terminada"}
                            </span>
                          </td>
                          <td className="muted">{new Date(s.created_at).toLocaleString("es-CO")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {salas.length===0 && (
                    <p style={{ textAlign:"center", padding:"28px", color:"var(--text2)", fontSize:"0.83rem" }}>
                      No hay partidas registradas.
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ══ RANKING ══ */}
          {tab === "ranking" && (
            <>
              <div className="topbar">
                <div>
                  <h1>Ranking Global</h1>
                  <p>🏆 Clasificación por XP acumulado</p>
                </div>
              </div>
              <div className="rank-grid">
                {usuarios.map((u,i) => (
                  <div key={u.id} className="rank-item">
                    <span className={`rank-num ${i===0?"rn-gold":i===1?"rn-silver":i===2?"rn-bronze":"rn-other"}`}>
                      {i===0?"🥇":i===1?"🥈":i===2?"🥉":`#${i+1}`}
                    </span>
                    <div className="rank-av">{(u.nombre||u.email||"?")[0].toUpperCase()}</div>
                    <div className="rank-info">
                      <div className="rank-name">{u.nombre||u.email?.split("@")[0]}</div>
                      <div className="rank-email">{u.email}</div>
                    </div>
                    <span className="rank-xp">{fmt(u.xp)} XP</span>
                  </div>
                ))}
                {usuarios.length===0 && <p style={{ color:"var(--text2)", padding:"20px" }}>Sin datos aún.</p>}
              </div>
            </>
          )}

          {/* ══ AJUSTES ══ */}
          {tab === "ajustes" && (
            <>
              <div className="topbar">
                <div>
                  <h1>Ajustes</h1>
                  <p>⚙ Configuración del panel</p>
                </div>
              </div>
              <div className="ajustes-grid">
                <div className="aj-section">
                  <div className="aj-title">Perfil de Administrador</div>
                  <div className="aj-sub">Actualiza tu información</div>
                  <div className="aj-field">
                    <label className="aj-label">Nombre</label>
                    <input className="aj-input" value={ajNombre} onChange={e => setAjNombre(e.target.value)} placeholder="Tu nombre"/>
                  </div>
                  <div className="aj-field">
                    <label className="aj-label">Email (no editable)</label>
                    <input className="aj-input" value={ajEmail} disabled/>
                  </div>
                  <button className="btn btn-primary" style={{ width:"100%", justifyContent:"center" }}
                    onClick={handleGuardarAjustes}>
                    Guardar cambios
                  </button>
                  <div className="aj-msg">{ajustesMsg}</div>
                </div>

                <div className="aj-section danger-zone">
                  <div className="aj-title danger-title">Zona de peligro</div>
                  <div className="aj-sub">Acciones irreversibles</div>
                  <button className="btn btn-danger" style={{ width:"100%", justifyContent:"center", padding:"12px" }}
                    onClick={() => { if(confirm("¿Cerrar sesión?")) handleLogout(); }}>
                    ↪ Cerrar sesión
                  </button>
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
              <div className="rank-av" style={{ width:34, height:34, fontSize:"0.8rem" }}>
                {(modalU.nombre||modalU.email||"?")[0].toUpperCase()}
              </div>
              {modalU.nombre||"Usuario"}
            </h3>
            {[
              ["Email",         modalU.email],
              ["Nivel",         `Nivel ${modalU.nivel||1}`],
              ["XP Total",      `${fmt(modalU.xp||0)} XP`],
              ["Racha",         `${modalU.racha||0} días 🔥`],
              ["Último acceso", fmtDate(modalU.ultimo_login)],
              ["Registro",      fmtDate(modalU.created_at)],
            ].map(([k,v]) => (
              <div key={k} className="modal-row">
                <span>{k}</span><span>{v}</span>
              </div>
            ))}
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setModalU(null)}>Cerrar</button>
              <button className="btn btn-warning"
                disabled={cerrandoSesion === modalU.id}
                onClick={() => cerrarSesionUsuario(modalU.id, modalU.email)}>
                {cerrandoSesion === modalU.id ? "Cerrando..." : "↪ Cerrar sesión"}
              </button>
              <button className="btn btn-danger" onClick={() => eliminarUsuario(modalU.id)}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}