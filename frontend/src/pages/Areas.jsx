import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import Navbar from "../components/Navbar";

const AREA_CONFIG = {
  "Matemáticas":  { icon:"📐", iconBg:"linear-gradient(135deg,#ef4444,#dc2626)", bar:"#ef4444",  xp:"+45" },
  "Lógica":       { icon:"💡", iconBg:"linear-gradient(135deg,#3b82f6,#2563eb)", bar:"#3b82f6",  xp:"+50" },
  "Programación": { icon:"</>", iconBg:"linear-gradient(135deg,#7c3aed,#6d28d9)", bar:"#7c3aed", xp:"+60" },
  "Memoria":      { icon:"🧠", iconBg:"linear-gradient(135deg,#f59e0b,#d97706)", bar:"#f59e0b",  xp:"+40" },
};
const DEFAULT_CFG = { icon:"📚", iconBg:"linear-gradient(135deg,#10b981,#059669)", bar:"#10b981", xp:"+30" };

export default function Areas() {
  const [areas,        setAreas]        = useState([]);
  const [progreso,     setProgreso]     = useState({});
  const [totalRetos,   setTotalRetos]   = useState(0);
  const [totalCompletados, setTotalCompletados] = useState(0);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        // Áreas con conteo de retos
        const { data: areasData } = await supabase
          .from("areas")
          .select("id, nombre, descripcion, retos(count)")
          .order("nombre");

        setAreas(areasData || []);

        // Total de retos
        const total = (areasData || []).reduce((acc, a) => acc + (a.retos?.[0]?.count || 0), 0);
        setTotalRetos(total);

        if (!user) { setLoading(false); return; }

        // Progreso por área
        const prog = {};
        let compTotal = 0;

        await Promise.all((areasData || []).map(async (area) => {
          const { data: retosArea } = await supabase
            .from("retos").select("id").eq("area_id", area.id);
          const ids = (retosArea || []).map(r => r.id);
          if (ids.length === 0) { prog[area.id] = { pct: 0, completados: 0, total: 0 }; return; }

          const { count } = await supabase
            .from("progreso")
            .select("*", { count:"exact", head:true })
            .eq("usuario_id", user.id)
            .eq("completado", true)
            .in("reto_id", ids);

          const completados = count || 0;
          compTotal += completados;
          prog[area.id] = {
            completados,
            total: ids.length,
            pct: Math.round((completados / ids.length) * 100),
          };
        }));

        setProgreso(prog);
        setTotalCompletados(compTotal);
      } catch (err) {
        console.error("Error cargando áreas:", err);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  if (loading) return (
    <>
      <Navbar />
      <div style={loadWrap}>
        <div style={spinnerSt} />
        <p style={{ color:"#94a3b8", fontFamily:"Poppins,sans-serif" }}>Cargando áreas...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        body { background:#0f0a1e; font-family:'Poppins',sans-serif; }

        @keyframes spin   { to{transform:rotate(360deg)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }

        .areas-wrap {
          max-width:1100px; margin:0 auto;
          padding:100px 24px 80px;
        }

        /* ── Header ── */
        .areas-header { text-align:center; margin-bottom:28px; animation:fadeUp 0.5s ease both; }
        .areas-header h1 {
          font-size:2.2rem; font-weight:800; color:#f1f5f9; margin-bottom:6px;
          display:flex; align-items:center; justify-content:center; gap:10px;
        }
        .areas-header p { color:#7c6fa0; font-size:0.92rem; }

        /* ── Stats globales ── */
        .areas-stats {
          display:flex; justify-content:center; gap:14px;
          margin-bottom:36px; animation:fadeUp 0.5s ease 0.1s both;
        }
        .area-stat-pill {
          display:flex; align-items:center; gap:8px;
          background:rgba(124,58,237,0.15);
          border:1px solid rgba(124,58,237,0.3);
          border-radius:50px; padding:8px 20px;
          font-size:0.88rem; font-weight:600; color:#a78bfa;
        }

        /* ── Grid ── */
        .areas-grid {
          display:grid; grid-template-columns:repeat(2,1fr);
          gap:18px; margin-bottom:32px;
          animation:fadeUp 0.5s ease 0.15s both;
        }
        @media(max-width:640px){ .areas-grid{ grid-template-columns:1fr; } }

        /* ── Card ── */
        .area-card {
          background:linear-gradient(160deg,#1a0f35,#2d1b5e);
          border-radius:20px; padding:22px 24px;
          text-decoration:none; color:#f1f5f9;
          border:1px solid rgba(124,58,237,0.18);
          transition:transform 0.25s, box-shadow 0.25s, border-color 0.25s;
          display:flex; flex-direction:column; gap:14px;
          position:relative; overflow:hidden;
        }
        .area-card:hover {
          transform:translateY(-4px);
          box-shadow:0 16px 40px rgba(124,58,237,0.25);
          border-color:rgba(124,58,237,0.45);
        }

        /* badge top-right */
        .area-badge {
          position:absolute; top:16px; right:16px;
          background:rgba(212,175,55,0.15);
          border:1px solid rgba(212,175,55,0.35);
          color:#d4af37; font-size:0.75rem; font-weight:700;
          padding:3px 10px; border-radius:20px;
          display:flex; align-items:center; gap:4px;
        }

        .area-card-top { display:flex; align-items:flex-start; gap:14px; }

        .area-icon-box {
          width:48px; height:48px; border-radius:14px;
          display:flex; align-items:center; justify-content:center;
          font-size:1.3rem; flex-shrink:0;
          font-family:'Poppins',sans-serif; font-weight:700; color:#fff;
        }

        .area-name { font-size:1.2rem; font-weight:700; color:#f1f5f9; margin-bottom:4px; }
        .area-desc { font-size:0.8rem; color:#7c6fa0; }

        /* Barra de progreso */
        .prog-label {
          display:flex; justify-content:space-between;
          font-size:0.75rem; color:#7c6fa0; margin-bottom:5px;
        }
        .prog-label span:last-child { color:#a78bfa; font-weight:600; }
        .prog-bg {
          height:6px; background:rgba(255,255,255,0.08);
          border-radius:99px; overflow:hidden;
        }
        .prog-fill { height:100%; border-radius:99px; transition:width 0.8s ease; }

        /* Footer de la card */
        .area-footer {
          display:flex; align-items:center; justify-content:space-between;
          padding-top:4px;
        }
        .area-meta { display:flex; gap:20px; }
        .area-meta-item { display:flex; flex-direction:column; gap:2px; }
        .meta-label { font-size:0.7rem; color:#7c6fa0; font-weight:500; }
        .meta-val   { font-size:0.95rem; font-weight:700; color:#f1f5f9; }
        .meta-val.xp { color:#a78bfa; }

        .area-arrow {
          width:32px; height:32px; border-radius:50%;
          background:rgba(124,58,237,0.2);
          display:flex; align-items:center; justify-content:center;
          color:#a78bfa; font-size:1rem;
          transition:background 0.2s, transform 0.2s;
        }
        .area-card:hover .area-arrow {
          background:rgba(124,58,237,0.4);
          transform:translateX(3px);
        }

        /* ── Tip banner ── */
        .tip-banner {
          background:linear-gradient(135deg,rgba(124,58,237,0.2),rgba(109,40,217,0.15));
          border:1px solid rgba(124,58,237,0.3);
          border-radius:16px; padding:18px 24px;
          text-align:center; animation:fadeUp 0.5s ease 0.25s both;
        }
        .tip-banner p { font-size:0.88rem; color:#c4b5fd; margin-bottom:4px; }
        .tip-banner strong { font-size:0.88rem; color:#f1f5f9; display:flex; align-items:center; justify-content:center; gap:6px; margin-top:4px; }
      `}</style>

      <Navbar />

      <div className="areas-wrap">

        {/* Header */}
        <div className="areas-header">
          <h1>🏆 Áreas de Conocimiento</h1>
          <p>Selecciona un área para comenzar a resolver retos y ganar puntos</p>
        </div>

        {/* Stats globales */}
        <div className="areas-stats">
          <div className="area-stat-pill">
            🎯 {totalRetos} Retos Totales
          </div>
          <div className="area-stat-pill">
            ✅ {totalCompletados} Completados
          </div>
        </div>

        {/* Grid de áreas */}
        <div className="areas-grid">
          {areas.map((area) => {
            const cfg  = AREA_CONFIG[area.nombre] || DEFAULT_CFG;
            const prog = progreso[area.id] || { pct:0, completados:0, total: area.retos?.[0]?.count || 0 };

            return (
              <Link
                key={area.id}
                to={`/retos/${encodeURIComponent(area.nombre)}`}
                className="area-card"
              >
                {/* Badge completados */}
                <div className="area-badge">
                  ⭐ {prog.completados}/{prog.total}
                </div>

                {/* Top: icono + nombre */}
                <div className="area-card-top">
                  <div className="area-icon-box" style={{ background: cfg.iconBg }}>
                    {cfg.icon}
                  </div>
                  <div>
                    <p className="area-name">{area.nombre}</p>
                    <p className="area-desc">{area.descripcion || "Explora los retos de esta área"}</p>
                  </div>
                </div>

                {/* Barra de progreso */}
                <div>
                  <div className="prog-label">
                    <span>Progreso</span>
                    <span>{prog.pct}%</span>
                  </div>
                  <div className="prog-bg">
                    <div className="prog-fill" style={{ width:`${prog.pct}%`, background: cfg.bar }} />
                  </div>
                </div>

                {/* Footer */}
                <div className="area-footer">
                  <div className="area-meta">
                    <div className="area-meta-item">
                      <span className="meta-label">Retos disponibles</span>
                      <span className="meta-val">{prog.total}</span>
                    </div>
                    <div className="area-meta-item">
                      <span className="meta-label">XP por reto</span>
                      <span className="meta-val xp">{cfg.xp}</span>
                    </div>
                  </div>
                  <div className="area-arrow">›</div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Tip banner */}
        <div className="tip-banner">
          <p>💡 Tip: Completa retos diariamente para mantener tu racha activa</p>
          <strong>⚡ ¡Cada racha de 7 días otorga un bonus de 100 XP!</strong>
        </div>

      </div>
    </>
  );
}

const loadWrap  = { display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100vh", gap:"16px", background:"#0f0a1e" };
const spinnerSt = { width:"44px", height:"44px", border:"4px solid #7c3aed", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite" };