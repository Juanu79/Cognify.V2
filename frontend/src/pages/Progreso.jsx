import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import Navbar from "../components/Navbar";

export default function Progreso() {
  const [stats,    setStats]    = useState(null);
  const [areas,    setAreas]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [usuario,  setUsuario]  = useState(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        // 1. Usuario actual
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 2. Datos del usuario
        const { data: usuarioDB } = await supabase
          .from("usuarios")
          .select("nombre, xp, nivel, racha")
          .eq("id", user.id)
          .single();

        setUsuario(usuarioDB);

        // 3. Todas las áreas
        const { data: areasData } = await supabase
          .from("areas")
          .select("id, nombre");

        // 4. Para cada área calcular progreso real
        const areasConProgreso = await Promise.all(
          (areasData || []).map(async (area) => {

            // Total de retos del área
            const { count: totalRetos } = await supabase
              .from("retos")
              .select("*", { count: "exact", head: true })
              .eq("area_id", area.id);

            // Retos completados por el usuario en esta área
            const { data: retosArea } = await supabase
              .from("retos")
              .select("id")
              .eq("area_id", area.id);

            const idsArea = (retosArea || []).map(r => r.id);

            let completados = 0;
            if (idsArea.length > 0) {
              const { count } = await supabase
                .from("progreso")
                .select("*", { count: "exact", head: true })
                .eq("usuario_id", user.id)
                .eq("completado", true)
                .in("reto_id", idsArea);
              completados = count || 0;
            }

            // XP ganado en esta área
            let xpArea = 0;
            if (idsArea.length > 0) {
              const { data: xpData } = await supabase
                .from("progreso")
                .select("puntuacion")
                .eq("usuario_id", user.id)
                .eq("completado", true)
                .in("reto_id", idsArea);
              xpArea = (xpData || []).reduce((acc, r) => acc + (r.puntuacion || 0), 0);
            }

            const pct = totalRetos > 0
              ? Math.round((completados / totalRetos) * 100)
              : 0;

            return {
              ...area,
              totalRetos:  totalRetos  || 0,
              completados,
              xpArea,
              pct,
            };
          })
        );

        // 5. Ordenar por porcentaje
        const ordenadas = [...areasConProgreso].sort((a, b) => b.pct - a.pct);
        setAreas(ordenadas);

        // 6. Stats globales
        const { count: totalCompletados } = await supabase
          .from("progreso")
          .select("*", { count: "exact", head: true })
          .eq("usuario_id", user.id)
          .eq("completado", true);

        // Retos esta semana
        const inicioSemana = new Date();
        inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
        inicioSemana.setHours(0, 0, 0, 0);

        const { count: retosSemana } = await supabase
          .from("progreso")
          .select("*", { count: "exact", head: true })
          .eq("usuario_id", user.id)
          .eq("completado", true)
          .gte("fecha", inicioSemana.toISOString());

        // Racha más alta (approximación)
        const xpMeta = Math.pow((usuarioDB?.nivel || 1) * 10, 2);
        const xpPct  = Math.min(
          Math.round(((usuarioDB?.xp || 0) / xpMeta) * 100), 100
        );

        setStats({
          totalCompletados: totalCompletados || 0,
          retosSemana:      retosSemana      || 0,
          xpPct,
          xpMeta,
        });

      } catch (err) {
        console.error("Error cargando progreso:", err);
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, []);

  const mejorArea = areas[0];
  const peorArea  = areas.filter(a => a.totalRetos > 0).slice(-1)[0];

  const AREA_COLORS = {
    "Matemáticas":  { bg: "#fee2e2", fill: "#ef4444", icon: "📐" },
    "Lógica":       { bg: "#d1fae5", fill: "#10b981", icon: "🧩" },
    "Programación": { bg: "#ede9fe", fill: "#7c3aed", icon: "💻" },
    "Memoria":      { bg: "#fef3c7", fill: "#f59e0b", icon: "🧠" },
  };

  if (loading) return (
    <>
      <Navbar />
      <div style={loadWrap}>
        <div style={spinner} />
        <p style={{ color:"#94a3b8", fontFamily:"Poppins,sans-serif" }}>Cargando tu progreso...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0f1117; font-family: 'Poppins', sans-serif; }

        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fillBar { from { width: 0%; } to { width: var(--w); } }

        .fade1 { animation: fadeUp 0.5s ease 0.05s both; }
        .fade2 { animation: fadeUp 0.5s ease 0.15s both; }
        .fade3 { animation: fadeUp 0.5s ease 0.25s both; }
        .fade4 { animation: fadeUp 0.5s ease 0.35s both; }

        .prog-wrap {
          max-width: 1100px; margin: 0 auto;
          padding: 100px 24px 80px;
        }

        /* ── Header ── */
        .prog-header { margin-bottom: 40px; }
        .prog-header h1 { font-size: 2.4rem; font-weight: 800; color: #f1f5f9; margin-bottom: 6px; }
        .prog-header p  { color: #94a3b8; font-size: 0.95rem; }

        /* ── Top stats ── */
        .top-stats {
          display: grid; grid-template-columns: repeat(4,1fr);
          gap: 16px; margin-bottom: 40px;
        }
        @media(max-width:900px){ .top-stats { grid-template-columns: repeat(2,1fr); } }
        @media(max-width:480px){ .top-stats { grid-template-columns: 1fr; } }

        .top-stat-card {
          background: #fff; border-radius: 18px; padding: 22px 20px;
          display: flex; align-items: center; gap: 14px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
          transition: transform 0.25s;
        }
        .top-stat-card:hover { transform: translateY(-4px); }
        .stat-ico-box {
          width: 46px; height: 46px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.3rem; flex-shrink: 0;
        }
        .stat-lbl { font-size: 0.78rem; color: #94a3b8; font-weight: 500; margin-bottom: 2px; }
        .stat-val { font-size: 1.65rem; font-weight: 800; color: #1e293b; }

        /* ── Highlights ── */
        .highlights {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 16px; margin-bottom: 40px;
        }
        @media(max-width:640px){ .highlights { grid-template-columns: 1fr; } }

        .highlight-card {
          border-radius: 18px; padding: 22px 24px;
          display: flex; align-items: center; gap: 16px;
        }
        .hl-icon { font-size: 2rem; }
        .hl-label { font-size: 0.8rem; font-weight: 600; opacity: 0.8; margin-bottom: 4px; }
        .hl-name  { font-size: 1.2rem; font-weight: 800; margin-bottom: 2px; }
        .hl-sub   { font-size: 0.82rem; opacity: 0.75; }

        /* ── XP progress ── */
        .xp-card {
          background: #1a1f2e; border-radius: 18px; padding: 24px;
          margin-bottom: 40px; border: 1px solid #1e293b;
        }
        .xp-card-top {
          display: flex; justify-content: space-between;
          align-items: center; margin-bottom: 10px;
        }
        .xp-card-top h3 { font-size: 1rem; font-weight: 700; color: #f1f5f9; }
        .xp-card-top span { color: #7c3aed; font-weight: 700; font-size: 0.9rem; }
        .xp-bg { height: 10px; background: #334155; border-radius: 99px; overflow: hidden; }
        .xp-fill {
          height: 100%; border-radius: 99px;
          background: linear-gradient(90deg, #7c3aed, #a78bfa);
          transition: width 1.2s cubic-bezier(0.4,0,0.2,1);
        }
        .xp-sub { margin-top: 8px; font-size: 0.8rem; color: #64748b; }

        /* ── Áreas ── */
        .areas-title {
          font-size: 1.25rem; font-weight: 700; color: #f1f5f9; margin-bottom: 18px;
        }
        .areas-list { display: flex; flex-direction: column; gap: 14px; margin-bottom: 40px; }

        .area-row {
          background: #fff; border-radius: 16px; padding: 20px 24px;
          display: flex; align-items: center; gap: 16px;
          box-shadow: 0 4px 14px rgba(0,0,0,0.07);
          transition: transform 0.25s;
          text-decoration: none; color: inherit;
        }
        .area-row:hover { transform: translateX(4px); }

        .area-icon-box {
          width: 46px; height: 46px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.4rem; flex-shrink: 0;
        }
        .area-info { flex: 1; }
        .area-name { font-size: 1rem; font-weight: 700; color: #1e293b; margin-bottom: 6px; }
        .area-bar-bg { height: 8px; background: #e2e8f0; border-radius: 99px; overflow: hidden; margin-bottom: 4px; }
        .area-bar-fill { height: 100%; border-radius: 99px; transition: width 1s ease; }
        .area-meta { font-size: 0.78rem; color: #94a3b8; }

        .area-right { text-align: right; flex-shrink: 0; }
        .area-pct   { font-size: 1.3rem; font-weight: 800; color: #1e293b; }
        .area-xp    { font-size: 0.78rem; color: #7c3aed; font-weight: 600; }

        /* ── Footer ── */
        .prog-footer {
          border-top: 1px solid #1e293b; padding-top: 24px;
          display: flex; justify-content: space-between;
          align-items: center; flex-wrap: wrap; gap: 12px;
        }
        .prog-footer p { font-size: 0.82rem; color: #475569; }
        .prog-footer-links { display: flex; gap: 20px; }
        .prog-footer-links a { font-size: 0.82rem; color: #475569; text-decoration: none; }
        .prog-footer-links a:hover { color: #7c3aed; }
      `}</style>

      <Navbar />

      <div className="prog-wrap">

        {/* ── Header ── */}
        <div className="prog-header fade1">
          <h1>Tu Progreso 📊</h1>
          <p>Revisa tu avance en cada área y descubre dónde mejorar.</p>
        </div>

        {/* ── Top stats ── */}
        <div className="top-stats fade1">
          {[
            { ico:"⚡", bg:"#ede9fe", label:"XP Total",            val: (usuario?.xp || 0).toLocaleString() },
            { ico:"🎯", bg:"#d1fae5", label:"Nivel actual",         val: usuario?.nivel || 1 },
            { ico:"🔥", bg:"#fff7ed", label:"Racha de días",         val: usuario?.racha || 0 },
            { ico:"✅", bg:"#fefce8", label:"Retos completados",     val: stats?.totalCompletados || 0 },
          ].map((s, i) => (
            <div className="top-stat-card" key={i}>
              <div className="stat-ico-box" style={{ background: s.bg }}>{s.ico}</div>
              <div>
                <p className="stat-lbl">{s.label}</p>
                <p className="stat-val">{s.val}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Highlights: mejor y peor área ── */}
        {(mejorArea || peorArea) && (
          <div className="highlights fade2">
            {mejorArea && mejorArea.completados > 0 && (
              <div className="highlight-card" style={{ background:"linear-gradient(135deg,#10b981,#059669)", color:"#fff" }}>
                <span className="hl-icon">🏆</span>
                <div>
                  <p className="hl-label">Área donde más destacas</p>
                  <p className="hl-name">{mejorArea.nombre}</p>
                  <p className="hl-sub">{mejorArea.pct}% completado · {mejorArea.xpArea} XP ganados</p>
                </div>
              </div>
            )}
            {peorArea && peorArea !== mejorArea && (
              <div className="highlight-card" style={{ background:"linear-gradient(135deg,#f59e0b,#d97706)", color:"#fff" }}>
                <span className="hl-icon">💪</span>
                <div>
                  <p className="hl-label">Área para mejorar</p>
                  <p className="hl-name">{peorArea.nombre}</p>
                  <p className="hl-sub">{peorArea.pct}% completado · ¡Sigue practicando!</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Barra XP hacia siguiente nivel ── */}
        <div className="xp-card fade2">
          <div className="xp-card-top">
            <h3>Progreso hacia el siguiente nivel</h3>
            <span>{stats?.xpPct || 0}%</span>
          </div>
          <div className="xp-bg">
            <div className="xp-fill" style={{ width:`${stats?.xpPct || 0}%` }} />
          </div>
          <p className="xp-sub">
            {(usuario?.xp || 0).toLocaleString()} / {(stats?.xpMeta || 100).toLocaleString()} XP para el Nivel {(usuario?.nivel || 1) + 1}
          </p>
        </div>

        {/* ── Progreso por área ── */}
        <h2 className="areas-title fade3">Progreso por área</h2>
        <div className="areas-list fade3">
          {areas.map((area) => {
            const cfg = AREA_COLORS[area.nombre] || { bg:"#ede9fe", fill:"#7c3aed", icon:"📚" };
            return (
              <Link to={`/retos/${encodeURIComponent(area.nombre)}`} className="area-row" key={area.id}>
                <div className="area-icon-box" style={{ background: cfg.bg }}>{cfg.icon}</div>
                <div className="area-info">
                  <p className="area-name">{area.nombre}</p>
                  <div className="area-bar-bg">
                    <div
                      className="area-bar-fill"
                      style={{ width:`${area.pct}%`, background: cfg.fill }}
                    />
                  </div>
                  <p className="area-meta">
                    {area.completados} de {area.totalRetos} retos completados
                  </p>
                </div>
                <div className="area-right">
                  <p className="area-pct">{area.pct}%</p>
                  <p className="area-xp">+{area.xpArea} XP</p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* ── Esta semana ── */}
        <div className="xp-card fade4" style={{ marginBottom:"40px" }}>
          <div className="xp-card-top">
            <h3>🗓 Esta semana</h3>
            <span style={{ color:"#10b981" }}>{stats?.retosSemana || 0} retos</span>
          </div>
          <p style={{ color:"#94a3b8", fontSize:"0.88rem", marginTop:"6px" }}>
            {stats?.retosSemana > 0
              ? `¡Completaste ${stats.retosSemana} retos esta semana! Sigue así. 🚀`
              : "Aún no has completado retos esta semana. ¡Empieza ahora!"}
          </p>
        </div>

        {/* ── Footer ── */}
        <footer className="prog-footer">
          <p>© 2026 Cognify. Aprende jugando, crece cada día.</p>
          <div className="prog-footer-links">
            <a href="#">Ayuda</a>
            <a href="#">Términos</a>
            <a href="#">Privacidad</a>
          </div>
        </footer>

      </div>
    </>
  );
}

/* ── ESTILOS INLINE ── */
const loadWrap = {
  display:"flex", flexDirection:"column", alignItems:"center",
  justifyContent:"center", height:"100vh", gap:"16px", background:"#0f1117"
};
const spinner = {
  width:"44px", height:"44px", border:"4px solid #7c3aed",
  borderTopColor:"transparent", borderRadius:"50%",
  animation:"spin 0.8s linear infinite"
};

const AREA_COLORS = {
  "Matemáticas":  { bg:"#fee2e2", fill:"#ef4444", icon:"📐" },
  "Lógica":       { bg:"#d1fae5", fill:"#10b981", icon:"🧩" },
  "Programación": { bg:"#ede9fe", fill:"#7c3aed", icon:"💻" },
  "Memoria":      { bg:"#fef3c7", fill:"#f59e0b", icon:"🧠" },
};