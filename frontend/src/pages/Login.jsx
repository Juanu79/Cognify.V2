import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import "../styles/global.css";

export default function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      console.log("Usuario logueado:", data);

      navigate("/dashboard");

    } catch (err) {

      console.error(err);
      setError("Credenciales incorrectas o usuario no verificado.");

    } finally {
      setLoading(false);
    }
  };

  /* LOGIN GOOGLE */

  const loginGoogle = async () => {

    await supabase.auth.signInWithOAuth({
      provider: "google"
    });

  };

  /* LOGIN GITHUB */

  const loginGithub = async () => {

    await supabase.auth.signInWithOAuth({
      provider: "github"
    });

  };

  return (

    <div className="form-container">

      <div className="form-box">

        <h1 style={logoText}>Cognify</h1>

        <h2 style={formTitle}>Iniciar Sesión</h2>

        {error && (
          <div style={errorStyle}>
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={formStyle}>

          <div style={inputGroup}>
            <label style={labelStyle}>Correo electrónico</label>

            <input
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <div style={inputGroup}>
            <label style={labelStyle}>Contraseña</label>

            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              required
              style={inputStyle}
            />

            <Link to="/forgot-password" style={forgotLink}>
              ¿Olvidaste tu contraseña?
            </Link>

          </div>

          <button
            type="submit"
            style={buttonStyle}
            disabled={loading}
          >
            {loading ? "Iniciando sesión..." : "Entrar"}
          </button>

        </form>

        {/* DIVIDER */}

        <p style={divider}>O continuar con</p>

        {/* LOGIN SOCIAL */}

        <div style={socialContainer}>

          <button
            style={socialButton}
            onClick={loginGoogle}
          >
            Google
          </button>

          <button
            style={socialButton}
            onClick={loginGithub}
          >
            GitHub
          </button>

        </div>

        <p style={footerText}>
          ¿No tienes cuenta?
          <Link to="/register" style={linkStyle}>
            {" "}Regístrate
          </Link>
        </p>

      </div>

    </div>

  );
}

/* ESTILOS */

const logoText = {
  fontSize: "2.5rem",
  fontWeight: "800",
  textAlign: "center",
  marginBottom: "10px",
  color: "#9333ea"
};

const formTitle = {
  fontSize: "1.8rem",
  textAlign: "center",
  marginBottom: "30px",
  color: "#111"
};

const errorStyle = {
  background: "#ffe5e5",
  color: "#b91c1c",
  padding: "10px",
  borderRadius: "8px",
  marginBottom: "20px"
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "20px"
};

const inputGroup = {
  display: "flex",
  flexDirection: "column",
  gap: "8px"
};

const labelStyle = {
  fontWeight: "600"
};

const inputStyle = {
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #ccc"
};

const forgotLink = {
  fontSize: "0.8rem",
  marginTop: "5px",
  color: "#7c3aed",
  textDecoration: "none",
  alignSelf: "flex-end"
};

const buttonStyle = {
  padding: "14px",
  borderRadius: "12px",
  border: "none",
  background: "linear-gradient(135deg,#9333ea,#6d28d9)",
  color: "white",
  fontWeight: "700",
  cursor: "pointer"
};

const divider = {
  textAlign: "center",
  margin: "20px 0",
  fontSize: "0.9rem",
  color: "#666"
};

const socialContainer = {
  display: "flex",
  gap: "10px"
};

const socialButton = {
  flex: 1,
  padding: "10px",
  borderRadius: "10px",
  border: "1px solid #ccc",
  background: "white",
  cursor: "pointer"
};

const footerText = {
  marginTop: "25px",
  textAlign: "center"
};

const linkStyle = {
  color: "#7c3aed",
  fontWeight: "600",
  textDecoration: "none"
};