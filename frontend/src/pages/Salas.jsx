import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import Navbar from "../components/Navbar";
import LogoSalas from "../assets/LogoSalas.png";
import {
  crearSala, unirseSala, obtenerJugadores, obtenerSala,
  marcarListo, iniciarPartida, actualizarPuntaje,
  marcarTerminado, terminarPartida, obtenerRetosOnline,
  suscribirJugadores, suscribirSala, salirSala,
} from "../services/salaService";

const AREAS = ["Matemáticas", "Lógica", "Programación", "Memoria", "Aleatorio"];
const AREA_ICONS = {
  "Matemáticas":  "📐",
  "Lógica":       "🧩",
  "Programación": "💻",
  "Memoria":      "🧠",
  "Aleatorio":    "🎲",
};
const OPCIONES_RETOS = [5, 10, 15];
const TIEMPO_POR_PREGUNTA = 20;
const AREAS_SIN_TIMER = ["Programación"];

export default function Salas() {
  const [user,          setUser]          = useState(null);
  const [userName,      setUserName]      = useState("");
  const [pantalla,      setPantalla]      = useState("inicio");
  const [sala,          setSala]          = useState(null);
  const [jugadores,     setJugadores]     = useState([]);
  const [codigoInput,   setCodigoInput]   = useState("");
  const [areaSeleccion, setAreaSeleccion] = useState("Matemáticas");
  const [maxRetos,      setMaxRetos]      = useState(5);
  const [error,         setError]         = useState("");
  const [loading,       setLoading]       = useState(false);

  const [retos,        setRetos]        = useState([]);
  const [retoIdx,      setRetoIdx]      = useState(0);
  const [respuesta,    setRespuesta]    = useState("");
  const [puntaje,      setPuntaje]      = useState(0);
  const [tiempoTotal,  setTiempoTotal]  = useState(0);
  const [tiempoReto,   setTiempoReto]   = useState(TIEMPO_POR_PREGUNTA);
  const [feedbackOk,   setFeedbackOk]   = useState(null);
  const [terminado,    setTerminado]    = useState(false);
  const [resultado,    setResultado]    = useState(null);
  const [areaActual,   setAreaActual]   = useState("");

  const timerRetoRef  = useRef(null);
  const timerTotalRef = useRef(null);
  const canalRef      = useRef(null);
  const canalSalaRef  = useRef(null);
  const inputRef      = useRef(null);
  const retoIdxRef = useRef(0);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);
      const { data: uDB } = await supabase
        .from("usuarios").select("nombre").eq("id", user.id).single();
      setUserName(uDB?.nombre || user.email.split("@")[0]);
    };
    init();
    return () => limpiarTimers();
  }, []);

  useEffect(() => {
  retoIdxRef.current = retoIdx;
}, [retoIdx]);

  const limpiarTimers = () => {
    clearInterval(timerRetoRef.current);
    clearInterval(timerTotalRef.current);
  };

 const suscribir = (salaId) => {
  canalRef.current = suscribirJugadores(salaId, async () => {
    const { data } = await obtenerJugadores(salaId);
    setJugadores(data);

    // Verificar si todos terminaron en tiempo real
    if (data.length >= 2 && data.every(j => j.terminado)) {
      await terminarPartida(salaId);
      await cargarResultado(salaId);
    }
  });

  canalSalaRef.current = suscribirSala(salaId, async (payload) => {
    const nuevoEstado = payload.new?.estado;
    if (nuevoEstado === "jugando") await cargarRetosYEmpezar(salaId);
    if (nuevoEstado === "terminada") await cargarResultado(salaId);
  });
};
  const desuscribir = () => {
    canalRef.current?.unsubscribe();
    canalSalaRef.current?.unsubscribe();
  };

  const handleCrear = async () => {
    if (!user) return;
    setLoading(true); setError("");
    const areaNombre = areaSeleccion === "Aleatorio" ? "aleatorio" : areaSeleccion;
    const { data, error } = await crearSala(user.id, areaNombre, maxRetos);
    if (error) { setError(error.message || "Error al crear sala"); setLoading(false); return; }
    setSala(data);
    setAreaActual(areaSeleccion);
    const { data: jug } = await obtenerJugadores(data.id);
    setJugadores(jug);
    suscribir(data.id);
    setPantalla("lobby");
    setLoading(false);
  };

  const handleUnirse = async () => {
    if (!codigoInput.trim()) { setError("Ingresa un código."); return; }
    setLoading(true); setError("");
    const { sala, error } = await unirseSala(codigoInput, user.id);
    if (error) { setError(error); setLoading(false); return; }
    const { data: salaFull } = await obtenerSala(sala.id);
    setSala(salaFull);
    setAreaActual(salaFull?.areas?.nombre || "Aleatorio");
    const { data: jug } = await obtenerJugadores(sala.id);
    setJugadores(jug);
    suscribir(sala.id);
    setPantalla("lobby");
    setLoading(false);
  };

  const handleListo = async () => {
    if (!sala) return;
    await marcarListo(sala.id, user.id);
    const { data: jug } = await obtenerJugadores(sala.id);
    setJugadores(jug);
    const todosListos = jug.length >= 2 && jug.every(j => j.listo);
    if (sala.creador_id === user.id && todosListos) {
      await iniciarPartida(sala.id);
    }
  };

  const cargarRetosYEmpezar = async (salaId) => {
    const { data: salaData } = await obtenerSala(salaId);
    const areaNombre = salaData?.areas?.nombre || "aleatorio";
    const cantidad   = salaData?.max_retos || maxRetos || 5;
    const { data: retosData } = await obtenerRetosOnline(areaNombre, cantidad);
    setRetos(retosData);
    setRetoIdx(0);
    setPuntaje(0);
    setTiempoTotal(0);
    setTerminado(false);
    setFeedbackOk(null);
    setRespuesta("");
    setAreaActual(areaNombre);
    setPantalla("jugando");
    iniciarTimers(areaNombre);
  };

