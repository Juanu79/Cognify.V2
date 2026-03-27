import React from "react";
import { Link } from "react-router-dom";

const areas = [
  { id: "matematicas", nombre: "Matemáticas" },
  { id: "logica", nombre: "Lógica" },
  { id: "programacion", nombre: "Programación" },
  { id: "memoria", nombre: "Memoria" }
];

export default function Retos() {
  return (
    <div style={{ padding: "50px 20px", maxWidth: "1100px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "32px", fontWeight: "900", marginBottom: "45px", textAlign: "center", color: "#0f172a" }}>Áreas de Entrenamiento</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "30px" }}>
        {areas.map(a => (
          <Link to={`/retos/${a.id}`} key={a.id} style={{ textDecoration: "none" }}>
            <div style={{ 
              background: "#fff", padding: "45px", borderRadius: "28px", textAlign: "center", 
              border: "1px solid #f1f5f9", boxShadow: "0 10px 15px rgba(0,0,0,0.03)",
              transition: "transform 0.2s"
            }}>
              <div style={{ fontSize: "45px", marginBottom: "20px" }}>🧠</div>
              <div style={{ fontWeight: "800", color: "#334155", fontSize: "20px" }}>{a.nombre}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
