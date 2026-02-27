import { createClient } from "@supabase/supabase-js";

// Leer variables desde .env (Vite)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validación clara para evitar pantalla blanca sin explicación
if (!supabaseUrl) {
  console.error("❌ VITE_SUPABASE_URL no está definida");
}

if (!supabaseAnonKey) {
  console.error("❌ VITE_SUPABASE_ANON_KEY no está definida");
}

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Faltan variables de entorno de Supabase. Verifica que el archivo .env esté en la raíz de /frontend y reinicia el servidor."
  );
}

// Crear cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);