const tieneLimite = (area) => !AREAS_SIN_TIMER.includes(area);

const iniciarTimers = (area) => {
  limpiarTimers();

  timerTotalRef.current = setInterval(() => {
    setTiempoTotal(prev => prev + 1);
  }, 1000);

  if (tieneLimite(area)) {
    setTiempoReto(TIEMPO_POR_PREGUNTA);
    timerRetoRef.current = setInterval(() => {
      setTiempoReto(prev => {
        if (prev <= 1) {
          pasarRetoTimer();
          return TIEMPO_POR_PREGUNTA;
        }
        return prev - 1;
      });
    }, 1000);
  }
};

  const resetTimerReto = () => setTiempoReto(TIEMPO_POR_PREGUNTA);

  const handleVerificar = async () => {
    if (!respuesta.trim() || !retos[retoIdx]) return;
    const correcto = respuesta.trim().toLowerCase() ===
                     retos[retoIdx].answer.trim().toLowerCase();
    setFeedbackOk(correcto);
    setTimeout(() => setFeedbackOk(null), 600);
    if (correcto) {
      const nuevoPuntaje = puntaje + 1;
      setPuntaje(nuevoPuntaje);
      if (sala) await actualizarPuntaje(sala.id, user.id, nuevoPuntaje);
    }
    setRespuesta("");
    pasarReto(correcto);
  };

  const pasarReto = async (correcto = false) => {
    resetTimerReto();
    const siguiente = retoIdx + 1;
    if (siguiente >= retos.length) {
      await finalizarJuego();
    } else {
      setRetoIdx(siguiente);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const pasarRetoTimer = () => {
  const siguiente = retoIdxRef.current + 1;
  setRetos(currentRetos => {
    if (siguiente >= currentRetos.length) {
      limpiarTimers();
      setTerminado(true);
      if (sala) {
        setPuntaje(p => {
          marcarTerminado(sala.id, user?.id, p);
          return p;
        });
      }
    } else {
      setRetoIdx(siguiente);
      retoIdxRef.current = siguiente;
    }
    return currentRetos;
  });
};

  const finalizarJuego = async () => {
    limpiarTimers();
    setTerminado(true);
    if (sala) await marcarTerminado(sala.id, user.id, puntaje);
    setTimeout(async () => {
      if (!sala) return;
      const { data: jug } = await obtenerJugadores(sala.id);
      const todosTerminaron = jug.every(j => j.terminado);
      if (todosTerminaron) {
        await terminarPartida(sala.id);
        await cargarResultado(sala.id);
      }
    }, 2000);
  };

  const cargarResultado = async (salaId) => {
    const { data: jug } = await obtenerJugadores(salaId);
    const { data: salaData } = await obtenerSala(salaId);
    const ordenados = [...jug].sort((a, b) => b.puntaje - a.puntaje);
    setResultado({ jugadores: ordenados, ganadorId: salaData?.ganador_id });
    limpiarTimers();
    desuscribir();
    setPantalla("resultado");
  };

  const handleSalir = async () => {
    limpiarTimers();
    desuscribir();
    if (sala) await salirSala(sala.id, user.id);
    setSala(null); setJugadores([]); setRetos([]);
    setRetoIdx(0); setPuntaje(0); setTiempoTotal(0);
    setTerminado(false); setResultado(null);
    setCodigoInput(""); setError("");
    setPantalla("inicio");
  };

  const formatTiempo = (seg) => {
    const m = Math.floor(seg / 60).toString().padStart(2, "0");
    const s = (seg % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const yoJugador = jugadores.find(j => j.usuario_id === user?.id);
  const esCreador = sala?.creador_id === user?.id;
  const retoActual = retos[retoIdx];
  const timerPct  = (tiempoReto / TIEMPO_POR_PREGUNTA) * 100;
  const timerColor = tiempoReto > 10 ? "#10b981" : tiempoReto > 5 ? "#f59e0b" : "#ef4444";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

        .salas-page {
          background:#0f1117;
          min-height:100vh;
          font-family:'Poppins',sans-serif;
          color:#f1f5f9;
        }

        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse   { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
        @keyframes shake   { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
        @keyframes flashOk { 0%{background:#d1fae5} 100%{background:#f8fafc} }
        @keyframes flashErr{ 0%{background:#fee2e2} 100%{background:#f8fafc} }

        .salas-wrap {
          max-width:860px; margin:0 auto;
          padding:100px 24px 80px;
        }

        .btn-primary {
          display:inline-flex; align-items:center; gap:8px;
          background:linear-gradient(135deg,#7c3aed,#6d28d9);
          color:#fff; padding:13px 28px; border-radius:12px;
          font-size:0.95rem; font-weight:700; font-family:'Poppins',sans-serif;
          border:none; cursor:pointer;
          box-shadow:0 6px 20px rgba(124,58,237,0.35);
          transition:transform 0.2s,opacity 0.2s;
        }
        .btn-primary:hover:not(:disabled) { transform:translateY(-2px); opacity:0.92; }
        .btn-primary:disabled { opacity:0.5; cursor:not-allowed; }

        .btn-secondary {
          display:inline-flex; align-items:center; gap:8px;
          background:#1e293b; color:#94a3b8;
          padding:13px 28px; border-radius:12px;
          font-size:0.95rem; font-weight:600; font-family:'Poppins',sans-serif;
          border:1px solid #334155; cursor:pointer;
          transition:border-color 0.2s,color 0.2s;
        }
        .btn-secondary:hover { border-color:#7c3aed; color:#a78bfa; }

        .btn-danger {
          background:rgba(239,68,68,0.12); color:#f87171;
          padding:10px 20px; border-radius:10px;
          font-weight:600; font-size:0.88rem;
          border:1px solid rgba(239,68,68,0.2); cursor:pointer;
          font-family:'Poppins',sans-serif; transition:background 0.2s;
        }
        .btn-danger:hover { background:rgba(239,68,68,0.22); }

        .sala-input {
          width:100%; padding:13px 16px;
          background:#1e293b; border:2px solid #334155;
          border-radius:12px; color:#f1f5f9;
          font-size:1rem; font-family:'Poppins',sans-serif;
          outline:none; transition:border-color 0.2s;
        }
        .sala-input:focus { border-color:#7c3aed; }
        .sala-input::placeholder { color:#475569; }

        .error-toast {
          background:rgba(239,68,68,0.12); color:#fca5a5;
          padding:12px 16px; border-radius:10px;
          font-size:0.88rem; font-weight:500;
          border:1px solid rgba(239,68,68,0.25);
          margin-bottom:16px; animation:fadeUp 0.3s ease;
        }

        .inicio-header { text-align:center; margin-bottom:40px; animation:fadeUp 0.5s ease both; }
        .inicio-logo { width:80px; height:80px; object-fit:contain; margin-bottom:16px; }
        .inicio-header h1 { font-size:2.2rem; font-weight:800; color:#f1f5f9; margin-bottom:8px; }
        .inicio-header p  { color:#94a3b8; font-size:0.95rem; }

        .inicio-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; animation:fadeUp 0.5s ease 0.1s both; }
        @media(max-width:600px){ .inicio-grid{ grid-template-columns:1fr; } }

        .panel-card {
          background:#1a1f2e; border-radius:20px; padding:28px;
          border:1px solid #1e293b;
        }
        .panel-card h2 { font-size:1.1rem; font-weight:700; color:#f1f5f9; margin-bottom:6px; }
        .panel-card p  { color:#64748b; font-size:0.85rem; margin-bottom:18px; }

        .field-label { font-size:0.78rem; color:#64748b; font-weight:500; margin-bottom:6px; display:block; }

        .area-select, .retos-select {
          width:100%; padding:11px 14px; margin-bottom:14px;
          background:#0f1117; border:2px solid #334155;
          border-radius:10px; color:#f1f5f9;
          font-size:0.92rem; font-family:'Poppins',sans-serif;
          outline:none; cursor:pointer; transition:border-color 0.2s;
        }
        .area-select:focus, .retos-select:focus { border-color:#7c3aed; }

        .retos-opciones { display:flex; gap:8px; margin-bottom:16px; }
        .reto-opt {
          flex:1; padding:10px; border-radius:10px;
          border:2px solid #334155; background:#0f1117;
          color:#94a3b8; font-weight:600; font-size:0.9rem;
          cursor:pointer; text-align:center; transition:all 0.2s;
          font-family:'Poppins',sans-serif;
        }
        .reto-opt.active { border-color:#7c3aed; color:#a78bfa; background:rgba(124,58,237,0.1); }

        .lobby-wrap { animation:fadeUp 0.5s ease both; }
        .lobby-header { text-align:center; margin-bottom:28px; }
        .lobby-header h1 { font-size:1.8rem; font-weight:800; color:#f1f5f9; margin-bottom:6px; }
        .lobby-header p  { color:#94a3b8; font-size:0.88rem; }

        .codigo-box {
          background:linear-gradient(135deg,#7c3aed,#6d28d9);
          border-radius:18px; padding:20px 28px;
          text-align:center; margin-bottom:24px;
          box-shadow:0 8px 24px rgba(124,58,237,0.4);
        }
        .codigo-box p   { font-size:0.8rem; opacity:0.82; margin-bottom:4px; }
        .codigo-box h2  { font-size:2.6rem; font-weight:800; letter-spacing:8px; }

        .lobby-info {
          display:flex; justify-content:center; gap:20px;
          margin-bottom:24px; flex-wrap:wrap;
        }
        .lobby-pill {
          background:#1e293b; border:1px solid #334155;
          border-radius:50px; padding:8px 18px;
          font-size:0.82rem; color:#94a3b8; font-weight:500;
          display:flex; align-items:center; gap:6px;
        }
        .lobby-pill strong { color:#a78bfa; }

        .jugadores-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:24px; }
        @media(max-width:480px){ .jugadores-grid{ grid-template-columns:1fr; } }

        .jugador-card {
          background:#fff; border-radius:16px; padding:18px 20px;
          display:flex; align-items:center; gap:14px;
        }
        .jugador-avatar {
          width:42px; height:42px; border-radius:50%;
          background:linear-gradient(135deg,#7c3aed,#6d28d9);
          display:flex; align-items:center; justify-content:center;
          color:#fff; font-weight:800; font-size:1.1rem; flex-shrink:0;
          overflow:hidden;
        }
        .jugador-avatar img { width:100%; height:100%; object-fit:cover; }
        .jugador-nombre { font-weight:700; color:#1e293b; font-size:0.92rem; margin-bottom:4px; }
        .estado-badge {
          font-size:0.72rem; font-weight:700;
          padding:3px 10px; border-radius:20px; display:inline-block;
        }

        .slot-vacio {
          background:#1a1f2e; border-radius:16px; padding:20px;
          display:flex; align-items:center; justify-content:center;
          border:2px dashed #334155; color:#475569;
          font-size:0.88rem; min-height:80px;
        }

        .lobby-actions { display:flex; gap:12px; justify-content:center; flex-wrap:wrap; }

        .game-wrap { animation:fadeUp 0.4s ease both; }

        .game-top {
          display:flex; justify-content:space-between; align-items:center;
          margin-bottom:20px; flex-wrap:wrap; gap:12px;
        }

        .score-pill {
          background:#1a1f2e; border:1px solid #1e293b;
          border-radius:12px; padding:10px 20px;
          display:flex; align-items:center; gap:8px;
        }
        .score-pill span   { color:#94a3b8; font-size:0.8rem; }
        .score-pill strong { color:#a78bfa; font-size:1.2rem; font-weight:800; }

        .timer-wrap { flex:1; max-width:300px; }
        .timer-label {
          display:flex; justify-content:space-between;
          font-size:0.75rem; color:#64748b; margin-bottom:4px;
        }
        .timer-label span:last-child { font-weight:700; }
        .timer-bg { height:8px; background:#1e293b; border-radius:99px; overflow:hidden; }
        .timer-fill { height:100%; border-radius:99px; transition:width 1s linear, background 0.5s; }

        .retos-progress { display:flex; gap:6px; margin-bottom:20px; }
        .reto-dot {
          flex:1; height:6px; border-radius:99px;
          background:#1e293b; transition:background 0.3s;
        }
        .reto-dot.done    { background:#7c3aed; }
        .reto-dot.current { background:#a78bfa; }

        .game-card {
          background:#fff; border-radius:20px; padding:28px;
          margin-bottom:18px;
          box-shadow:0 8px 32px rgba(0,0,0,0.2);
          transition:background 0.3s;
        }
        .game-card.ok   { animation:flashOk  0.5s ease; }
        .game-card.fail { animation:flashErr 0.5s ease; }
        .game-card .reto-num  { font-size:0.8rem; color:#94a3b8; margin-bottom:8px; }
        .game-card .reto-preg { font-size:1.15rem; font-weight:700; color:#1e293b; line-height:1.55; }

        .rival-bar {
          background:#1a1f2e; border-radius:14px; padding:12px 18px;
          display:flex; align-items:center; justify-content:space-between;
          border:1px solid #1e293b; margin-bottom:18px; gap:12px;
          flex-wrap:wrap;
        }
        .rival-bar .rival-name { font-size:0.85rem; color:#94a3b8; }
        .rival-bar .rival-score { font-size:1rem; font-weight:700; color:#a78bfa; }
        .rival-bar .rival-done  { font-size:0.78rem; color:#f59e0b; font-weight:600; }

        .answer-row { display:flex; gap:10px; }
        .game-input {
          flex:1; padding:13px 16px;
          background:#1e293b; border:2px solid #334155;
          border-radius:12px; color:#f1f5f9;
          font-size:1rem; font-family:'Poppins',sans-serif; outline:none;
          transition:border-color 0.2s;
        }
        .game-input:focus { border-color:#7c3aed; }
        .game-input.ok   { border-color:#10b981; }
        .game-input.fail { border-color:#ef4444; animation:shake 0.35s ease; }

        .result-wrap { text-align:center; animation:fadeUp 0.5s ease both; }
        .result-logo { width:70px; height:70px; object-fit:contain; margin-bottom:16px; }
        .result-wrap h1 { font-size:2rem; font-weight:800; color:#f1f5f9; margin-bottom:6px; }
        .result-wrap > p { color:#94a3b8; margin-bottom:28px; font-size:0.9rem; }

        .podio { display:flex; flex-direction:column; gap:12px; margin-bottom:28px; }
        .podio-card {
          background:#fff; border-radius:16px; padding:18px 22px;
          display:flex; align-items:center; gap:16px;
          box-shadow:0 4px 16px rgba(0,0,0,0.1);
        }
        .podio-card.ganador { border:2px solid #d4af37; }
        .medalla     { font-size:1.8rem; flex-shrink:0; }
        .podio-nombre  { font-weight:700; color:#1e293b; font-size:0.95rem; margin-bottom:3px; }
        .podio-puntaje { color:#7c3aed; font-weight:700; font-size:0.88rem; }
        .podio-tag {
          margin-left:auto; flex-shrink:0;
          background:#fef9c3; color:#92400e;
          padding:4px 12px; border-radius:20px;
          font-size:0.75rem; font-weight:700;
        }
        .podio-tag.win { background:#d1fae5; color:#065f46; }
        .podio-tag.emp { background:#e0e7ff; color:#3730a3; }
      `}</style>

      <Navbar />

      <div className="salas-page">
        <div className="salas-wrap">

          {/* ══ INICIO ══ */}
          {pantalla === "inicio" && (
            <>
              <div className="inicio-header">
                <img src={LogoSalas} alt="Salas" className="inicio-logo" />
                <h1>Salas de Retos</h1>
                <p>Compite en tiempo real contra otros estudiantes. ¡El más preciso gana!</p>
              </div>

              {error && <div className="error-toast">{error}</div>}

              <div className="inicio-grid">
                <div className="panel-card">
                  <h2>Crear sala</h2>
                  <p>Elige el área y la cantidad de preguntas.</p>
                  <label className="field-label">Área de conocimiento</label>
                  <select className="area-select" value={areaSeleccion}
                    onChange={e => setAreaSeleccion(e.target.value)}>
                    {AREAS.map(a => (
                      <option key={a} value={a}>{AREA_ICONS[a]} {a}</option>
                    ))}
                  </select>
                  <label className="field-label">Cantidad de preguntas</label>
                  <div className="retos-opciones">
                    {OPCIONES_RETOS.map(n => (
                      <button key={n}
                        className={`reto-opt${maxRetos === n ? " active" : ""}`}
                        onClick={() => setMaxRetos(n)}>
                        {n}
                      </button>
                    ))}
                  </div>
                  <button className="btn-primary" style={{ width:"100%" }}
                    onClick={handleCrear} disabled={loading}>
                    {loading ? "Creando..." : "Crear Sala"}
                  </button>
                </div>

                <div className="panel-card">
                  <h2>Unirse a sala</h2>
                  <p>Ingresa el código que te compartió tu compañero.</p>
                  <label className="field-label">Código de sala</label>
                  <input
                    className="sala-input"
                    style={{ marginBottom:"16px", textTransform:"uppercase",
                      letterSpacing:"6px", textAlign:"center", fontSize:"1.4rem" }}
                    placeholder="AB12C"
                    value={codigoInput}
                    onChange={e => setCodigoInput(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === "Enter" && handleUnirse()}
                    maxLength={5}
                  />
                  <button className="btn-primary" style={{ width:"100%" }}
                    onClick={handleUnirse}
                    disabled={loading || !codigoInput.trim()}>
                    {loading ? "Buscando..." : "Unirse"}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ══ LOBBY ══ */}
          {pantalla === "lobby" && sala && (
            <div className="lobby-wrap">
              <div className="lobby-header">
                <h1>Sala de espera</h1>
                <p>Espera a que tu rival esté listo para comenzar</p>
              </div>

              <div className="codigo-box">
                <p>Comparte este código con tu rival</p>
                <h2>{sala.codigo}</h2>
              </div>

              <div className="lobby-info">
                <div className="lobby-pill">
                  Área: <strong>{areaActual || sala.areas?.nombre || "Aleatorio"}</strong>
                </div>
                <div className="lobby-pill">
                  Preguntas: <strong>{sala.max_retos || maxRetos}</strong>
                </div>
                <div className="lobby-pill">
                  Tiempo por pregunta: <strong>
                    {AREAS_SIN_TIMER.includes(areaActual) ? "Sin límite" : `${TIEMPO_POR_PREGUNTA}s`}
                  </strong>
                </div>
              </div>

              <div className="jugadores-grid">
                {jugadores.map(j => (
                  <div className="jugador-card" key={j.id}>
                    <div className="jugador-avatar">
                      {j.usuarios?.nombre?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <p className="jugador-nombre">
                        {j.usuarios?.nombre || j.usuarios?.email?.split("@")[0]}
                        {j.usuario_id === user?.id && " (tú)"}
                      </p>
                      <span className="estado-badge" style={{
                        background: j.listo ? "#d1fae5" : "#fef3c7",
                        color:      j.listo ? "#065f46" : "#92400e",
                      }}>
                        {j.listo ? "Listo" : "Esperando"}
                      </span>
                    </div>
                  </div>
                ))}
                {jugadores.length < 2 && (
                  <div className="slot-vacio">Esperando rival...</div>
                )}
              </div>

              <div className="lobby-actions">
                {!yoJugador?.listo && (
                  <button className="btn-primary" onClick={handleListo}
                    disabled={jugadores.length < 2}>
                    {jugadores.length < 2 ? "Esperando rival..." : "Estoy listo"}
                  </button>
                )}
                {yoJugador?.listo && esCreador &&
                 jugadores.length >= 2 && jugadores.every(j => j.listo) && (
                  <button className="btn-primary" onClick={() => iniciarPartida(sala.id)}>
                    Iniciar partida
                  </button>
                )}
                {yoJugador?.listo && !esCreador && (
                  <p style={{ color:"#64748b", padding:"14px", fontSize:"0.88rem" }}>
                    Esperando que el anfitrión inicie...
                  </p>
                )}
                <button className="btn-danger" onClick={handleSalir}>Salir</button>
              </div>
            </div>
          )}

          {/* ══ JUGANDO ══ */}
          {pantalla === "jugando" && retos.length > 0 && (
            <div className="game-wrap">
              <div className="game-top">
                <div className="score-pill">
                  <span>Tu puntaje</span>
                  <strong>{puntaje}/{retos.length}</strong>
                </div>

                {tieneLimite(areaActual) && (
                  <div className="timer-wrap">
                    <div className="timer-label">
                      <span>Tiempo</span>
                      <span style={{ color: timerColor }}>{tiempoReto}s</span>
                    </div>
                    <div className="timer-bg">
                      <div className="timer-fill" style={{
                        width:`${timerPct}%`,
                        background: timerColor
                      }}/>
                    </div>
                  </div>
                )}

                <div className="score-pill">
                  <span>Tiempo total</span>
                  <strong style={{ color:"#f1f5f9" }}>{formatTiempo(tiempoTotal)}</strong>
                </div>
              </div>

              <div className="retos-progress">
                {retos.map((_, i) => (
                  <div key={i} className={`reto-dot${i < retoIdx ? " done" : i === retoIdx ? " current" : ""}`}/>
                ))}
              </div>

              {jugadores.filter(j => j.usuario_id !== user?.id).map(rival => (
                <div className="rival-bar" key={rival.id}>
                  <span className="rival-name">{rival.usuarios?.nombre || "Rival"}</span>
                  <span className="rival-score">{rival.puntaje}/{retos.length} correctos</span>
                  {rival.terminado && <span className="rival-done">Terminó</span>}
                </div>
              ))}

              {!terminado ? (
                <>
                  <div className={`game-card${feedbackOk === true ? " ok" : feedbackOk === false ? " fail" : ""}`}>
                    <p className="reto-num">Pregunta {retoIdx + 1} de {retos.length}</p>
                    <p className="reto-preg">{retoActual?.problem}</p>
                  </div>
                  <div className="answer-row">
                    <input
                      ref={inputRef}
                      className={`game-input${feedbackOk === true ? " ok" : feedbackOk === false ? " fail" : ""}`}
                      type="text"
                      value={respuesta}
                      onChange={e => setRespuesta(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleVerificar()}
                      placeholder="Tu respuesta..."
                      autoFocus
                    />
                    <button className="btn-primary" onClick={handleVerificar}
                      disabled={!respuesta.trim()}>
                      Verificar
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ textAlign:"center", padding:"48px 20px" }}>
                  <p style={{ fontSize:"1.4rem", marginBottom:"8px" }}>Terminaste</p>
                  <p style={{ color:"#94a3b8", fontSize:"0.9rem" }}>
                    Puntaje: {puntaje}/{retos.length} — Esperando al rival...
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ══ RESULTADO ══ */}
          {pantalla === "resultado" && resultado && (
            <div className="result-wrap">
              <img src={LogoSalas} alt="Salas" className="result-logo" />
              <h1>Resultado Final</h1>
              <p>Tiempo total: {formatTiempo(tiempoTotal)}</p>

              <div className="podio">
                {resultado.jugadores.map((j, i) => {
                  const esGanador = j.usuario_id === resultado.ganadorId;
                  const esEmpate  = resultado.jugadores.length >= 2 &&
                    resultado.jugadores[0].puntaje === resultado.jugadores[1]?.puntaje;
                  const esTu = j.usuario_id === user?.id;
                  return (
                    <div className={`podio-card${i === 0 && !esEmpate ? " ganador" : ""}`} key={j.id}>
                      <span className="medalla">
                        {esEmpate ? "🤝" : i === 0 ? "🥇" : "🥈"}
                      </span>
                      <div>
                        <p className="podio-nombre">
                          {j.usuarios?.nombre || "Jugador"}
                          {esTu && " (tú)"}
                        </p>
                        <p className="podio-puntaje">
                          {j.puntaje}/{retos.length || resultado.jugadores.reduce((a,b) => Math.max(a, b.puntaje), 0)} correctos
                        </p>
                      </div>
                      <span className={`podio-tag${esEmpate ? " emp" : esGanador ? " win" : ""}`}>
                        {esEmpate ? "Empate" : esGanador ? "Ganador" : "Derrota"}
                      </span>
                    </div>
                  );
                })}
              </div>

              <button className="btn-primary" onClick={handleSalir}>
                Volver al inicio
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
}