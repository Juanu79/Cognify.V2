import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/global.css";

export default function Register() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="form-container">
      <div className="form-box">
        <h2 style={{ marginBottom: "20px", textAlign: "center" }}>Registro</h2>

        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Nombre" required />
          <input type="email" placeholder="Correo" required />
          <input type="password" placeholder="Contraseña" required />
          <button type="submit">Crear cuenta</button>
        </form>

        <p style={{ marginTop: "15px", textAlign: "center" }}>
          ¿Ya tienes cuenta? <Link to="/">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}