import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const stats = [
    { id: 1, title: "Retos Completados", value: 24 },
    { id: 2, title: "Puntos Totales", value: 850 },
    { id: 3, title: "Nivel Actual", value: "Intermedio" },
    { id: 4, title: "Áreas Activas", value: 6 }
  ];

  return (
    <>
      <Navbar />

      <div style={containerStyle}>
        {/* Encabezado */}
        <div style={headerStyle}>
          <h1 style={titleStyle}>Panel de Control</h1>
          <p style={subtitleStyle}>
            Bienvenido a tu plataforma de retos académicos
          </p>
        </div>

        {/* Estadísticas */}
        <div style={statsGrid}>
          {stats.map((stat) => (
            <div key={stat.id} style={statCard}>
              <h3 style={statTitle}>{stat.title}</h3>
              <p style={statValue}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Accesos rápidos */}
        <div style={{ marginTop: "60px" }}>
          <h2 style={{ marginBottom: "25px" }}>Accesos Rápidos</h2>

          <div style={quickGrid}>
            <Link to="/areas" style={quickCard}>
              <h3>Explorar Áreas</h3>
              <p>Accede a todos los retos disponibles</p>
            </Link>

            <Link to="/progreso" style={quickCard}>
              <h3>Mi Progreso</h3>
              <p>Revisa tu avance y estadísticas</p>
            </Link>

            <Link to="/" style={quickCard}>
              <h3>Cerrar Sesión</h3>
              <p>Salir de la plataforma</p>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

/* ====== ESTILOS ====== */

const containerStyle = {
  maxWidth: "1200px",
  margin: "80px auto",
  padding: "20px"
};

const headerStyle = {
  marginBottom: "40px"
};

const titleStyle = {
  fontSize: "2.5rem",
  marginBottom: "10px",
  color: "#2d3436"
};

const subtitleStyle = {
  color: "#636e72",
  fontSize: "1.1rem"
};

const statsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "25px"
};

const statCard = {
  backgroundColor: "#ffffff",
  padding: "30px",
  borderRadius: "15px",
  boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
  textAlign: "center"
};

const statTitle = {
  fontSize: "1rem",
  color: "#636e72",
  marginBottom: "10px"
};

const statValue = {
  fontSize: "2rem",
  fontWeight: "bold",
  color: "#4f46e5"
};

const quickGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "25px"
};

const quickCard = {
  textDecoration: "none",
  backgroundColor: "#4f46e5",
  color: "white",
  padding: "25px",
  borderRadius: "15px",
  transition: "0.3s",
  boxShadow: "0 5px 15px rgba(0,0,0,0.2)"
};