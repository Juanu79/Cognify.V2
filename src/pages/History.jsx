import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { progressManager } from "../utils/progressManager";

export default function History() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasHistory, setHasHistory] = useState(false);
  const navigate = useNavigate();
  
  // Cargar historial
  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        setError("");
        
        // Simular carga (en un proyecto real, esto vendría de una API)
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Verificar si hay historial
        const completedChallenges = progressManager.getAllCompletedChallenges();
        setHasHistory(Object.keys(completedChallenges).length > 0);
      } catch (err) {
        console.error("Error al cargar el historial:", err);
        setError("Error al cargar el historial. Por favor, intenta nuevamente.");
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  // Obtener todos los retos completados
  const progress = progressManager.getProgress();
  const user = progressManager.getUser();
  const completedChallenges = progressManager.getAllCompletedChallenges();
  const allCompleted = Object.entries(completedChallenges).flatMap(([area, challenges]) => 
    challenges.map(challengeId => ({
      area,
      challengeId,
      ...progressManager.getAreaStats(area)
    }))
  );

  // Manejo de carga y errores
  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={loadingContainer}>
          <div style={loadingSpinner}></div>
          <p style={loadingText}>Cargando tu historial...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <div style={errorContainer}>
          <p style={errorText}>{error}</p>
          <button style={retryButton} onClick={() => window.location.reload()}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>Historial de Actividad</h1>
          <p style={subtitleStyle}>
            Revisa tu progreso y logros en el tiempo
          </p>
        </div>
        
        <div style={statsBar}>
          <div style={statItem}>
            <span style={statLabel}>Nombre</span>
            <span style={statValue}>{user.name}</span>
          </div>
          <div style={statItem}>
            <span style={statLabel}>Nivel Actual</span>
            <span style={statValue}>{progress.level}</span>
          </div>
          <div style={statItem}>
            <span style={statLabel}>Puntos Totales</span>
            <span style={statValue}>{progress.totalPoints}</span>
          </div>
          <div style={statItem}>
            <span style={statLabel}>Racha Actual</span>
            <span style={statValue}>{progress.streakDays} días</span>
          </div>
        </div>
        
        <div style={historyContainer}>
          <h2 style={sectionTitle}>Retos Completados</h2>
          
          {allCompleted.length === 0 ? (
            <div style={emptyState}>
              <div style={emptyStateIcon}>🧠</div>
              <p style={emptyStateText}>¡Aún no has completado ningún reto!</p>
              <p style={emptyStateDescription}>
                Comienza a resolver retos en las áreas de conocimiento para ver tu progreso aquí.
              </p>
              <Link to="/areas" style={emptyStateButton}>
                Empezar a resolver retos
              </Link>
            </div>
          ) : (
            <div style={historyGrid}>
              {allCompleted.map((item, index) => (
                <div 
                  key={index} 
                  style={{
                    ...historyCard,
                    borderLeft: `5px solid ${getAreaColor(item.area)}`
                  }}
                >
                  <div style={historyHeader}>
                    <div style={areaBadge}>{item.area}</div>
                    <div style={dateBadge}>{new Date().toLocaleDateString()}</div>
                  </div>
                  <h3 style={historyTitle}>Reto {item.challengeId}</h3>
                  <p style={historyDescription}>
                    Completado en el nivel {progress.level}
                  </p>
                  <div style={historyStats}>
                    <div style={historyStat}>
                      <span style={historyStatLabel}>Puntos</span>
                      <span style={historyStatValue}>+{getPointsForChallenge(item.challengeId)}</span>
                    </div>
                    <div style={historyStat}>
                      <span style={historyStatLabel}>Área</span>
                      <span style={historyStatValue}>{item.area}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div style={actionsContainer}>
          <Link to="/dashboard" style={backButton}>
            ← Volver al Dashboard
          </Link>
        </div>
      </div>
    </>
  );
}

/* ====== FUNCIONES AUXILIARES ====== */

const getAreaColor = (area) => {
  const colors = {
    "Matemáticas": "#ff6b6b",
    "Lógica": "#4ecdc4",
    "Programación": "#9b59b6",
    "Memoria": "#f39c12"
  };
  return colors[area] || "#2563eb";
};

const getPointsForChallenge = (challengeId) => {
  // En un proyecto real, esto vendría de los datos
  return Math.floor(Math.random() * 50) + 10;
};

/* ====== ESTILOS ====== */

const containerStyle = {
  maxWidth: "1200px",
  margin: "100px auto 60px",
  padding: "0 20px"
};

const headerStyle = {
  textAlign: "center",
  marginBottom: "40px"
};

const titleStyle = {
  fontSize: "2.6rem",
  marginBottom: "15px",
  color: "#1e293b",
  fontWeight: "800"
};

const subtitleStyle = {
  color: "#475569",
  fontSize: "1.2rem",
  maxWidth: "700px",
  margin: "0 auto"
};

const statsBar = {
  display: "flex",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: "20px",
  marginBottom: "40px"
};

const statItem = {
  background: "#f8fafc",
  padding: "15px",
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
  flex: "1 1 200px"
};

const statLabel = {
  fontSize: "0.9rem",
  color: "#64748b",
  fontWeight: "500",
  marginBottom: "5px"
};

const statValue = {
  fontSize: "1.4rem",
  fontWeight: "700",
  color: "#1e293b"
};

const historyContainer = {
  marginBottom: "40px"
};

const sectionTitle = {
  fontSize: "1.8rem",
  marginBottom: "25px",
  color: "#1e293b"
};

const historyGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
  gap: "25px"
};

const historyCard = {
  backgroundColor: "#ffffff",
  padding: "25px",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  borderLeft: "5px solid #2563eb",
  transition: "all 0.3s"
};

const historyCardHover = {
  transform: "translateY(-5px)",
  boxShadow: "0 8px 20px rgba(0,0,0,0.1)"
};

const historyHeader = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "15px"
};

const areaBadge = {
  background: "#dbeafe",
  color: "#1e40af",
  padding: "4px 12px",
  borderRadius: "20px",
  fontSize: "0.85rem",
  fontWeight: "600"
};

const dateBadge = {
  background: "#f1f5f9",
  color: "#64748b",
  padding: "4px 12px",
  borderRadius: "20px",
  fontSize: "0.85rem"
};

const historyTitle = {
  fontSize: "1.3rem",
  marginBottom: "10px",
  color: "#1e293b",
  fontWeight: "700"
};

const historyDescription = {
  color: "#475569",
  marginBottom: "15px",
  fontSize: "1rem"
};

const historyStats = {
  display: "flex",
  justifyContent: "space-between",
  borderTop: "1px solid #e2e8f0",
  paddingTop: "15px"
};

const historyStat = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center"
};

const historyStatLabel = {
  fontSize: "0.85rem",
  color: "#64748b",
  fontWeight: "500"
};

const historyStatValue = {
  fontSize: "1.1rem",
  fontWeight: "700",
  color: "#1e293b"
};

const emptyState = {
  textAlign: "center",
  padding: "60px 20px",
  background: "#f8fafc",
  borderRadius: "12px",
  border: "1px solid #e2e8f0"
};

const emptyStateIcon = {
  fontSize: "3.5rem",
  color: "#2563eb",
  marginBottom: "20px"
};

const emptyStateText = {
  fontSize: "1.5rem",
  color: "#1e293b",
  marginBottom: "10px"
};

const emptyStateDescription = {
  color: "#475569",
  marginBottom: "20px",
  fontSize: "1.1rem"
};

const emptyStateButton = {
  display: "inline-block",
  padding: "12px 35px",
  backgroundColor: "#2563eb",
  color: "white",
  textDecoration: "none",
  borderRadius: "8px",
  fontWeight: "600",
  fontSize: "1.1rem",
  transition: "all 0.3s"
};

const actionsContainer = {
  marginTop: "30px",
  textAlign: "center"
};

const backButton = {
  display: "inline-block",
  padding: "12px 25px",
  backgroundColor: "#e2e8f0",
  color: "#475569",
  textDecoration: "none",
  borderRadius: "8px",
  fontWeight: "600",
  fontSize: "1rem",
  transition: "all 0.3s"
};

/* ====== ESTILOS DE CARGA Y ERRORES ====== */

const loadingContainer = {
  textAlign: "center",
  padding: "60px 0"
};

const loadingSpinner = {
  width: "40px",
  height: "40px",
  border: "4px solid #e2e8f0",
  borderTop: "4px solid #2563eb",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
  margin: "0 auto 20px"
};

const loadingText = {
  fontSize: "1.1rem",
  color: "#475569",
  fontWeight: "500"
};

const errorContainer = {
  textAlign: "center",
  padding: "40px",
  backgroundColor: "#fee2e2",
  borderRadius: "12px",
  border: "1px solid #ef4444"
};

const errorText = {
  fontSize: "1.2rem",
  color: "#b91c1c",
  marginBottom: "20px"
};

const retryButton = {
  padding: "10px 25px",
  backgroundColor: "#ef4444",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontWeight: "600",
  fontSize: "1rem",
  cursor: "pointer",
  transition: "all 0.3s"
};