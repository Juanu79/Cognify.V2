import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Areas() {
  const areas = [
    { id: 1, name: "Matemáticas", color: "#ff6b6b" },
    { id: 2, name: "Lógica", color: "#4ecdc4" },
    { id: 3, name: "Cultura General", color: "#45b7d1" },
    { id: 4, name: "Programación", color: "#9b59b6" },
    { id: 5, name: "Memoria", color: "#f39c12" },
    { id: 6, name: "Concentración", color: "#2ecc71" }
  ];

  return (
    <>
      <Navbar />

      <div style={containerStyle}>
        <h1 style={titleStyle}>Áreas de Conocimiento</h1>
        <p style={subtitleStyle}>
          Selecciona un área para comenzar a resolver retos
        </p>

        <div style={gridStyle}>
          {areas.map((area) => (
            <Link
              key={area.id}
              to={`/retos/${encodeURIComponent(area.name)}`}
              style={{
                ...cardStyle,
                backgroundColor: area.color
              }}
            >
              <h3 style={cardTitle}>{area.name}</h3>
              <p>15 retos disponibles</p>
            </Link>
          ))}
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

const titleStyle = {
  fontSize: "2.5rem",
  marginBottom: "10px",
  color: "#2d3436"
};

const subtitleStyle = {
  marginBottom: "40px",
  color: "#636e72",
  fontSize: "1.1rem"
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "25px"
};

const cardStyle = {
  textDecoration: "none",
  color: "white",
  padding: "30px",
  borderRadius: "15px",
  transition: "0.3s",
  boxShadow: "0 5px 15px rgba(0,0,0,0.2)"
};

const cardTitle = {
  fontSize: "1.5rem",
  marginBottom: "10px"
};