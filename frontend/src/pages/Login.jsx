import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import "../styles/global.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔥 Login REAL con Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Error: " + error.message);
      return;
    }

    console.log("Usuario logueado:", data);

    // ✅ solo entra si Supabase valida usuario
    navigate("/dashboard");
  };

  return (
    <div className="form-container">
      <div className="form-box">
        <h2 style={{ marginBottom: "20px", textAlign: "center" }}>
          Iniciar Sesión
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Correo"
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Entrar</button>
        </form>

        <p style={{ marginTop: "15px", textAlign: "center" }}>
          ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
        </p>
      </div>
    </div>
  );
}