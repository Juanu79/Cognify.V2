import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import Navbar from "../components/Navbar";

export default function Profile() {
  const [user,     setUser]     = useState(null);
  const [nombre,   setNombre]   = useState("");
  const [email,    setEmail]    = useState("");
  const [bio,      setBio]      = useState("");
  const [editando, setEditando] = useState(false);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [success,  setSuccess]  = useState("");
  const [error,    setError]    = useState("");
  const [stats,    setStats]    = useState({ retos: 0, racha: 0, xp: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (!data.user) { navigate("/"); return; }
        const u = data.user;
        setUser(u);
        setEmail(u.email);

        const { data: uDB } = await supabase
          .from("usuarios")
          .select("nombre, xp, nivel, racha")
          .eq("id", u.id)
          .single();

        const displayName =
          uDB?.nombre ||
          u.user_metadata?.full_name ||
          u.user_metadata?.name ||
          u.email.split("@")[0];

        setNombre(displayName);
        setBio(uDB?.bio || "");

        const { count: retos } = await supabase
          .from("progreso")
          .select("*", { count: "exact", head: true })
          .eq("usuario_id", u.id)
          .eq("completado", true);

        setStats({ retos: retos || 0, racha: uDB?.racha || 0, xp: uDB?.xp || 0 });

      } catch (err) {
        setError("Error al cargar el perfil");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setError(""); setSuccess("");
    try {
      const { error } = await supabase
        .from("usuarios")
        .update({ nombre })
        .eq("id", user.id);
      if (error) throw error;
      setSuccess("¡Perfil actualizado correctamente!");
      setEditando(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Error al guardar los cambios.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const avatar   = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;
  const inicial  = (nombre || email || "?")[0].toUpperCase();
  const provider = user?.app_metadata?.provider || "email";

  if (loading) return (
    <>
      <Navbar />
      <div style={loadWrap}>
        <div style={spinnerSt} />
        <p style={{ color:"#94a3b8", fontFamily:"Poppins,sans-serif" }}>Cargando perfil...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        body { background: #0f0a1e; font-family:'Poppins',sans-serif; }

        @keyframes spin   { to{transform:rotate(360deg)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

        .pf-wrap {
          max-width:1000px; margin:0 auto;
          padding:100px 24px 80px;
          animation: fadeUp 0.5s ease both;
        }
        .pf-header { margin-bottom:32px; }
        .pf-header h1 { font-size:2rem; font-weight:800; color:#f1f5f9; margin-bottom:4px; }
        .pf-header p  { color:#7c6fa0; font-size:0.9rem; }

        .pf-grid {
          display:grid; grid-template-columns:280px 1fr;
          gap:20px; align-items:start;
        }
        @media(max-width:720px){ .pf-grid{ grid-template-columns:1fr; } }

        /* ── Panel izquierdo ── */
        .pf-left {
          background: linear-gradient(160deg,#1a0f35,#2d1b5e);
          border-radius:20px; padding:28px 20px;
          border:1px solid rgba(124,58,237,0.2);
          display:flex; flex-direction:column; align-items:center; gap:14px;
        }
        .pf-avatar {
          width:88px; height:88px; border-radius:50%;
          background:linear-gradient(135deg,#7c3aed,#6d28d9);
          display:flex; align-items:center; justify-content:center;
          color:#fff; font-size:2.2rem; font-weight:800;
          border:3px solid #7c3aed; overflow:hidden; flex-shrink:0;
          margin-bottom:4px;
        }
        .pf-avatar img { width:100%; height:100%; object-fit:cover; }
        .pf-name     { font-size:1.1rem; font-weight:700; color:#f1f5f9; text-align:center; }
        .pf-email    { font-size:0.76rem; color:#7c6fa0; text-align:center; word-break:break-all; }
        .pf-provider {
          background:rgba(124,58,237,0.15); color:#a78bfa;
          padding:4px 14px; border-radius:20px;
          font-size:0.74rem; font-weight:600;
          border:1px solid rgba(124,58,237,0.3);
        }

        .pf-stat {
          width:100%; background:rgba(255,255,255,0.04);
          border-radius:14px; padding:14px 18px;
          border:1px solid rgba(255,255,255,0.06);
        }
        .pf-stat-label {
          display:flex; align-items:center; gap:6px;
          font-size:0.77rem; color:#7c6fa0; font-weight:500; margin-bottom:4px;
        }
        .pf-stat-val { font-size:1.55rem; font-weight:800; color:#f1f5f9; }

        .btn-logout {
          width:100%; padding:11px; border:none; border-radius:12px;
          background:rgba(239,68,68,0.1); color:#f87171;
          font-weight:600; font-size:0.88rem; cursor:pointer;
          font-family:'Poppins',sans-serif;
          border:1px solid rgba(239,68,68,0.2);
          transition:background 0.2s; margin-top:4px;
        }
        .btn-logout:hover { background:rgba(239,68,68,0.2); }

        /* ── Panel derecho ── */
        .pf-right {
          background:linear-gradient(160deg,#1a0f35,#2d1b5e);
          border-radius:20px; padding:28px;
          border:1px solid rgba(124,58,237,0.2);
        }
        .pf-sec-header {
          display:flex; justify-content:space-between; align-items:center;
          margin-bottom:24px;
        }
        .pf-sec-header h2 { font-size:1.1rem; font-weight:700; color:#f1f5f9; }

        .btn-edit {
          display:flex; align-items:center; gap:6px;
          background:linear-gradient(135deg,#7c3aed,#6d28d9);
          color:#fff; padding:8px 18px; border-radius:10px;
          font-weight:600; font-size:0.84rem; border:none;
          cursor:pointer; font-family:'Poppins',sans-serif;
          transition:opacity 0.2s;
        }
        .btn-edit:hover { opacity:0.9; }

        .pf-field { margin-bottom:20px; }
        .pf-field label {
          display:flex; align-items:center; gap:6px;
          font-size:0.8rem; color:#7c6fa0; font-weight:500; margin-bottom:7px;
        }
        .pf-input {
          width:100%; padding:12px 16px;
          background:rgba(255,255,255,0.05);
          border:1.5px solid rgba(124,58,237,0.25);
          border-radius:12px; color:#f1f5f9;
          font-size:0.95rem; font-family:'Poppins',sans-serif;
          outline:none; transition:border-color 0.2s;
        }
        .pf-input:focus    { border-color:#7c3aed; }
        .pf-input:disabled { opacity:0.45; cursor:not-allowed; background:rgba(255,255,255,0.02); }

        .pf-textarea {
          width:100%; padding:12px 16px;
          background:rgba(255,255,255,0.05);
          border:1.5px solid rgba(124,58,237,0.25);
          border-radius:12px; color:#f1f5f9;
          font-size:0.92rem; font-family:'Poppins',sans-serif;
          outline:none; resize:vertical; min-height:90px;
          transition:border-color 0.2s;
        }
        .pf-textarea:focus    { border-color:#7c3aed; }
        .pf-textarea:disabled { opacity:0.45; cursor:not-allowed; background:rgba(255,255,255,0.02); }
        .char-count { font-size:0.72rem; color:#7c6fa0; margin-top:4px; text-align:right; }

        .pf-actions { display:flex; gap:12px; margin-top:8px; }
        .btn-save {
          flex:1; padding:12px; border:none; border-radius:12px;
          background:linear-gradient(135deg,#7c3aed,#6d28d9);
          color:#fff; font-weight:700; font-size:0.95rem;
          cursor:pointer; font-family:'Poppins',sans-serif; transition:opacity 0.2s;
        }
        .btn-save:hover:not(:disabled) { opacity:0.9; }
        .btn-save:disabled { opacity:0.55; cursor:not-allowed; }
        .btn-cancel-edit {
          padding:12px 20px; border-radius:12px;
          background:rgba(255,255,255,0.05);
          border:1px solid rgba(255,255,255,0.1);
          color:#94a3b8; font-weight:600; font-size:0.9rem;
          cursor:pointer; font-family:'Poppins',sans-serif; transition:background 0.2s;
        }
        .btn-cancel-edit:hover { background:rgba(255,255,255,0.1); }

        .toast-ok {
          background:rgba(16,185,129,0.12); color:#6ee7b7;
          padding:11px 16px; border-radius:10px; margin-bottom:16px;
          font-size:0.87rem; font-weight:500;
          border:1px solid rgba(16,185,129,0.25);
          animation:fadeUp 0.3s ease;
        }
        .toast-err {
          background:rgba(239,68,68,0.12); color:#fca5a5;
          padding:11px 16px; border-radius:10px; margin-bottom:16px;
          font-size:0.87rem; font-weight:500;
          border:1px solid rgba(239,68,68,0.25);
          animation:fadeUp 0.3s ease;
        }
      `}</style>

      <Navbar />

      <div className="pf-wrap">
        <div className="pf-header">
          <h1>Personalización de Perfil</h1>
          <p>Gestiona tu identidad en la plataforma de retos</p>
        </div>

        <div className="pf-grid">

          {/* ── Izquierda ── */}
          <div className="pf-left">
            <div className="pf-avatar">
              {avatar ? <img src={avatar} alt="avatar" /> : inicial}
            </div>
            <p className="pf-name">{nombre}</p>
            <p className="pf-email">{email}</p>
            <span className="pf-provider">Login con: {provider}</span>

            <div className="pf-stat">
              <div className="pf-stat-label">🏆 Retos Completados</div>
              <div className="pf-stat-val">{stats.retos}</div>
            </div>
            <div className="pf-stat">
              <div className="pf-stat-label">⚡ Racha Actual</div>
              <div className="pf-stat-val">{stats.racha} días</div>
            </div>
            <div className="pf-stat">
              <div className="pf-stat-label">🎯 Puntos Totales</div>
              <div className="pf-stat-val">{stats.xp.toLocaleString()}</div>
            </div>

            <button className="btn-logout" onClick={handleLogout}>
              🚪 Cerrar Sesión
            </button>
          </div>

          {/* ── Derecha ── */}
          <div className="pf-right">
            <div className="pf-sec-header">
              <h2>Información Personal</h2>
              {!editando && (
                <button className="btn-edit" onClick={() => setEditando(true)}>✏️ Editar</button>
              )}
            </div>

            {success && <div className="toast-ok">✅ {success}</div>}
            {error   && <div className="toast-err">⚠ {error}</div>}

            <form onSubmit={handleSave}>
              <div className="pf-field">
                <label>👤 Nombre de Usuario</label>
                <input className="pf-input" type="text" value={nombre}
                  onChange={e => setNombre(e.target.value)} disabled={!editando} placeholder="Tu nombre" />
              </div>

              <div className="pf-field">
                <label>✉️ Correo Electrónico</label>
                <input className="pf-input" type="email" value={email} disabled />
              </div>

              <div className="pf-field">
                <label>📝 Biografía</label>
                <textarea className="pf-textarea" value={bio}
                  onChange={e => setBio(e.target.value.slice(0, 200))}
                  disabled={!editando} placeholder="Cuéntanos algo sobre ti..." />
                <p className="char-count">{bio.length}/200 caracteres</p>
              </div>

              {editando && (
                <div className="pf-actions">
                  <button type="submit" className="btn-save" disabled={saving}>
                    {saving ? "Guardando..." : "💾 Guardar Cambios"}
                  </button>
                  <button type="button" className="btn-cancel-edit"
                    onClick={() => setEditando(false)}>Cancelar</button>
                </div>
              )}
            </form>
          </div>

        </div>
      </div>
    </>
  );
}

const loadWrap  = { display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100vh", gap:"16px", background:"#0f0a1e" };
const spinnerSt = { width:"44px", height:"44px", border:"4px solid #7c3aed", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite" };