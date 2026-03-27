import React from "react";

export default function Dashboard() {
  const card = { background: "#fff", padding: "35px", borderRadius: "24px", border: "1px solid #f1f5f9", boxShadow: "0 10px 20px rgba(0,0,0,0.02)" };
  return (
    <div style={{ padding: "50px 20px", maxWidth: "950px", margin: "0 auto" }}>
      <header style={{ marginBottom: "40px" }}>
        <h1 style={{ fontSize: "36px", fontWeight: "900", color: "#0f172a", margin: 0 }}>Bienvenida, María</h1>
        <p style={{ color: "#94a3b8", fontSize: "16px", marginTop: "10px" }}>Gestión de progreso y rendimiento cognitivo</p>
      </header>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px", marginBottom: "40px" }}>
        <div style={card}>
          <span style={{ color: "#94a3b8", fontSize: "12px", fontWeight: "800", textTransform: "uppercase" }}>Racha de Actividad</span>
          <p style={{ fontSize: "38px", fontWeight: "900", color: "#1e293b", margin: "15px 0" }}>0 Días 🔥</p>
        </div>
        <div style={card}>
          <span style={{ color: "#94a3b8", fontSize: "12px", fontWeight: "800", textTransform: "uppercase" }}>Nivel de Usuario</span>
          <p style={{ fontSize: "38px", fontWeight: "900", color: "#7c3aed", margin: "15px 0" }}>Nivel 1</p>
        </div>
      </div>
      <button style={{ 
        width: "100%", background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)", 
        color: "#fff", border: "none", padding: "22px", borderRadius: "20px", 
        fontWeight: "700", fontSize: "18px", cursor: "pointer", 
        boxShadow: "0 15px 30px rgba(124, 58, 237, 0.3)" 
      }}>Continuar Sesión de Entrenamiento →</button>
    </div>
  );
}
