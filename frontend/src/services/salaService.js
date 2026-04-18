import { supabase } from "../lib/supabaseClient";

// ── Crear sala nueva ──────────────────────────────────
export const crearSala = async (userId, areaNombre) => {
  const codigo = Math.random().toString(36).substring(2, 7).toUpperCase();

  // Obtener area_id si se pasó nombre
  let areaId = null;
  if (areaNombre) {
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
      estado:        "esperando",
      area_id:       areaId,
    }])
    .select()
    .single();

  if (error) return { data: null, error };

  // Unir al creador como primer jugador
  await supabase.from("jugadores_sala").insert([{
    sala_id:    data.id,
    usuario_id: userId,
    listo:      false,
    puntaje:    0,
  }]);

  return { data, error: null };
};

// ── Unirse a sala por código ──────────────────────────
export const unirseSala = async (codigo, userId) => {
  const { data: sala, error: salaError } = await supabase
    .from("salas")
    .select("*")
    .eq("codigo", codigo.toUpperCase().trim())
    .single();

  if (salaError || !sala) return { sala: null, error: "Sala no encontrada. Verifica el código." };
  if (sala.estado === "jugando")   return { sala: null, error: "La sala ya está en juego." };
  if (sala.estado === "terminada") return { sala: null, error: "La sala ya terminó." };

  // Verificar si ya está en la sala
  const { data: yaEsta } = await supabase
    .from("jugadores_sala")
    .select("id")
    .eq("sala_id", sala.id)
    .eq("usuario_id", userId)
    .single();

  if (yaEsta) return { sala, error: null }; // ya estaba, no duplicar

  // Verificar cuántos jugadores hay
  const { count } = await supabase
    .from("jugadores_sala")
    .select("*", { count: "exact", head: true })
    .eq("sala_id", sala.id);

  if (count >= sala.max_jugadores) return { sala: null, error: "La sala está llena." };

  const { error } = await supabase
    .from("jugadores_sala")
    .insert([{ sala_id: sala.id, usuario_id: userId, listo: false, puntaje: 0 }]);

  if (error) return { sala: null, error: error.message };
  return { sala, error: null };
};

// ── Obtener jugadores de una sala ─────────────────────
export const obtenerJugadores = async (salaId) => {
  const { data, error } = await supabase
    .from("jugadores_sala")
    .select(`
      id, listo, puntaje, terminado,
      usuario_id,
      usuarios ( nombre, email, xp, nivel )
    `)
    .eq("sala_id", salaId)
    .order("created_at");

  return { data: data || [], error };
};

// ── Obtener sala por id ───────────────────────────────
export const obtenerSala = async (salaId) => {
  const { data, error } = await supabase
    .from("salas")
    .select(`*, areas ( nombre )`)
    .eq("id", salaId)
    .single();
  return { data, error };
};

// ── Marcar jugador como listo ─────────────────────────
export const marcarListo = async (salaId, userId) => {
  const { error } = await supabase
    .from("jugadores_sala")
    .update({ listo: true })
    .eq("sala_id", salaId)
    .eq("usuario_id", userId);
  return { error };
};

// ── Iniciar partida (solo el creador) ─────────────────
export const iniciarPartida = async (salaId) => {
  const { error } = await supabase
    .from("salas")
    .update({ estado: "jugando" })
    .eq("id", salaId);
  return { error };
};

// ── Actualizar puntaje del jugador ────────────────────
export const actualizarPuntaje = async (salaId, userId, nuevoPuntaje) => {
  const { error } = await supabase
    .from("jugadores_sala")
    .update({ puntaje: nuevoPuntaje })
    .eq("sala_id", salaId)
    .eq("usuario_id", userId);
  return { error };
};

// ── Marcar jugador como terminado ─────────────────────
export const marcarTerminado = async (salaId, userId, puntajeFinal) => {
  const { error } = await supabase
    .from("jugadores_sala")
    .update({ terminado: true, puntaje: puntajeFinal })
    .eq("sala_id", salaId)
    .eq("usuario_id", userId);
  return { error };
};

// ── Terminar partida y guardar ganador ────────────────
export const terminarPartida = async (salaId, ganadorId) => {
  await supabase
    .from("salas")
    .update({ estado: "terminada", ganador_id: ganadorId })
    .eq("id", salaId);

  // Guardar en retos_online
  const { data: sala } = await supabase
    .from("salas")
    .select("creador_id, jugadores_sala ( usuario_id )")
    .eq("id", salaId)
    .single();

  const jugadores = sala?.jugadores_sala || [];
  if (jugadores.length >= 2) {
    const u1 = jugadores[0].usuario_id;
    const u2 = jugadores[1].usuario_id;
    await supabase.from("retos_online").insert([{
      usuario1_id: u1,
      usuario2_id: u2,
      ganador:     ganadorId,
    }]);
  }
};

// ── Obtener retos de un área para la sala ─────────────
export const obtenerRetosParaSala = async (areaNombre, cantidad = 5) => {
  const { data: area } = await supabase
    .from("areas")
    .select("id")
    .eq("nombre", areaNombre)
    .single();

  if (!area) return { data: [], error: "Área no encontrada" };

  const { data, error } = await supabase
    .from("retos")
    .select("id, titulo, problem, answer, xp_reward, dificultad")
    .eq("area_id", area.id)
    .order("xp_reward")
    .limit(cantidad);

  return { data: data || [], error };
};

// ── Suscripción Realtime a jugadores ─────────────────
export const suscribirJugadores = (salaId, callback) => {
  return supabase
    .channel(`sala-${salaId}`)
    .on("postgres_changes", {
      event:  "*",
      schema: "public",
      table:  "jugadores_sala",
      filter: `sala_id=eq.${salaId}`,
    }, callback)
    .subscribe();
};

// ── Suscripción Realtime al estado de la sala ─────────
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

// ── Salir de una sala ─────────────────────────────────
export const salirSala = async (salaId, userId) => {
  const { error } = await supabase
    .from("jugadores_sala")
    .delete()
    .eq("sala_id", salaId)
    .eq("usuario_id", userId);
  return { error };
};