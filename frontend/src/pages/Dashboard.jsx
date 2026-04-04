import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import Navbar from "../components/Navbar";

// ── Gráfica de área SVG ──
function AreaChart({ data, days }) {
  const W = 860, H = 220;
  const PAD = { t: 20, r: 20, b: 36, l: 48 };
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const max = Math.max(...data) * 1.15 || 1;
  const px = (i) => PAD.l + (i / (data.length - 1)) * innerW;
  const py = (v) => PAD.t + innerH - (v / max) * innerH;

  const linePath = data
    .map((v, i) => `${i === 0 ? "M" : "L"}${px(i)},${py(v)}`)
    .join(" ");
  const areaPath =
    `${linePath} L${px(data.length - 1)},${H - PAD.b} L${px(0)},${H - PAD.b} Z`;

  const yTicks = [0, 70, 140, 210, 280];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#7c3aed" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.03" />
        </linearGradient>
      </defs>
      {yTicks.map((t) => (
        <g key={t}>
          <line x1={PAD.l} y1={py(t)} x2={W - PAD.r} y2={py(t)}
            stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 4" />
          <text x={PAD.l - 8} y={py(t) + 4} textAnchor="end"
            fontSize="11" fill="#9ca3af">{t}</text>
        </g>
      ))}
      <path d={areaPath} fill="url(#areaGrad)" />
      <path d={linePath} fill="none" stroke="#7c3aed" strokeWidth="3"
        strokeLinecap="round" strokeLinejoin="round" />
      {data.map((v, i) => (
        <g key={i}>
          <circle cx={px(i)} cy={py(v)} r="5" fill="#7c3aed" stroke="#fff" strokeWidth="2" />
          <text x={px(i)} y={H - 8} textAnchor="middle"
            fontSize="12" fill="#9ca3af">{days[i]}</text>
        </g>
      ))}
    </svg>
  );
}

