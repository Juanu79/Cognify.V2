import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/global.css";

export default function Register() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error);
        return;
      }

      alert("Cuenta creada ✅ Revisa tu correo para confirmar.");
      navigate("/");

    } catch (error) {
      console.error(error);
      alert("Error conectando con el servidor");
    }
  };

  return (
    <div className="form-container">
      <div className="form-box">
        <h2 style={{ marginBottom: "20px", textAlign: "center" }}>
          Registro
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="nombre"
            placeholder="Nombre"
            required
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Correo"
            required
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            required
            onChange={handleChange}
          />

          <button type="submit">Crear cuenta</button>
        </form>

        <p style={{ marginTop: "15px", textAlign: "center" }}>
          ¿Ya tienes cuenta? <Link to="/">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}