import { createClient } from "@supabase/supabase-js";

// Variables de entorno desde Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validaciones para evitar errores silenciosos
if (!supabaseUrl) {
  console.error("❌ Error: VITE_SUPABASE_URL no está definida en el archivo .env");
}

if (!supabaseAnonKey) {
  console.error("❌ Error: VITE_SUPABASE_ANON_KEY no está definida en el archivo .env");
}

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "❌ Faltan variables de entorno de Supabase. Verifica que el archivo .env esté en la raíz del proyecto y reinicia el servidor."
  );
}

// Crear cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Mensaje opcional para confirmar conexión
console.log("✅ Supabase conectado correctamente");