import { supabase } from "../lib/supabaseClient";

// ── Crear sala ────────────────────────────────────────
export const crearSala = async (userId, areaNombre, maxRetos = 5) => {
  const codigo = Math.random().toString(36).substring(2, 7).toUpperCase();

  let areaId = null;
  if (areaNombre && areaNombre !== "aleatorio") {
    const { data: area } = await supabase
      .from("areas")
      .select("id")
      .eq("nombre", areaNombre)
      .single();
    areaId = area?.id || null;
  }

  const { data, error } = await supabase
    .from("salas")
    .insert([{
      codigo,
      creador_id:    userId,
      max_jugadores: 2,
      max_retos:     maxRetos,
      estado:        "esperando",
      area_id:       areaId,
    }])
    .select()
    .single();

  if (error) return { data: null, error };

  await supabase.from("jugadores_sala").insert([{
    sala_id:    data.id,
    usuario_id: userId,
    listo:      false,
    puntaje:    0,
    terminado:  false,
  }]);

  return { data, error: null };
};

// ── Unirse a sala ─────────────────────────────────────
export const unirseSala = async (codigo, userId) => {
  const { data: sala, error: salaError } = await supabase
    .from("salas")
    .select("*")
    .eq("codigo", codigo.toUpperCase().trim())
    .single();

  if (salaError || !sala) return { sala: null, error: "Sala no encontrada. Verifica el código." };
  if (sala.estado === "jugando")   return { sala: null, error: "La sala ya está en juego." };
  if (sala.estado === "terminada") return { sala: null, error: "La sala ya terminó." };

  const { data: yaEsta } = await supabase
    .from("jugadores_sala")
    .select("id")
    .eq("sala_id", sala.id)
    .eq("usuario_id", userId)
    .single();

  if (yaEsta) return { sala, error: null };

  const { count } = await supabase
    .from("jugadores_sala")
    .select("*", { count: "exact", head: true })
    .eq("sala_id", sala.id);

  if (count >= sala.max_jugadores) return { sala: null, error: "La sala está llena." };

  const { error } = await supabase
    .from("jugadores_sala")
    .insert([{ sala_id: sala.id, usuario_id: userId, listo: false, puntaje: 0, terminado: false }]);

  if (error) return { sala: null, error: error.message };
  return { sala, error: null };
};

// ── Obtener jugadores ─────────────────────────────────
export const obtenerJugadores = async (salaId) => {
  const { data, error } = await supabase
    .from("jugadores_sala")
    .select(`
      id, listo, puntaje, terminado, usuario_id,
      usuarios ( nombre, email, xp, nivel )
    `)
    .eq("sala_id", salaId)
    .order("created_at");

  return { data: data || [], error };
};

// ── Obtener sala completa ─────────────────────────────
export const obtenerSala = async (salaId) => {
  const { data, error } = await supabase
    .from("salas")
    .select(`*, areas ( nombre )`)
    .eq("id", salaId)
    .single();
  return { data, error };
};

// ── Marcar jugador listo ──────────────────────────────
export const marcarListo = async (salaId, userId) => {
  const { error } = await supabase
    .from("jugadores_sala")
    .update({ listo: true })
    .eq("sala_id", salaId)
    .eq("usuario_id", userId);
  return { error };
};

// ── Iniciar partida ───────────────────────────────────
export const iniciarPartida = async (salaId) => {
  const { error } = await supabase
    .from("salas")
    .update({ estado: "jugando" })
    .eq("id", salaId);
  return { error };
};

// ── Actualizar puntaje ────────────────────────────────
export const actualizarPuntaje = async (salaId, userId, nuevoPuntaje) => {
  const { error } = await supabase
    .from("jugadores_sala")
    .update({ puntaje: nuevoPuntaje })
    .eq("sala_id", salaId)
    .eq("usuario_id", userId);
  return { error };
};

// ── Marcar jugador terminado ──────────────────────────
export const marcarTerminado = async (salaId, userId, puntajeFinal) => {
  const { error } = await supabase
    .from("jugadores_sala")
    .update({ terminado: true, puntaje: puntajeFinal })
    .eq("sala_id", salaId)
    .eq("usuario_id", userId);
  return { error };
};

// ── Terminar partida ──────────────────────────────────
export const terminarPartida = async (salaId) => {
  const { data: jugadores } = await supabase
    .from("jugadores_sala")
    .select("usuario_id, puntaje")
    .eq("sala_id", salaId)
    .order("puntaje", { ascending: false });

  if (!jugadores || jugadores.length === 0) return;

  const ganadorId = jugadores[0].puntaje >= (jugadores[1]?.puntaje ?? -1)
    ? jugadores[0].usuario_id
    : jugadores[1].usuario_id;

  await supabase
    .from("salas")
    .update({ estado: "terminada", ganador_id: ganadorId })
    .eq("id", salaId);

  if (jugadores.length >= 2) {
    await supabase.from("retos_online").insert([{
      usuario1_id: jugadores[0].usuario_id,
      usuario2_id: jugadores[1].usuario_id,
      ganador:     ganadorId,
    }]);
  }

  return { ganadorId };
};

// ── Obtener retos del banco online ────────────────────
export const obtenerRetosOnline = async (areaNombre, cantidad = 5) => {
  if (!areaNombre || areaNombre === "aleatorio") {
    const { data, error } = await supabase
      .from("retos_online_bank")
      .select("id, titulo, problem, answer, xp_reward, dificultad")
      .limit(cantidad * 4);

    if (error) return { data: [], error };

    const mezclados = (data || [])
      .sort(() => Math.random() - 0.5)
      .slice(0, cantidad);

    return { data: mezclados, error: null };
  }

  const { data: area } = await supabase
    .from("areas")
    .select("id")
    .eq("nombre", areaNombre)
    .single();

  if (!area) return { data: [], error: "Área no encontrada" };

  const { data, error } = await supabase
    .from("retos_online_bank")
    .select("id, titulo, problem, answer, xp_reward, dificultad")
    .eq("area_id", area.id)
    .limit(cantidad * 3);

  const mezclados = (data || [])
    .sort(() => Math.random() - 0.5)
    .slice(0, cantidad);

  return { data: mezclados, error };
};

// ── Realtime: suscribir jugadores ─────────────────────
export const suscribirJugadores = (salaId, callback) => {
  return supabase
    .channel(`sala-jug-${salaId}`)
    .on("postgres_changes", {
      event:  "*",
      schema: "public",
      table:  "jugadores_sala",
      filter: `sala_id=eq.${salaId}`,
    }, callback)
    .subscribe();
};

// ── Realtime: suscribir sala ──────────────────────────
export const suscribirSala = (salaId, callback) => {
  return supabase
    .channel(`sala-estado-${salaId}`)
    .on("postgres_changes", {
      event:  "UPDATE",
      schema: "public",
      table:  "salas",
      filter: `id=eq.${salaId}`,
    }, callback)
    .subscribe();
};

// ── Salir de sala ─────────────────────────────────────
export const salirSala = async (salaId, userId) => {
  const { error } = await supabase
    .from("jugadores_sala")
    .delete()
    .eq("sala_id", salaId)
    .eq("usuario_id", userId);
  return { error };
};