const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export default function Dashboard() {

  const [userName, setUserName] = useState("...");
  const [stats,    setStats]    = useState({
    xp: 0, xpMeta: 100, nivel: 1, racha: 0,
    retos: 0, ranking: "-", retosHoy: 0,
    retosHoyMeta: 5, metaSemanal: 0,
  });
  const [weeklyXp, setWeeklyXp] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // 1. Usuario autenticado
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 2. Datos del usuario desde la tabla
        const { data: usuarioDB } = await supabase
          .from("usuarios")
          .select("nombre, xp, nivel, racha, ultimo_login")
          .eq("id", user.id)
          .single();

        const nombre =
          usuarioDB?.nombre ||
          user?.user_metadata?.full_name ||
          user?.user_metadata?.name ||
          user?.email?.split("@")[0];

        setUserName(nombre);

        const xp    = usuarioDB?.xp    || 0;
        const nivel = usuarioDB?.nivel || 1;
        const racha = usuarioDB?.racha || 0;
        const xpMeta = Math.pow(nivel * 10, 2);

        // 3. Retos completados en total ✅ usuario_id correcto
        const { count: totalRetos } = await supabase
          .from("progreso")
          .select("*", { count: "exact", head: true })
          .eq("usuario_id", user.id)
          .eq("completado", true);

        // 4. Retos completados HOY
        const hoy = new Date().toISOString().split("T")[0];
        const { count: retosHoy } = await supabase
          .from("progreso")
          .select("*", { count: "exact", head: true })
          .eq("usuario_id", user.id)
          .eq("completado", true)
          .gte("fecha", `${hoy}T00:00:00`)
          .lte("fecha", `${hoy}T23:59:59`);

        // 5. Ranking (cuántos usuarios tienen más XP que yo)
        const { count: ranking } = await supabase
          .from("usuarios")
          .select("*", { count: "exact", head: true })
          .gt("xp", xp);

        // 6. Meta semanal
        const inicioSemana = new Date();
        inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
        inicioSemana.setHours(0, 0, 0, 0);

        const { count: retosSemana } = await supabase
          .from("progreso")
          .select("*", { count: "exact", head: true })
          .eq("usuario_id", user.id)
          .eq("completado", true)
          .gte("fecha", inicioSemana.toISOString());

        const metaSemanal = Math.min(
          Math.round(((retosSemana || 0) / 35) * 100), 100
        );

        // 7. XP por día esta semana para la gráfica
        const xpSemana = await Promise.all(
          Array.from({ length: 7 }, async (_, i) => {
            const dia = new Date(inicioSemana);
            dia.setDate(inicioSemana.getDate() + i);
            const diaStr = dia.toISOString().split("T")[0];
            const { data } = await supabase
              .from("progreso")
              .select("puntuacion")
              .eq("usuario_id", user.id)
              .eq("completado", true)
              .gte("fecha", `${diaStr}T00:00:00`)
              .lte("fecha", `${diaStr}T23:59:59`);
            return (data || []).reduce((acc, r) => acc + (r.puntuacion || 0), 0);
          })
        );

        setWeeklyXp(xpSemana);
        setStats({
          xp, xpMeta, nivel, racha,
          retos:        totalRetos  || 0,
          ranking:      (ranking    || 0) + 1,
          retosHoy:     retosHoy   || 0,
          retosHoyMeta: 5,
          metaSemanal,
        });

      } catch (err) {
        console.error("Error cargando dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const xpPct = Math.min(Math.round((stats.xp / stats.xpMeta) * 100), 100);

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          height: "100vh", background: "#0f1117", flexDirection: "column", gap: "16px"
        }}>
          <div style={{
            width: "48px", height: "48px", border: "4px solid #7c3aed",
            borderTopColor: "transparent", borderRadius: "50%",
            animation: "spin 0.8s linear infinite"
          }} />
          <p style={{ color: "#94a3b8", fontFamily: "Poppins, sans-serif" }}>
            Cargando tu dashboard...
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0f1117; font-family: 'Poppins', sans-serif; color: #f1f5f9; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .fade1 { animation: fadeUp 0.5s ease 0.05s both; }
        .fade2 { animation: fadeUp 0.5s ease 0.15s both; }
        .fade3 { animation: fadeUp 0.5s ease 0.25s both; }
        .fade4 { animation: fadeUp 0.5s ease 0.35s both; }
        .fade5 { animation: fadeUp 0.5s ease 0.45s both; }

        .dash-wrap {
          max-width: 1200px;
          margin: 0 auto;
          padding: 100px 24px 80px;
        }

        .hero {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          align-items: center;
          margin-bottom: 56px;
        }
        @media (max-width: 768px) { .hero { grid-template-columns: 1fr; } }

        .hero-left h1 { font-size: 2.8rem; font-weight: 800; color: #f1f5f9; margin-bottom: 10px; }
        .hero-left > p { color: #94a3b8; font-size: 1rem; margin-bottom: 28px; }

        .streak-badge {
          display: inline-flex; flex-direction: column;
          background: linear-gradient(135deg, #f97316, #ef4444);
          color: #fff; padding: 14px 24px; border-radius: 16px;
          font-weight: 700; margin-bottom: 20px;
          box-shadow: 0 8px 24px rgba(249,115,22,0.4);
        }
        .streak-badge .s-lbl { font-size: 0.78rem; font-weight: 500; opacity: 0.9; }
        .streak-badge .s-val { font-size: 1.6rem; font-weight: 800; }

        .btn-continue {
          display: inline-flex; align-items: center; gap: 10px;
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          color: #fff; padding: 15px 32px; border-radius: 14px;
          font-size: 1rem; font-weight: 700; font-family: 'Poppins', sans-serif;
          border: none; cursor: pointer; text-decoration: none;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 8px 20px rgba(124,58,237,0.4);
        }
        .btn-continue:hover { transform: translateY(-2px); box-shadow: 0 14px 30px rgba(124,58,237,0.5); }

        .hero-card {
          background: #fff; border-radius: 24px; padding: 28px;
          color: #1e293b; position: relative;
          box-shadow: 0 24px 64px rgba(0,0,0,0.35);
        }
        .hc-star {
          position: absolute; top: -18px; right: -18px;
          width: 52px; height: 52px; background: #d4af37;
          border-radius: 14px; display: flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 20px rgba(212,175,55,0.5);
        }
        .hc-top { display: flex; justify-content: space-between; margin-bottom: 4px; }
        .hc-top span { font-size: 0.78rem; color: #94a3b8; }
        .hc-nivel-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
        .hc-nivel { display: flex; align-items: center; gap: 10px; }
        .hc-nivel-ico {
          width: 36px; height: 36px; background: #fef9c3;
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
        }
        .hc-nivel h3 { font-size: 1.5rem; font-weight: 800; }
        .hc-rank { font-size: 1.5rem; font-weight: 800; color: #7c3aed; }

        .xp-labels { display: flex; justify-content: space-between; font-size: 0.78rem; color: #64748b; margin-bottom: 6px; }
        .xp-labels span:last-child { color: #7c3aed; font-weight: 600; }
        .xp-bar-bg { background: #e2e8f0; border-radius: 99px; height: 10px; margin-bottom: 18px; overflow: hidden; }
        .xp-bar-fill {
          height: 100%; border-radius: 99px;
          background: linear-gradient(90deg, #7c3aed, #a78bfa);
          transition: width 1.2s cubic-bezier(0.4,0,0.2,1);
        }

        .mini-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
        .mini-card { background: #f8f5ff; border-radius: 14px; padding: 14px; }
        .mini-card-hd {
          display: flex; align-items: center; gap: 6px;
          font-size: 0.78rem; color: #7c3aed; font-weight: 600; margin-bottom: 6px;
        }
        .mini-card h4 { font-size: 1.5rem; font-weight: 800; color: #1e293b; margin-bottom: 2px; }
        .mini-card p  { font-size: 0.75rem; color: #94a3b8; }

        .logro-banner {
          background: linear-gradient(135deg, #f59e0b, #d4af37);
          border-radius: 14px; padding: 14px 18px;
          display: flex; align-items: center; gap: 12px; color: #fff;
        }
        .logro-banner h4 { font-size: 0.92rem; font-weight: 700; }
        .logro-banner p  { font-size: 0.78rem; opacity: 0.88; }

        .stats-grid {
          display: grid; grid-template-columns: repeat(4,1fr);
          gap: 16px; margin-bottom: 56px;
        }
        @media (max-width: 900px) { .stats-grid { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 480px) { .stats-grid { grid-template-columns: 1fr; } }

        .stat-card {
          background: #fff; border-radius: 18px; padding: 22px 20px;
          display: flex; align-items: center; gap: 14px;
          transition: transform 0.25s, box-shadow 0.25s;
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
        }
        .stat-card:hover { transform: translateY(-4px); box-shadow: 0 14px 30px rgba(0,0,0,0.13); }
        .stat-ico { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .s-lbl2 { font-size: 0.78rem; color: #94a3b8; font-weight: 500; margin-bottom: 2px; }
        .s-val2 { font-size: 1.7rem; font-weight: 800; color: #1e293b; }

        .section-title { font-size: 1.35rem; font-weight: 700; color: #f1f5f9; margin-bottom: 18px; }
        .quick-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 18px; margin-bottom: 56px; }
        @media (max-width: 768px) { .quick-grid { grid-template-columns: 1fr; } }

        .quick-card {
          background: #fff; border-radius: 20px; padding: 28px 24px;
          text-decoration: none; color: #1e293b;
          transition: transform 0.25s, box-shadow 0.25s;
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
          display: flex; flex-direction: column; gap: 12px;
        }
        .quick-card:hover { transform: translateY(-4px); box-shadow: 0 14px 32px rgba(0,0,0,0.14); }
        .q-ico { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
        .quick-card h3 { font-size: 1.05rem; font-weight: 700; }
        .quick-card p  { font-size: 0.85rem; color: #64748b; }
        .go-link { font-size: 0.85rem; color: #7c3aed; font-weight: 600; }

        .chart-card {
          background: #fff; border-radius: 20px; padding: 28px;
          margin-bottom: 56px; box-shadow: 0 4px 16px rgba(0,0,0,0.08);
        }
        .chart-card h3 { font-size: 1rem; font-weight: 700; color: #1e293b; margin-bottom: 20px; }

        .dash-footer {
          border-top: 1px solid #1e293b; padding-top: 24px;
          display: flex; justify-content: space-between;
          align-items: center; flex-wrap: wrap; gap: 12px;
        }
        .dash-footer p { font-size: 0.82rem; color: #475569; }
        .dash-footer-links { display: flex; gap: 20px; }
        .dash-footer-links a { font-size: 0.82rem; color: #475569; text-decoration: none; transition: color 0.2s; }
        .dash-footer-links a:hover { color: #7c3aed; }
      `}</style>

      <Navbar />

      <div className="dash-wrap">

        {/* ══ HERO ══ */}
        <section className="hero fade1">
          <div className="hero-left">
            <h1>¡Hola, {userName}! 👋</h1>
            <p>
              {stats.racha > 0
                ? "Estás en racha. Sigue aprendiendo y alcanza nuevas metas."
                : "Bienvenido. ¡Completa tu primer reto hoy!"}
            </p>

            <div style={{ marginBottom: "20px" }}>
              <div className="streak-badge">
                <span className="s-lbl">Racha activa</span>
                <span className="s-val">
                  {stats.racha > 0 ? `🔥 ${stats.racha} días` : "🌱 ¡Empieza hoy!"}
                </span>
              </div>
            </div>

            <Link to="/areas" className="btn-continue">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/>
                <polygon points="10 8 16 12 10 16 10 8"/>
              </svg>
              {stats.retos > 0 ? "Continuar aprendiendo" : "Empezar ahora"}
            </Link>
          </div>

          <div className="hero-card">
            <div className="hc-star">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>

            <div className="hc-top">
              <span>Tu nivel</span>
              <span>Ranking</span>
            </div>
            <div className="hc-nivel-row">
              <div className="hc-nivel">
                <div className="hc-nivel-ico">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="2">
                    <circle cx="12" cy="8" r="6"/>
                    <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
                  </svg>
                </div>
                <h3>Nivel {stats.nivel}</h3>
              </div>
              <div className="hc-rank">#{stats.ranking}</div>
            </div>

            <div className="xp-labels">
              <span>Progreso de XP</span>
              <span>{stats.xp.toLocaleString()} / {stats.xpMeta.toLocaleString()} XP</span>
            </div>
            <div className="xp-bar-bg">
              <div className="xp-bar-fill" style={{ width: `${xpPct}%` }} />
            </div>

            <div className="mini-cards">
              <div className="mini-card">
                <div className="mini-card-hd">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                  Reto diario
                </div>
                <h4>{stats.retosHoy}/{stats.retosHoyMeta}</h4>
                <p>Completados hoy</p>
              </div>
              <div className="mini-card">
                <div className="mini-card-hd">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 8v4l3 3"/>
                  </svg>
                  Meta semanal
                </div>
                <h4>{stats.metaSemanal}%</h4>
                <p>Cumplimiento</p>
              </div>
            </div>

            <div className="logro-banner">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                <circle cx="12" cy="8" r="6"/>
                <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
              </svg>
              <div>
                {stats.racha >= 7 ? (
                  <>
                    <h4>¡Logro desbloqueado! 🏆</h4>
                    <p>Racha de {stats.racha} días 🔥</p>
                  </>
                ) : stats.retos > 0 ? (
                  <>
                    <h4>¡Sigue así! 💪</h4>
                    <p>{stats.retos} retos completados hasta ahora</p>
                  </>
                ) : (
                  <>
                    <h4>¡Bienvenido a Cognify!</h4>
                    <p>Completa tu primer reto para ganar XP</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ══ STATS ROW ══ */}
        <div className="stats-grid fade2">
          {[
            {
              bg: "#ede9fe", label: "XP Total", val: stats.xp.toLocaleString(),
              icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            },
            {
              bg: "#ede9fe", label: "Nivel actual", val: stats.nivel,
              icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
            },
            {
              bg: "#fff7ed", label: "Racha de días", val: stats.racha,
              icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.2"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><path d="M12 6v6l4 2"/></svg>
            },
            {
              bg: "#fefce8", label: "Retos completados", val: stats.retos,
              icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="2.2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
            },
          ].map((s, i) => (
            <div className="stat-card" key={i}>
              <div className="stat-ico" style={{ background: s.bg }}>{s.icon}</div>
              <div>
                <p className="s-lbl2">{s.label}</p>
                <p className="s-val2">{s.val}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ══ ACCESO RÁPIDO ══ */}
        <h2 className="section-title">Acceso rápido</h2>
        <div className="quick-grid fade3">
          {[
            {
              to: "/areas", bg: "#7c3aed", title: "Explorar Áreas", desc: "Descubre nuevos temas y desafíos",
              icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            },
            {
              to: "/progreso", bg: "#6d28d9", title: "Mi Progreso", desc: "Analiza tu rendimiento detallado",
              icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            },
            {
              to: "/ranking", bg: "#d4af37", title: "Ranking global", desc: "Compite con otros estudiantes",
              icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
            },
          ].map((c, i) => (
            <Link to={c.to} className="quick-card" key={i}>
              <div className="q-ico" style={{ background: c.bg }}>{c.icon}</div>
              <h3>{c.title}</h3>
              <p>{c.desc}</p>
              <span className="go-link">Ir ahora →</span>
            </Link>
          ))}
        </div>

        {/* ══ ACTIVIDAD RECIENTE ══ */}
        <h2 className="section-title fade4">Actividad reciente</h2>
        <div className="chart-card fade4">
          <h3>Progreso semanal — XP ganado por día</h3>
          <AreaChart data={weeklyXp} days={DAYS} />
        </div>

        {/* ══ FOOTER ══ */}
        <footer className="dash-footer fade5">
          <p>© 2026 Cognify. Aprende jugando, crece cada día.</p>
          <div className="dash-footer-links">
            <a href="#">Ayuda</a>
            <a href="#">Términos</a>
            <a href="#">Privacidad</a>
          </div>
        </footer>

      </div>
    </>
  );
}