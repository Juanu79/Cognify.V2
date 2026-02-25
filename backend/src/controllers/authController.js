import { supabase } from "../config/supabase.js";

export const registerUser = async (req, res) => {
  const { nombre, email, password } = req.body;

  try {
    // 1️⃣ Crear usuario en Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nombre }
      }
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const user = data.user;

    // ⚠️ si el signup falla silenciosamente
    if (!user) {
      return res.status(400).json({
        error: "No se pudo crear el usuario"
      });
    }

    // 2️⃣ Guardar perfil en tabla usuarios
    const { error: dbError } = await supabase
      .from("usuarios")
      .insert([
        {
          id: user.id, // 🔥 conexión con auth.users
          nombre,
          email
        }
      ]);

    if (dbError) {
      return res.status(400).json({
        error: dbError.message
      });
    }

    res.json({
      message: "Usuario creado ✅ Verifica tu correo."
    });

  } catch (err) {
    res.status(500).json({
      error: "Error interno del servidor"
    });
  }
};