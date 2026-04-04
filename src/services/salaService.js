import { supabase } from "../lib/supabaseClient";

export const crearSala = async (userId) => {

const codigo = Math.random().toString(36).substring(2,7).toUpperCase();

const { data, error } = await supabase
.from("salas")
.insert([
{
codigo: codigo,
creador_id: userId,
max_jugadores: 10,
estado: "esperando"
}
])
.select()
.single();

return { data, error };

};

export const unirseSala = async (codigo, userId) => {

const { data: sala } = await supabase
.from("salas")
.select("*")
.eq("codigo", codigo)
.single();

if(!sala) return { error: "Sala no existe" };

const { error } = await supabase
.from("jugadores_sala")
.insert([
{
sala_id: sala.id,
usuario_id: userId
}
]);

return { sala, error };

};

export const obtenerJugadores = async (salaId) => {

const { data, error } = await supabase
.from("jugadores_sala")
.select("*")
.eq("sala_id", salaId);

return { data, error };

};