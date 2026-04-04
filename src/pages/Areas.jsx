import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Areas() {
  const areas = [
    { id: 1, name: "Matemáticas", color: "#ff6b6b" },
    { id: 2, name: "Lógica", color: "#4ecdc4" },
    { id: 3, name: "Programación", color: "#9b59b6" },
    { id: 4, name: "Memoria", color: "#f39c12" }
  ];

  return (
    <>
      <Navbar />

      <div style={containerStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>Áreas de Conocimiento</h1>
          <p style={subtitleStyle}>
            Selecciona un área para comenzar a resolver retos y ganar puntos
          </p>
        </div>

        <div style={gridStyle}>
          {areas.map((area) => (
            <Link
              key={area.id}
              to={`/retos/${encodeURIComponent(area.name)}`}
              style={{
                ...cardStyle,
                backgroundColor: area.color
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = cardStyle.boxShadow;
              }}
            >
              <h3 style={cardTitle}>{area.name}</h3>
              <p style={cardSubtitle}>15 retos disponibles</p>
              <div style={badgeStyle}>+250 pts</div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

/* ====== ESTILOS PROFESIONALES ====== */

const containerStyle = {
  maxWidth: "1200px",
  margin: "100px auto 60px",
  padding: "0 20px"
};

const headerStyle = {
  textAlign: "center",
  marginBottom: "50px"
};

const titleStyle = {
  fontSize: "2.8rem",
  marginBottom: "15px",
  color: "#2d3436",
  fontWeight: "800",
  lineHeight: "1.2"
};

const subtitleStyle = {
  marginBottom: "10px",
  color: "#636e72",
  fontSize: "1.2rem",
  maxWidth: "600px",
  margin: "0 auto"
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "30px"
};

const cardStyle = {
  textDecoration: "none",
  color: "white",
  padding: "35px 30px",
  borderRadius: "20px",
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
  position: "relative",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center"
};

const cardTitle = {
  fontSize: "1.8rem",
  marginBottom: "12px",
  fontWeight: "700"
};

const cardSubtitle = {
  fontSize: "1.1rem",
  opacity: "0.9",
  marginBottom: "20px",
  fontWeight: "500"
};

const badgeStyle = {
  background: "rgba(255,255,255,0.2)",
  backdropFilter: "blur(10px)",
  padding: "6px 18px",
  borderRadius: "30px",
  fontSize: "0.95rem",
  fontWeight: "700",
  letterSpacing: "0.5px"
};