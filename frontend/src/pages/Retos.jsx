import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import Navbar from "../components/Navbar";

const DIFF_ORDER  = { "Fácil": 1, "Media": 2, "Difícil": 3 };
const DIFF_COLORS = { "Fácil": "#10b981", "Media": "#f59e0b", "Difícil": "#ef4444" };
const DIFF_BG     = { "Fácil": "#d1fae5", "Media": "#fef3c7", "Difícil": "#fee2e2" };
const DIFF_TEXT   = { "Fácil": "#065f46", "Media": "#92400e", "Difícil": "#991b1b" };

export default function Retos() {
  const { area } = useParams();
  const decodedArea = area ? decodeURIComponent(area) : null;

  const [temas,           setTemas]           = useState([]);
  const [completados,     setCompletados]     = useState([]);
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [activeTema,      setActiveTema]      = useState(null);
  const [userAnswer,      setUserAnswer]      = useState("");
  const [showSuccess,     setShowSuccess]     = useState(null);
  const [showError,       setShowError]       = useState(false);
  const [loading,         setLoading]         = useState(true);
  const [userId,          setUserId]          = useState(null);
  const [submitting,      setSubmitting]      = useState(false);
  const [expandedTema,    setExpandedTema]    = useState(null);

  /* ── Cargar datos ── */
  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUserId(user.id);

        // Temas del área con sus retos
        const { data: temasData, error } = await supabase
          .from("temas")
          .select(`
            id, nombre, explicacion, orden,
            retos ( id, titulo, descripcion, dificultad, xp_reward, problem, answer )
          `)
          .eq("area_id", `(SELECT id FROM areas WHERE nombre = '${decodedArea}')`)
          .order("orden");

        // Alternativa: query en dos pasos para evitar subquery en el cliente
        const { data: areaData } = await supabase
          .from("areas")
          .select("id")
          .eq("nombre", decodedArea)
          .single();

        if (!areaData) { setLoading(false); return; }

        const { data: temasReal } = await supabase
          .from("temas")
          .select(`
            id, nombre, explicacion, orden,
            retos ( id, titulo, descripcion, dificultad, xp_reward, problem, answer )
          `)
          .eq("area_id", areaData.id)
          .order("orden");

        setTemas(temasReal || []);

        // Todos los reto_ids del área
        const todosIds = (temasReal || []).flatMap(t => t.retos.map(r => r.id));

        if (todosIds.length > 0) {
          const { data: progData } = await supabase
            .from("progreso")
            .select("reto_id")
            .eq("usuario_id", user.id)
            .eq("completado", true)
            .in("reto_id", todosIds);

          setCompletados((progData || []).map(p => p.reto_id));
        }

        // Abrir el primer tema por defecto
        if (temasReal?.length > 0) setExpandedTema(temasReal[0].id);

      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [decodedArea]);

  /* ── Verificar si un nivel está bloqueado ── */
  const isLocked = (tema, dificultad) => {
    if (dificultad === "Fácil") return false;

    const retosDelTema = tema.retos || [];

    if (dificultad === "Media") {
      const facilesDelTema = retosDelTema.filter(r => r.dificultad === "Fácil");
      return !facilesDelTema.every(r => completados.includes(r.id));
    }
    if (dificultad === "Difícil") {
      const mediasDelTema = retosDelTema.filter(r => r.dificultad === "Media");
      return !mediasDelTema.every(r => completados.includes(r.id));
    }
    return false;
  };

  /* ── Verificar respuesta ── */
  const handleVerify = async (reto) => {
    const correct = userAnswer.trim().toLowerCase() === reto.answer.trim().toLowerCase();

    if (!correct) {
      setShowError(true);
      setTimeout(() => setShowError(false), 2500);
      return;
    }

    setSubmitting(true);
    try {
      await supabase.from("progreso").insert({
        usuario_id: userId,
        reto_id:    reto.id,
        completado: true,
        puntuacion: reto.xp_reward,
        fecha:      new Date().toISOString(),
      });

      const { data: userData } = await supabase
        .from("usuarios")
        .select("xp, nivel, racha, ultimo_login")
        .eq("id", userId)
        .single();

      const nuevoXp    = (userData?.xp || 0) + reto.xp_reward;
      const nuevoNivel = Math.floor(0.1 * Math.sqrt(nuevoXp)) + 1;
      const hoy        = new Date().toISOString().split("T")[0];
      const ayer       = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      const nuevaRacha =
        userData?.ultimo_login === ayer ? (userData?.racha || 0) + 1 :
        userData?.ultimo_login === hoy  ? (userData?.racha || 0) : 1;

      await supabase.from("usuarios").update({
        xp: nuevoXp, nivel: nuevoNivel,
        racha: nuevaRacha, ultimo_login: hoy,
      }).eq("id", userId);

      setCompletados(prev => [...prev, reto.id]);
      setShowSuccess(`¡Correcto! +${reto.xp_reward} XP 🎉`);
      setTimeout(() => setShowSuccess(null), 3000);
      setActiveChallenge(null);
      setUserAnswer("");

    } catch (err) {
      console.error("Error guardando progreso:", err);
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Stats globales ── */
  const todosRetos    = temas.flatMap(t => t.retos || []);
  const totalRetos    = todosRetos.length;
  const totalCompletados = completados.length;
  const pctGlobal     = totalRetos > 0 ? Math.round((totalCompletados / totalRetos) * 100) : 0;

  if (loading) return (
    <>
      <Navbar />
      <div style={loadWrap}>
        <div style={spinnerEl} />
        <p style={{ color:"#94a3b8", fontFamily:"Poppins,sans-serif" }}>Cargando retos...</p>
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
        @keyframes fadeUp  { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shake   { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
        @keyframes pop     { 0%{transform:scale(0.95)} 60%{transform:scale(1.03)} 100%{transform:scale(1)} }

        .fade-in { animation: fadeUp 0.45s ease both; }

        /* ── Tema accordion ── */
        .tema-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 24px; cursor: pointer;
          border-radius: 16px; transition: background 0.2s;
        }
        .tema-header:hover { background: rgba(124,58,237,0.06); }

        /* ── Reto card ── */
        .reto-card {
          background: #fff; border-radius: 16px;
          padding: 24px; transition: transform 0.25s, box-shadow 0.25s;
          position: relative; overflow: hidden;
        }
        .reto-card:not(.locked):not(.active-card):hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 32px rgba(0,0,0,0.14) !important;
        }
        .reto-card.locked { opacity: 0.55; }

        /* ── Inputs & buttons ── */
        .answer-input {
          width: 100%; padding: 12px 14px;
          border: 2px solid #e2e8f0; border-radius: 10px;
          font-size: 0.95rem; font-family: 'Poppins', sans-serif;
          outline: none; transition: border-color 0.2s; margin-bottom: 12px;
          color: #1e293b;
        }
        .answer-input:focus { border-color: #7c3aed; }
        .answer-input.shake { animation: shake 0.35s ease; border-color: #ef4444; }

        .btn-verify {
          flex: 1; padding: 12px; border: none; border-radius: 10px;
          background: linear-gradient(135deg,#7c3aed,#6d28d9);
          color: #fff; font-weight: 700; font-size: 0.95rem;
          font-family: 'Poppins', sans-serif; cursor: pointer;
          transition: opacity 0.2s, transform 0.15s;
          box-shadow: 0 4px 14px rgba(124,58,237,0.35);
        }
        .btn-verify:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .btn-verify:disabled { opacity: 0.55; cursor: not-allowed; }

        .btn-cancel {
          padding: 12px 18px; border: 1.5px solid #e2e8f0;
          border-radius: 10px; background: #fff; color: #64748b;
          font-weight: 600; cursor: pointer; font-family: 'Poppins', sans-serif;
          transition: border-color 0.2s;
        }
        .btn-cancel:hover { border-color: #7c3aed; color: #7c3aed; }

        .btn-start {
          width: 100%; padding: 12px; border: none; border-radius: 10px;
          background: linear-gradient(135deg,#7c3aed,#6d28d9);
          color: #fff; font-weight: 700; font-size: 0.95rem;
          font-family: 'Poppins', sans-serif; cursor: pointer;
          box-shadow: 0 4px 14px rgba(124,58,237,0.3);
          transition: opacity 0.2s, transform 0.15s;
        }
        .btn-start:hover { opacity: 0.9; transform: translateY(-1px); }

        .btn-back {
          display: inline-flex; align-items: center; gap: 6px;
          color: #a78bfa; text-decoration: none; font-weight: 600;
          font-size: 0.92rem; margin-bottom: 28px;
          transition: color 0.2s;
        }
        .btn-back:hover { color: #fff; }
      `}</style>

      <Navbar />

      <div style={wrap}>

        <Link to="/areas" className="btn-back">
          ← Volver a Áreas
        </Link>

        {/* ── Header ── */}
        <div style={headerBox} className="fade-in">
          <h1 style={pageTitle}>Retos de {decodedArea}</h1>
          <p style={pageSub}>
            Completa los retos por tema. Desbloquea niveles superiores superando los anteriores.
          </p>

          {/* Progreso global */}
          <div style={globalProgress}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"8px" }}>
              <span style={{ color:"#94a3b8", fontSize:"0.85rem" }}>
                Progreso total: <strong style={{ color:"#f1f5f9" }}>{totalCompletados}/{totalRetos}</strong>
              </span>
              <span style={{ color:"#7c3aed", fontWeight:"700" }}>{pctGlobal}%</span>
            </div>
            <div style={progBg}>
              <div style={{ ...progFill, width:`${pctGlobal}%` }} />
            </div>
          </div>
        </div>

        {/* ── Toasts ── */}
        {showSuccess && <div style={toastOk} className="fade-in">{showSuccess}</div>}
        {showError   && <div style={toastErr} className="fade-in">❌ Respuesta incorrecta. ¡Inténtalo de nuevo!</div>}

        {/* ── Temas ── */}
        {temas.length === 0 && (
          <div style={emptyBox}>
            <p style={{ fontSize:"1.1rem", color:"#94a3b8" }}>🚧 Aún no hay temas para esta área.</p>
          </div>
        )}

        {temas.map((tema, tIdx) => {
          const retosDelTema = tema.retos || [];
          const compTema     = retosDelTema.filter(r => completados.includes(r.id)).length;
          const pctTema      = retosDelTema.length > 0
            ? Math.round((compTema / retosDelTema.length) * 100) : 0;
          const isOpen       = expandedTema === tema.id;

          // Agrupar por dificultad en orden
          const porDiff = ["Fácil","Media","Difícil"].map(diff => ({
            diff,
            retos: retosDelTema.filter(r => r.dificultad === diff),
            locked: isLocked(tema, diff),
          })).filter(g => g.retos.length > 0);

          return (
            <div key={tema.id} style={temaBox} className="fade-in">

              {/* Header del tema */}
              <div
                className="tema-header"
                onClick={() => setExpandedTema(isOpen ? null : tema.id)}
              >
                <div style={{ display:"flex", alignItems:"center", gap:"14px" }}>
                  <div style={temaNum}>{tIdx + 1}</div>
                  <div>
                    <h2 style={temaNombre}>{tema.nombre}</h2>
                    <p style={temaMeta}>
                      {compTema}/{retosDelTema.length} retos completados
                    </p>
                  </div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:"16px" }}>
                  {/* Mini progress */}
                  <div style={{ textAlign:"right" }}>
                    <span style={{ color:"#7c3aed", fontWeight:"700", fontSize:"0.9rem" }}>
                      {pctTema}%
                    </span>
                    <div style={{ ...progBg, width:"80px", marginTop:"4px" }}>
                      <div style={{ ...progFill, width:`${pctTema}%` }} />
                    </div>
                  </div>
                  <span style={{ color:"#94a3b8", fontSize:"1.2rem", transition:"transform 0.3s",
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
                    ▾
                  </span>
                </div>
              </div>

              {/* Contenido expandido */}
              {isOpen && (
                <div style={{ padding:"0 24px 28px" }}>

                  {/* Explicación del tema */}
                  <div style={explBox}>
                    <div style={explHeader}>
                      <span style={explIcon}>📖</span>
                      <span style={{ fontWeight:"700", color:"#1e293b" }}>Explicación del tema</span>
                    </div>
                    <p style={explText}>{tema.explicacion}</p>
                  </div>

                  {/* Grupos por dificultad */}
                  {porDiff.map(({ diff, retos: retosGrupo, locked }) => (
                    <div key={diff} style={{ marginBottom:"28px" }}>

                      {/* Encabezado del nivel */}
                      <div style={diffHeader}>
                        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                          <span style={{
                            background: DIFF_BG[diff],
                            color: DIFF_TEXT[diff],
                            padding:"4px 14px", borderRadius:"20px",
                            fontSize:"0.82rem", fontWeight:"700"
                          }}>
                            {diff}
                          </span>
                          {locked && (
                            <span style={lockBadge}>
                              🔒 Completa los retos {diff === "Media" ? "Fáciles" : "Medios"} para desbloquear
                            </span>
                          )}
                        </div>
                        <span style={{ color:"#94a3b8", fontSize:"0.82rem" }}>
                          {retosGrupo.filter(r => completados.includes(r.id)).length}/{retosGrupo.length} completados
                        </span>
                      </div>

                      {/* Grid de retos */}
                      <div style={retosGrid}>
                        {retosGrupo.map(reto => {
                          const done     = completados.includes(reto.id);
                          const isActive = activeChallenge?.id === reto.id;

                          return (
                            <div
                              key={reto.id}
                              className={`reto-card${locked ? " locked" : ""}${isActive ? " active-card" : ""}`}
                              style={{
                                boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
                                borderTop: `3px solid ${DIFF_COLORS[reto.dificultad]}`,
                              }}
                            >
                              {/* Badge completado */}
                              {done && (
                                <div style={doneBadge}>✅ Completado</div>
                              )}

                              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px" }}>
                                <span style={{
                                  background: DIFF_BG[reto.dificultad],
                                  color: DIFF_TEXT[reto.dificultad],
                                  padding:"3px 10px", borderRadius:"20px",
                                  fontSize:"0.75rem", fontWeight:"700"
                                }}>{reto.dificultad}</span>
                                <span style={xpTag}>+{reto.xp_reward} XP</span>
                              </div>

                              <h3 style={retoTitle}>{reto.titulo}</h3>
                              <p style={retoDesc}>{reto.descripcion}</p>

                              {/* Zona de resolución */}
                              {isActive ? (
                                <div style={solverBox}>
                                  <p style={problemTxt}>{reto.problem}</p>
                                  <input
                                    className={`answer-input${showError ? " shake" : ""}`}
                                    type="text"
                                    value={userAnswer}
                                    onChange={e => setUserAnswer(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && handleVerify(reto)}
                                    placeholder="Escribe tu respuesta..."
                                    autoFocus
                                  />
                                  <div style={{ display:"flex", gap:"10px" }}>
                                    <button
                                      className="btn-verify"
                                      onClick={() => handleVerify(reto)}
                                      disabled={submitting || !userAnswer.trim()}
                                    >
                                      {submitting ? "Verificando..." : "✓ Verificar"}
                                    </button>
                                    <button
                                      className="btn-cancel"
                                      onClick={() => { setActiveChallenge(null); setUserAnswer(""); }}
                                    >
                                      Cancelar
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  className="btn-start"
                                  style={done || locked ? { background:"#94a3b8", boxShadow:"none", cursor:"not-allowed", opacity:0.7 } : {}}
                                  onClick={() => !done && !locked && setActiveChallenge(reto)}
                                  disabled={done || locked}
                                >
                                  {done ? "✅ Completado" : locked ? "🔒 Bloqueado" : "Iniciar Reto →"}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Footer */}
        <footer style={footerStyle}>
          <p>© 2026 Cognify. Aprende jugando, crece cada día.</p>
          <div style={{ display:"flex", gap:"20px" }}>
            <a href="#" style={footerLink}>Ayuda</a>
            <a href="#" style={footerLink}>Términos</a>
            <a href="#" style={footerLink}>Privacidad</a>
          </div>
        </footer>

      </div>
    </>
  );
}

/* ── ESTILOS ── */
const loadWrap   = { display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100vh", gap:"16px", background:"#0f1117" };
const spinnerEl  = { width:"44px", height:"44px", border:"4px solid #7c3aed", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite" };

const wrap       = { maxWidth:"1100px", margin:"0 auto", padding:"100px 24px 80px", fontFamily:"'Poppins',sans-serif" };

const headerBox  = { marginBottom:"40px" };
const pageTitle  = { fontSize:"2.4rem", fontWeight:"800", color:"#f1f5f9", marginBottom:"8px" };
const pageSub    = { color:"#94a3b8", fontSize:"0.95rem", marginBottom:"24px" };

const globalProgress = { background:"#1e293b", borderRadius:"12px", padding:"16px 20px" };
const progBg     = { height:"8px", background:"#334155", borderRadius:"99px", overflow:"hidden" };
const progFill   = { height:"100%", background:"linear-gradient(90deg,#7c3aed,#a78bfa)", borderRadius:"99px", transition:"width 0.6s ease" };

const toastOk    = { background:"#d1fae5", borderLeft:"4px solid #10b981", color:"#065f46", padding:"12px 20px", borderRadius:"0 10px 10px 0", marginBottom:"20px", fontWeight:"600" };
const toastErr   = { background:"#fee2e2", borderLeft:"4px solid #ef4444", color:"#991b1b", padding:"12px 20px", borderRadius:"0 10px 10px 0", marginBottom:"20px", fontWeight:"600" };

const temaBox    = { background:"#1a1f2e", borderRadius:"20px", marginBottom:"20px", overflow:"hidden", border:"1px solid #1e293b" };
const temaNum    = { width:"38px", height:"38px", borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#6d28d9)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:"800", fontSize:"0.9rem", flexShrink:0 };
const temaNombre = { fontSize:"1.1rem", fontWeight:"700", color:"#f1f5f9", marginBottom:"2px" };
const temaMeta   = { fontSize:"0.78rem", color:"#64748b" };

const explBox    = { background:"#0f1117", borderRadius:"14px", padding:"18px 20px", marginBottom:"24px", border:"1px solid #1e293b" };
const explHeader = { display:"flex", alignItems:"center", gap:"8px", marginBottom:"10px" };
const explIcon   = { fontSize:"1.1rem" };
const explText   = { color:"#94a3b8", fontSize:"0.92rem", lineHeight:"1.7" };

const diffHeader = { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"14px" };
const lockBadge  = { background:"#1e293b", color:"#64748b", padding:"4px 12px", borderRadius:"20px", fontSize:"0.75rem", fontWeight:"600" };

const retosGrid  = { display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))", gap:"16px" };
const doneBadge  = { position:"absolute", top:"12px", right:"12px", background:"#d1fae5", color:"#065f46", padding:"3px 10px", borderRadius:"20px", fontSize:"0.72rem", fontWeight:"700" };
const xpTag      = { background:"#ede9fe", color:"#7c3aed", padding:"3px 10px", borderRadius:"20px", fontSize:"0.75rem", fontWeight:"700" };
const retoTitle  = { fontSize:"1.1rem", fontWeight:"700", color:"#1e293b", marginBottom:"8px" };
const retoDesc   = { color:"#475569", fontSize:"0.88rem", lineHeight:"1.6", marginBottom:"18px" };

const solverBox  = { background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:"12px", padding:"16px" };
const problemTxt = { color:"#1e293b", fontSize:"1rem", fontWeight:"600", marginBottom:"14px", lineHeight:"1.6" };

const emptyBox   = { background:"#1a1f2e", borderRadius:"20px", padding:"48px", textAlign:"center" };

const footerStyle = { borderTop:"1px solid #1e293b", paddingTop:"24px", marginTop:"40px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"12px" };
const footerLink  = { fontSize:"0.82rem", color:"#475569", textDecoration:"none" };