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
          <div style={streakStyle}>
            <span style={streakText}>Racha actual: 5 días consecutivos</span>
          </div>
        </div>

        {/* Estadísticas */}
        <div style={statsGrid}>
          {stats.map((stat) => (
            <div 
              key={stat.id} 
              style={{
                ...statCard,
                borderLeft: `4px solid ${stat.color || '#4f46e5'}`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <h3 style={statTitle}>{stat.title}</h3>
              <p style={statValue}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Accesos rápidos */}
        <div style={{ marginTop: "60px" }}>
          <h2 style={sectionTitle}>Accesos Rápidos</h2>

          <div style={quickGrid}>
            <Link 
              to="/areas" 
              style={{
                ...quickCard,
                background: "linear-gradient(135deg, #4f46e5, #7c3aed)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 15px 30px rgba(79, 70, 229, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = quickCard.boxShadow;
              }}
            >
              <h3>Explorar Áreas</h3>
              <p>Accede a todos los retos disponibles</p>
            </Link>

            <Link 
              to="/progreso" 
              style={{
                ...quickCard,
                background: "linear-gradient(135deg, #55efc4, #00cec9)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 15px 30px rgba(85, 239, 196, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = quickCard.boxShadow;
              }}
            >
              <h3>Mi Progreso</h3>
              <p>Revisa tu avance y estadísticas</p>
            </Link>

            <Link 
              to="/" 
              style={{
                ...quickCard,
                background: "linear-gradient(135deg, #ff7675, #e17055)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 15px 30px rgba(255, 118, 117, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = quickCard.boxShadow;
              }}
            >
              <h3>Cerrar Sesión</h3>
              <p>Salir de la plataforma</p>
            </Link>
          </div>
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
  marginBottom: "60px"
};

const titleStyle = {
  fontSize: "3.2rem",
  marginBottom: "15px",
  color: "#2d3436",
  fontWeight: "800",
  lineHeight: "1.2"
};

const subtitleStyle = {
  color: "#636e72",
  fontSize: "1.3rem",
  maxWidth: "700px",
  margin: "0 auto 25px"
};

const streakStyle = {
  background: "linear-gradient(135deg, #ff9ff3, #ee5a6f)",
  color: "white",
  padding: "12px 25px",
  borderRadius: "50px",
  display: "inline-flex",
  alignItems: "center",
  gap: "10px",
  fontWeight: "600",
  fontSize: "1.05rem",
  boxShadow: "0 5px 15px rgba(238, 90, 111, 0.4)",
  margin: "20px auto 0"
};

const streakText = {
  display: "inline-block"
};

const statsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "28px",
  marginBottom: "50px"
};

const statCard = {
  backgroundColor: "#ffffff",
  padding: "32px 25px",
  borderRadius: "20px",
  boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
  textAlign: "center",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  position: "relative",
  overflow: "hidden"
};

const statTitle = {
  fontSize: "1.1rem",
  color: "#636e72",
  marginBottom: "12px",
  fontWeight: "600"
};

const statValue = {
  fontSize: "2.2rem",
  fontWeight: "800",
  color: "#2d3436",
  marginTop: "5px"
};

const sectionTitle = {
  fontSize: "2.1rem",
  marginBottom: "35px",
  color: "#2d3436",
  textAlign: "center",
  fontWeight: "700"
};

const quickGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "30px"
};

const quickCard = {
  textDecoration: "none",
  color: "white",
  padding: "35px 30px",
  borderRadius: "20px",
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center"
};