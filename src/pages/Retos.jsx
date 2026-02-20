import React from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Retos() {
  const { area } = useParams();

  const decodedArea = area ? decodeURIComponent(area) : null;

  if (!decodedArea) {
    return (
      <>
        <Navbar />
        <div style={containerStyle}>
          <h1>Área no encontrada</h1>
          <Link to="/areas" style={backButton}>
            Volver a Áreas
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div style={containerStyle}>
        <Link to="/areas" style={backButton}>
          ← Volver a Áreas
        </Link>

        <h1 style={titleStyle}>Retos de {decodedArea}</h1>

        <div style={gridStyle}>
          <div style={cardStyle}>
            <h3>Reto 1</h3>
            <p>Dificultad: Fácil</p>
            <button style={buttonStyle}>Iniciar</button>
          </div>

          <div style={cardStyle}>
            <h3>Reto 2</h3>
            <p>Dificultad: Media</p>
            <button style={buttonStyle}>Iniciar</button>
          </div>

          <div style={cardStyle}>
            <h3>Reto 3</h3>
            <p>Dificultad: Difícil</p>
            <button style={buttonStyle}>Iniciar</button>
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

const titleStyle = {
  fontSize: "2.3rem",
  marginBottom: "30px",
  color: "#2d3436"
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "25px"
};

const cardStyle = {
  backgroundColor: "#ffffff",
  padding: "25px",
  borderRadius: "15px",
  boxShadow: "0 5px 15px rgba(0,0,0,0.1)"
};

const buttonStyle = {
  marginTop: "10px",
  padding: "8px 15px",
  border: "none",
  borderRadius: "8px",
  backgroundColor: "#4f46e5",
  color: "white",
  cursor: "pointer"
};

const backButton = {
  display: "inline-block",
  marginBottom: "20px",
  textDecoration: "none",
  color: "#4f46e5",
  fontWeight: "600"
};