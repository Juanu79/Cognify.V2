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
      // Login REAL con Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      console.log("Usuario logueado:", data);
      
      // Solo entra si Supabase valida usuario
      navigate("/dashboard");
      
    } catch (err) {
      console.error("Error de autenticación:", err);
      setError(err.message || "Error al iniciar sesión. Verifica tus credenciales.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-box">
        <div style={logoStyle}>
          <h1 style={logoText}>Cognify</h1>
        </div>

        <h2 style={formTitle}>Iniciar Sesión</h2>
        
        {error && (
          <div style={errorStyle}>
            <span style={errorIcon}>⚠</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={inputGroup}>
            <label htmlFor="email" style={labelStyle}>Correo electrónico</label>
            <input
              id="email"
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <div style={inputGroup}>
            <label htmlFor="password" style={labelStyle}>Contraseña</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

        <p style={footerText}>
          ¿No tienes cuenta? <Link to="/register" style={linkStyle}>Regístrate</Link>
        </p>
      </div>
    </div>
  );
}

/* ====== ESTILOS PROFESIONALES ====== */

const logoStyle = {
  textAlign: 'center',
  marginBottom: '25px'
};

const logoText = {
  fontSize: '2.2rem',
  fontWeight: '800',
  color: '#2d3436',
  margin: '0'
};

const formTitle = {
  fontSize: '2.1rem',
  marginBottom: '30px',
  color: '#2d3436',
  textAlign: 'center',
  fontWeight: '700'
};

const errorStyle = {
  background: '#ffedee',
  borderLeft: '4px solid #e74c3c',
  color: '#c0392b',
  padding: '12px 15px',
  borderRadius: '0 8px 8px 0',
  marginBottom: '25px',
  fontSize: '0.95rem',
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
};

const errorIcon = {
  fontSize: '1.3rem'
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px'
};

const inputGroup = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px'
};

const labelStyle = {
  fontSize: '0.95rem',
  fontWeight: '600',
  color: '#2d3436'
};

const inputStyle = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: '12px',
  border: '2px solid #e2e8f0',
  backgroundColor: '#f8fafc',
  fontSize: '1rem',
  transition: 'all 0.3s',
  outline: 'none'
};

const forgotLink = {
  fontSize: '0.85rem',
  color: '#4f46e5',
  textDecoration: 'none',
  marginTop: '6px',
  alignSelf: 'flex-end',
  transition: 'opacity 0.3s'
};

const buttonStyle = {
  width: '100%',
  padding: '16px',
  borderRadius: '14px',
  border: 'none',
  background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
  color: 'white',
  fontWeight: '700',
  fontSize: '1.05rem',
  cursor: 'pointer',
  transition: 'all 0.3s',
  boxShadow: '0 4px 15px rgba(79, 70, 229, 0.3)'
};

const footerText = {
  marginTop: '25px',
  textAlign: 'center',
  fontSize: '0.95rem',
  color: '#636e72'
};

const linkStyle = {
  color: '#4f46e5',
  fontWeight: '600',
  textDecoration: 'none',
  transition: 'color 0.3s'
};