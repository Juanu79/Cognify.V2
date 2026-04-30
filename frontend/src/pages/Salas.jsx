import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import Navbar from "../components/Navbar";
import {
  crearSala, unirseSala, obtenerJugadores, obtenerSala,
  marcarListo, iniciarPartida, actualizarPuntaje,
  marcarTerminado, terminarPartida, obtenerRetosParaSala,
  suscribirJugadores, suscribirSala, salirSala,
} from "../services/salaService";

const AREAS = ["Matemáticas", "Lógica", "Programación", "Memoria"];
const AREA_ICONS = { "Matemáticas":"📐", "Lógica":"🧩", "Programación":"💻", "Memoria":"🧠" };
const MAX_RETOS = 5;
const TIEMPO_LIMITE = 120;
const MEMORIA_SEGUNDOS = 15; // segundos para memorizar en modo sala

export default function Salas({ user: userProp }) {
  const [user,          setUser]          = useState(null);
  const [userName,      setUserName]      = useState("");
  const [pantalla,      setPantalla]      = useState("inicio");
  const [sala,          setSala]          = useState(null);
  const [jugadores,     setJugadores]     = useState([]);
  const [codigoInput,   setCodigoInput]   = useState("");
  const [areaSeleccion, setAreaSeleccion] = useState("Matemáticas");
  const [error,         setError]         = useState("");
  const [loading,       setLoading]       = useState(false);

  // Juego
  const [retos,         setRetos]         = useState([]);
  const [retoIdx,       setRetoIdx]       = useState(0);
  const [respuesta,     setRespuesta]     = useState("");
  const [puntaje,       setPuntaje]       = useState(0);
  const [tiempoTotal,   setTiempoTotal]   = useState(0);
  const [tiempoReto,    setTiempoReto]    = useState(TIEMPO_LIMITE);
  const [feedbackOk,    setFeedbackOk]    = useState(null);
  const [terminado,     setTerminado]     = useState(false);
  const [resultado,     setResultado]     = useState(null);

  // Memoria
  const [esAreaMemoria,   setEsAreaMemoria]   = useState(false);
  const [isMemorizing,    setIsMemorizing]    = useState(false);
  const [memoriaCountdown, setMemoriaCountdown] = useState(0);
  const memoriaTimerRef = useRef(null);

  const timerRef      = useRef(null);
  const timerTotalRef = useRef(null);
  const canalRef      = useRef(null);
  const canalSalaRef  = useRef(null);

  // ── Cargar usuario ──
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

  const limpiarTimers = () => {
    clearInterval(timerRef.current);
    clearInterval(timerTotalRef.current);
    clearInterval(memoriaTimerRef.current);
  };

  // ── Suscripciones Realtime ──
  const suscribir = (salaId) => {
    canalRef.current = suscribirJugadores(salaId, async () => {
      const { data } = await obtenerJugadores(salaId);
      setJugadores(data);
    });
    canalSalaRef.current = suscribirSala(salaId, async (payload) => {
      const nuevoEstado = payload.new?.estado;
      if (nuevoEstado === "jugando") {
        await cargarRetosYEmpezar(salaId, payload.new?.area_id);
      }
      if (nuevoEstado === "terminada") {
        await cargarResultado(salaId);
      }
    });
  };

  const desuscribir = () => {
    canalRef.current?.unsubscribe();
    canalSalaRef.current?.unsubscribe();
  };

  // ── Crear sala ──
  const handleCrear = async () => {
    if (!user) return;
    setLoading(true); setError("");
    const { data, error } = await crearSala(user.id, areaSeleccion);
    if (error) { setError(error.message); setLoading(false); return; }
    setSala(data);
    const { data: jug } = await obtenerJugadores(data.id);
    setJugadores(jug);
    suscribir(data.id);
    setPantalla("lobby");
    setLoading(false);
  };

  // ── Unirse a sala ──
  const handleUnirse = async () => {
    if (!codigoInput.trim()) { setError("Ingresa un código."); return; }
    setLoading(true); setError("");
    const { sala, error } = await unirseSala(codigoInput, user.id);
    if (error) { setError(error); setLoading(false); return; }
    const { data: salaFull } = await obtenerSala(sala.id);
    setSala(salaFull);
    const { data: jug } = await obtenerJugadores(sala.id);
    setJugadores(jug);
    suscribir(sala.id);
    setPantalla("lobby");
    setLoading(false);
  };

  // ── Marcar listo e iniciar ──
  const handleListo = async () => {
    if (!sala) return;
    await marcarListo(sala.id, user.id);
    if (sala.creador_id === user.id) {
      const { data: jug } = await obtenerJugadores(sala.id);
      const todosListos = jug.length >= 2 && jug.every(j => j.listo);
      if (todosListos) await iniciarPartida(sala.id);
    }
  };

  // ── Cargar retos y empezar juego ──
  const cargarRetosYEmpezar = async (salaId, areaId) => {
    const { data: salaData } = await obtenerSala(salaId);
    const areaNombre = salaData?.areas?.nombre || areaSeleccion;
    const { data: retosData } = await obtenerRetosParaSala(areaNombre, MAX_RETOS);

    const esMemoria = areaNombre.toLowerCase().includes("memoria");
    setEsAreaMemoria(esMemoria);

    setRetos(retosData);
    setRetoIdx(0);
    setPuntaje(0);
    setTiempoTotal(0);
    setTerminado(false);
    setPantalla("jugando");
    iniciarTimers();

    if (esMemoria) {
      iniciarFaseMemoria();
    }
  };

  // ── Fase de memorización (15s para ambos jugadores) ──
  const iniciarFaseMemoria = () => {
    clearInterval(memoriaTimerRef.current);
    setIsMemorizing(true);
    setMemoriaCountdown(MEMORIA_SEGUNDOS);

    memoriaTimerRef.current = setInterval(() => {
      setMemoriaCountdown(prev => {
        if (prev <= 1) {
          clearInterval(memoriaTimerRef.current);
          setIsMemorizing(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const iniciarTimers = () => {
    limpiarTimers();
    setTiempoReto(TIEMPO_LIMITE);
    timerRef.current = setInterval(() => {
      setTiempoReto(prev => {
        if (prev <= 1) { pasarReto(); return TIEMPO_LIMITE; }
        return prev - 1;
      });
    }, 1000);
    timerTotalRef.current = setInterval(() => {
      setTiempoTotal(prev => prev + 1);
    }, 1000);
  };

  // ── Verificar respuesta ──
  const handleVerificar = async () => {
    if (!respuesta.trim() || !retos[retoIdx] || isMemorizing) return;
    const correcto = respuesta.trim().toLowerCase() ===
                     retos[retoIdx].answer.trim().toLowerCase();

    setFeedbackOk(correcto);
    setTimeout(() => setFeedbackOk(null), 800);

    if (correcto) {
      const nuevoPuntaje = puntaje + 1;
      setPuntaje(nuevoPuntaje);
      await actualizarPuntaje(sala.id, user.id, nuevoPuntaje);
    }

    setRespuesta("");
    await pasarReto();
  };

  const pasarReto = async () => {
    const siguiente = retoIdx + 1;
    if (siguiente >= retos.length) {
      await finalizarJuego();
    } else {
      setRetoIdx(siguiente);
      setTiempoReto(TIEMPO_LIMITE);

      // Si es área de memoria, iniciar fase de memorización para el siguiente reto
      if (esAreaMemoria) {
        iniciarFaseMemoria();
      }
    }
  };

  const finalizarJuego = async () => {
    limpiarTimers();
    setTerminado(true);
    await marcarTerminado(sala.id, user.id, puntaje);

    setTimeout(async () => {
      const { data: jug } = await obtenerJugadores(sala.id);
      const todosTerminaron = jug.every(j => j.terminado);
      if (todosTerminaron || sala.creador_id === user.id) {
        const ganador = jug.reduce((a, b) => (a.puntaje >= b.puntaje ? a : b));
        await terminarPartida(sala.id, ganador.usuario_id);
        await cargarResultado(sala.id);
      }
    }, 2000);
  };

  const cargarResultado = async (salaId) => {
    const { data: jug } = await obtenerJugadores(salaId);
    const ordenados = [...jug].sort((a, b) => b.puntaje - a.puntaje);
    setResultado(ordenados);
    limpiarTimers();
    desuscribir();
    setPantalla("resultado");
  };

  const handleSalir = async () => {
    if (sala) await salirSala(sala.id, user.id);
    desuscribir();
    setSala(null); setJugadores([]);
    setRetos([]); setRetoIdx(0); setPuntaje(0);
    setTiempoTotal(0); setTerminado(false); setResultado(null);
    setEsAreaMemoria(false); setIsMemorizing(false); setMemoriaCountdown(0);
    setPantalla("inicio");
  };

  const formatTiempo = (seg) => {
    const m = Math.floor(seg / 60).toString().padStart(2, "0");
    const s = (seg % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const yoJugador = jugadores.find(j => j.usuario_id === user?.id);
  const esCreador = sala?.creador_id === user?.id;

  // Color del countdown de memoria
  const memoriaColor = memoriaCountdown > 10 ? "#10b981" : memoriaCountdown > 5 ? "#f59e0b" : "#ef4444";
  const memoriaDashOffset = 113 - (113 * (memoriaCountdown / MEMORIA_SEGUNDOS));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }
        body { background: #0f1117; font-family: 'Poppins', sans-serif; color: #f1f5f9; }

        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
        @keyframes shake  { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }

        .salas-wrap { max-width: 900px; margin: 0 auto; padding: 100px 24px 80px; }

        .btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg,#7c3aed,#6d28d9);
          color: #fff; padding: 14px 28px; border-radius: 12px;
          font-size: 1rem; font-weight: 700; font-family: 'Poppins',sans-serif;
          border: none; cursor: pointer;
          box-shadow: 0 6px 20px rgba(124,58,237,0.35);
          transition: transform 0.2s, opacity 0.2s;
        }
        .btn-primary:hover:not(:disabled) { transform: translateY(-2px); opacity: 0.92; }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-secondary {
          display: inline-flex; align-items: center; gap: 8px;
          background: #1e293b; color: #94a3b8;
          padding: 14px 28px; border-radius: 12px;
          font-size: 1rem; font-weight: 600; font-family: 'Poppins',sans-serif;
          border: 1px solid #334155; cursor: pointer;
          transition: border-color 0.2s, color 0.2s;
        }
        .btn-secondary:hover { border-color: #7c3aed; color: #a78bfa; }

        .btn-danger {
          background: #fee2e2; color: #ef4444;
          padding: 10px 20px; border-radius: 10px;
          font-weight: 600; font-size: 0.9rem;
          border: none; cursor: pointer; font-family: 'Poppins',sans-serif;
          transition: background 0.2s;
        }
        .btn-danger:hover { background: #fecaca; }

        .sala-input {
          width: 100%; padding: 14px 16px;
          background: #1e293b; border: 2px solid #334155;
          border-radius: 12px; color: #f1f5f9;
          font-size: 1rem; font-family: 'Poppins',sans-serif;
          outline: none; transition: border-color 0.2s;
        }
        .sala-input:focus { border-color: #7c3aed; }
        .sala-input::placeholder { color: #475569; }

        .error-toast {
          background: #fee2e2; color: #991b1b;
          padding: 12px 16px; border-radius: 10px;
          font-size: 0.88rem; font-weight: 500;
          border-left: 4px solid #ef4444; margin-bottom: 16px;
          animation: fadeUp 0.3s ease;
        }

        .inicio-header { text-align: center; margin-bottom: 48px; animation: fadeUp 0.5s ease both; }
        .inicio-header h1 { font-size: 2.6rem; font-weight: 800; color: #f1f5f9; margin-bottom: 8px; }
        .inicio-header p  { color: #94a3b8; font-size: 1rem; }

        .inicio-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; animation: fadeUp 0.5s ease 0.1s both; }
        @media(max-width:640px){ .inicio-grid { grid-template-columns: 1fr; } }

        .panel-card {
          background: #1a1f2e; border-radius: 20px; padding: 32px;
          border: 1px solid #1e293b;
        }
        .panel-card h2 { font-size: 1.3rem; font-weight: 700; color: #f1f5f9; margin-bottom: 6px; }
        .panel-card p  { color: #64748b; font-size: 0.88rem; margin-bottom: 20px; }

        .area-select {
          width: 100%; padding: 12px 14px; margin-bottom: 16px;
          background: #0f1117; border: 2px solid #334155;
          border-radius: 10px; color: #f1f5f9;
          font-size: 0.95rem; font-family: 'Poppins',sans-serif;
          outline: none; cursor: pointer;
        }
        .area-select:focus { border-color: #7c3aed; }

        .lobby-wrap { animation: fadeUp 0.5s ease both; }
        .lobby-header { text-align: center; margin-bottom: 32px; }
        .lobby-header h1 { font-size: 2rem; font-weight: 800; color: #f1f5f9; margin-bottom: 8px; }

        .codigo-box {
          background: linear-gradient(135deg,#7c3aed,#6d28d9);
          border-radius: 16px; padding: 20px 28px;
          text-align: center; margin-bottom: 32px;
          box-shadow: 0 8px 24px rgba(124,58,237,0.35);
        }
        .codigo-box p { font-size: 0.82rem; opacity: 0.8; margin-bottom: 4px; }
        .codigo-box h2 { font-size: 2.8rem; font-weight: 800; letter-spacing: 8px; }

        .jugadores-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 28px; }
        @media(max-width:480px){ .jugadores-grid { grid-template-columns: 1fr; } }

        .jugador-card {
          background: #fff; border-radius: 16px; padding: 20px;
          display: flex; align-items: center; gap: 14px;
        }
        .jugador-avatar {
          width: 44px; height: 44px; border-radius: 50%;
          background: linear-gradient(135deg,#7c3aed,#6d28d9);
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-weight: 800; font-size: 1.1rem; flex-shrink: 0;
        }
        .jugador-nombre { font-weight: 700; color: #1e293b; font-size: 0.95rem; margin-bottom: 4px; }
        .jugador-estado-badge {
          font-size: 0.75rem; font-weight: 600; padding: 3px 10px;
          border-radius: 20px;
        }

        .slot-vacio {
          background: #1a1f2e; border-radius: 16px; padding: 20px;
          display: flex; align-items: center; justify-content: center;
          border: 2px dashed #334155; color: #475569;
          font-size: 0.9rem; min-height: 84px;
        }

        .lobby-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

        .game-wrap { animation: fadeUp 0.4s ease both; }

        .game-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 28px; flex-wrap: wrap; gap: 12px;
        }
        .game-score-box {
          background: #1a1f2e; border-radius: 12px; padding: 10px 20px;
          display: flex; align-items: center; gap: 10px;
          border: 1px solid #1e293b;
        }
        .game-score-box span { color: #94a3b8; font-size: 0.82rem; }
        .game-score-box strong { color: #7c3aed; font-size: 1.2rem; font-weight: 800; }

        .timer-box {
          background: #1a1f2e; border-radius: 12px; padding: 10px 20px;
          border: 1px solid #1e293b; text-align: center;
        }
        .timer-box span { color: #94a3b8; font-size: 0.75rem; display: block; }
        .timer-val { font-size: 1.4rem; font-weight: 800; }

        /* ── Banner de memoria ── */
        .memoria-banner {
          background: linear-gradient(135deg, #1a1f2e, #0f1117);
          border: 2px solid #7c3aed;
          border-radius: 16px; padding: 20px 24px;
          margin-bottom: 20px;
          display: flex; align-items: center; gap: 20px;
          animation: fadeUp 0.3s ease;
        }
        .memoria-banner-text h3 { color: #a78bfa; font-size: 0.85rem; font-weight: 600; margin-bottom: 4px; }
        .memoria-banner-text p  { color: #f1f5f9; font-size: 1rem; font-weight: 700; line-height: 1.5; }

        .memoria-timer-ring circle.track { fill: none; stroke: #334155; stroke-width: 4; }
        .memoria-timer-ring circle.fill  { fill: none; stroke-width: 4; stroke-linecap: round;
          stroke-dasharray: 113; transform: rotate(-90deg); transform-origin: 50% 50%; }

        /* ── Fase responder ── */
        .responder-hint {
          background: #1a1f2e; border: 1px solid #334155;
          border-radius: 12px; padding: 14px 18px; margin-bottom: 16px;
          color: #94a3b8; font-size: 0.9rem; text-align: center;
        }

        .reto-card-game {
          background: #fff; border-radius: 20px; padding: 32px;
          margin-bottom: 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        }
        .reto-num  { font-size: 0.82rem; color: #94a3b8; margin-bottom: 8px; }
        .reto-preg { font-size: 1.2rem; font-weight: 700; color: #1e293b; line-height: 1.5; }

        .respuesta-wrap { display: flex; gap: 12px; }
        .game-input {
          flex: 1; padding: 14px 16px;
          background: #1e293b; border: 2px solid #334155;
          border-radius: 12px; color: #f1f5f9;
          font-size: 1rem; font-family: 'Poppins',sans-serif; outline: none;
          transition: border-color 0.2s;
        }
        .game-input:focus { border-color: #7c3aed; }
        .game-input.ok    { border-color: #10b981; animation: pulse 0.4s ease; }
        .game-input.fail  { border-color: #ef4444; animation: shake 0.35s ease; }
        .game-input:disabled { opacity: 0.4; cursor: not-allowed; }

        .progreso-retos { display: flex; gap: 8px; margin-bottom: 20px; }
        .reto-dot {
          flex: 1; height: 6px; border-radius: 99px; background: #1e293b;
          transition: background 0.3s;
        }
        .reto-dot.done    { background: #7c3aed; }
        .reto-dot.current { background: #a78bfa; }

        .rival-bar {
          background: #1a1f2e; border-radius: 14px; padding: 14px 20px;
          display: flex; align-items: center; gap: 14px; margin-bottom: 20px;
          border: 1px solid #1e293b;
        }
        .rival-bar span { color: #94a3b8; font-size: 0.85rem; }
        .rival-bar strong { color: #f1f5f9; font-weight: 700; }

        .result-wrap { text-align: center; animation: fadeUp 0.5s ease both; }
        .result-wrap h1 { font-size: 2.2rem; font-weight: 800; color: #f1f5f9; margin-bottom: 8px; }
        .result-wrap > p { color: #94a3b8; margin-bottom: 32px; }

        .podio { display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; }
        .podio-card {
          background: #fff; border-radius: 16px; padding: 20px 24px;
          display: flex; align-items: center; gap: 16px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.1);
        }
        .podio-card.primero { border: 2px solid #d4af37; }
        .medalla { font-size: 1.8rem; flex-shrink: 0; }
        .podio-nombre { font-weight: 700; color: #1e293b; font-size: 1rem; margin-bottom: 2px; }
        .podio-puntaje { color: #7c3aed; font-weight: 700; font-size: 0.9rem; }
        .podio-tiempo  { color: #94a3b8; font-size: 0.82rem; margin-left: auto; }
      `}</style>

      <Navbar />

      <div className="salas-wrap">

        {/* ══ PANTALLA INICIO ══ */}
        {pantalla === "inicio" && (
          <>
            <div className="inicio-header">
              <h1>🎮 Salas de Retos</h1>
              <p>Compite en tiempo real contra otros estudiantes. ¡El más rápido gana!</p>
            </div>

            {error && <div className="error-toast">{error}</div>}

            <div className="inicio-grid">
              <div className="panel-card">
                <h2>➕ Crear sala</h2>
                <p>Crea una sala y comparte el código con un amigo.</p>
                <select
                  className="area-select"
                  value={areaSeleccion}
                  onChange={e => setAreaSeleccion(e.target.value)}
                >
                  {AREAS.map(a => (
                    <option key={a} value={a}>{AREA_ICONS[a]} {a}</option>
                  ))}
                </select>
                <button className="btn-primary" style={{ width:"100%" }}
                  onClick={handleCrear} disabled={loading}>
                  {loading ? "Creando..." : "Crear Sala"}
                </button>
              </div>

              <div className="panel-card">
                <h2>🔑 Unirse a sala</h2>
                <p>Ingresa el código que te compartió tu compañero.</p>
                <input
                  className="sala-input"
                  style={{ marginBottom:"16px", textTransform:"uppercase", letterSpacing:"4px", textAlign:"center", fontSize:"1.3rem" }}
                  placeholder="AB12C"
                  value={codigoInput}
                  onChange={e => setCodigoInput(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === "Enter" && handleUnirse()}
                  maxLength={5}
                />
                <button className="btn-primary" style={{ width:"100%" }}
                  onClick={handleUnirse} disabled={loading || !codigoInput.trim()}>
                  {loading ? "Buscando..." : "Unirse →"}
                </button>
              </div>
            </div>
          </>
        )}

        {/* ══ PANTALLA LOBBY ══ */}
        {pantalla === "lobby" && sala && (
          <div className="lobby-wrap">
            <div className="lobby-header">
              <h1>🎯 Sala de espera</h1>
              <p style={{ color:"#94a3b8" }}>
                Área: <strong style={{ color:"#a78bfa" }}>
                  {AREA_ICONS[sala.areas?.nombre]} {sala.areas?.nombre || areaSeleccion}
                </strong>
              </p>
            </div>

            <div className="codigo-box">
              <p>Comparte este código con tu rival</p>
              <h2>{sala.codigo}</h2>
            </div>

            <div className="jugadores-grid">
              {jugadores.map(j => (
                <div className="jugador-card" key={j.id}>
                  <div className="jugador-avatar">
                    {(j.usuarios?.nombre || j.usuarios?.email || "?")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="jugador-nombre">
                      {j.usuarios?.nombre || j.usuarios?.email?.split("@")[0]}
                      {j.usuario_id === user?.id && " (tú)"}
                    </p>
                    <span className="jugador-estado-badge" style={{
                      background: j.listo ? "#d1fae5" : "#fef3c7",
                      color:      j.listo ? "#065f46" : "#92400e",
                    }}>
                      {j.listo ? "✅ Listo" : "⏳ Esperando"}
                    </span>
                  </div>
                </div>
              ))}
              {jugadores.length < 2 && (
                <div className="slot-vacio">⏳ Esperando rival...</div>
              )}
            </div>

            <div className="lobby-actions">
              {!yoJugador?.listo && (
                <button className="btn-primary" onClick={handleListo}
                  disabled={jugadores.length < 2}>
                  {jugadores.length < 2 ? "Esperando rival..." : "✅ ¡Estoy listo!"}
                </button>
              )}
              {yoJugador?.listo && !esCreador && (
                <p style={{ color:"#94a3b8", padding:"14px" }}>
                  Esperando que el anfitrión inicie...
                </p>
              )}
              {yoJugador?.listo && esCreador && jugadores.every(j => j.listo) && (
                <button className="btn-primary" onClick={() => iniciarPartida(sala.id)}>
                  🚀 ¡Iniciar partida!
                </button>
              )}
              <button className="btn-danger" onClick={handleSalir}>Salir</button>
            </div>
          </div>
        )}

        {/* ══ PANTALLA JUGANDO ══ */}
        {pantalla === "jugando" && retos.length > 0 && (
          <div className="game-wrap">

            <div className="game-header">
              <div className="game-score-box">
                <span>Tu puntaje</span>
                <strong>{puntaje}/{MAX_RETOS}</strong>
              </div>

              {jugadores.filter(j => j.usuario_id !== user?.id).map(rival => (
                <div className="rival-bar" key={rival.id} style={{ flex:1, margin:"0 12px" }}>
                  <span>
                    {rival.usuarios?.nombre || "Rival"}: <strong>{rival.puntaje}/{MAX_RETOS}</strong>
                  </span>
                  {rival.terminado && <span style={{ color:"#f59e0b" }}>✅ Terminó</span>}
                </div>
              ))}

              <div className="timer-box">
                <span>Tiempo reto</span>
                <div className="timer-val" style={{ color: tiempoReto <= 10 ? "#ef4444" : "#7c3aed" }}>
                  {formatTiempo(tiempoReto)}
                </div>
              </div>
            </div>

            {/* Progreso de retos */}
            <div className="progreso-retos">
              {retos.map((_, i) => (
                <div key={i} className={`reto-dot${i < retoIdx ? " done" : i === retoIdx ? " current" : ""}`} />
              ))}
            </div>

            {!terminado ? (
              <>
                {/* ── Área de Memoria: fase memorizar ── */}
                {esAreaMemoria && isMemorizing && (
                  <div className="memoria-banner">
                    <svg className="memoria-timer-ring" width="56" height="56" viewBox="0 0 40 40" style={{ flexShrink:0 }}>
                      <circle className="track" cx="20" cy="20" r="18"/>
                      <circle
                        className="fill"
                        cx="20" cy="20" r="18"
                        stroke={memoriaColor}
                        strokeDashoffset={memoriaDashOffset}
                      />
                      <text
                        x="20" y="20"
                        textAnchor="middle"
                        dominantBaseline="central"
                        style={{ fontSize:"11px", fontWeight:"800", fill: memoriaColor, fontFamily:"Poppins,sans-serif" }}
                      >
                        {memoriaCountdown}
                      </text>
                    </svg>
                    <div className="memoria-banner-text">
                      <h3>🧠 ¡Memoriza este reto! Tienes {memoriaCountdown}s</h3>
                      <p>{retos[retoIdx]?.problem}</p>
                    </div>
                  </div>
                )}

                {/* ── Área de Memoria: fase responder ── */}
                {esAreaMemoria && !isMemorizing && (
                  <div className="responder-hint">
                    🧠 El enunciado fue ocultado. ¿Recuerdas la respuesta?
                  </div>
                )}

                {/* ── Reto normal (no memoria) ── */}
                {!esAreaMemoria && (
                  <div className="reto-card-game">
                    <p className="reto-num">Reto {retoIdx + 1} de {retos.length}</p>
                    <p className="reto-preg">{retos[retoIdx]?.problem}</p>
                  </div>
                )}

                {/* ── Número de reto para memoria (fase responder) ── */}
                {esAreaMemoria && !isMemorizing && (
                  <div className="reto-card-game" style={{ marginBottom:"16px" }}>
                    <p className="reto-num">Reto {retoIdx + 1} de {retos.length}</p>
                    <p className="reto-preg" style={{ color:"#94a3b8", fontSize:"1rem" }}>
                      Escribe lo que recuerdas...
                    </p>
                  </div>
                )}

                <div className="respuesta-wrap">
                  <input
                    className={`game-input${feedbackOk === true ? " ok" : feedbackOk === false ? " fail" : ""}`}
                    type="text"
                    value={respuesta}
                    onChange={e => setRespuesta(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleVerificar()}
                    placeholder={isMemorizing ? "Espera... memoriza el enunciado" : "Tu respuesta..."}
                    autoFocus={!isMemorizing}
                    disabled={isMemorizing}
                  />
                  <button
                    className="btn-primary"
                    onClick={handleVerificar}
                    disabled={!respuesta.trim() || isMemorizing}
                  >
                    {isMemorizing ? "⏳" : "✓"}
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign:"center", padding:"40px" }}>
                <p style={{ fontSize:"1.5rem", marginBottom:"8px" }}>✅ ¡Terminaste!</p>
                <p style={{ color:"#94a3b8" }}>Puntaje: {puntaje}/{MAX_RETOS}</p>
                <p style={{ color:"#94a3b8", marginTop:"8px" }}>Esperando al rival...</p>
              </div>
            )}
          </div>
        )}

        {/* ══ PANTALLA RESULTADO ══ */}
        {pantalla === "resultado" && resultado && (
          <div className="result-wrap">
            <h1>🏆 Resultado Final</h1>
            <p>Tiempo total: {formatTiempo(tiempoTotal)}</p>

            <div className="podio">
              {resultado.map((j, i) => (
                <div className={`podio-card${i === 0 ? " primero" : ""}`} key={j.id}>
                  <span className="medalla">{i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}</span>
                  <div>
                    <p className="podio-nombre">
                      {j.usuarios?.nombre || "Jugador"}
                      {j.usuario_id === user?.id && " (tú)"}
                      {i === 0 && " 🎉"}
                    </p>
                    <p className="podio-puntaje">{j.puntaje}/{MAX_RETOS} correctos</p>
                  </div>
                  <span className="podio-tiempo">{i === 0 ? "¡Ganador!" : ""}</span>
                </div>
              ))}
            </div>

            <div style={{ display:"flex", gap:"12px", justifyContent:"center" }}>
              <button className="btn-primary" onClick={handleSalir}>
                Volver al inicio
              </button>
            </div>
          </div>
        )}

      </div>
    </>
  );
}