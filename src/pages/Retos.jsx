import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { challengesByArea, difficultyColors, categoryIcons } from "../data/challenges";
import { progressManager } from "../utils/progressManager";

export default function Retos() {
  const { area } = useParams();
  const decodedArea = area ? decodeURIComponent(area) : null;
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [showSuccess, setShowSuccess] = useState(null);
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");

  // Cargar retos completados al montar
  useEffect(() => {
    if (decodedArea) {
      const progress = progressManager.getProgress();
      const completed = progress.completedChallenges[decodedArea] || [];
      setCompletedChallenges(completed);
    }
  }, [decodedArea]);

  // Manejar completar reto
  const handleCompleteChallenge = (challengeId, points) => {
    const result = progressManager.completeChallenge(decodedArea, challengeId, points);
    
    if (result) {
      // Actualizar estado local
      setCompletedChallenges(prev => [...prev, challengeId]);
      
      // Mostrar mensaje de éxito
      setShowSuccess(`¡Reto completado! +${points} puntos`);
      
      // Actualizar nivel
      const progress = progressManager.getProgress();
      
      // Ocultar mensaje después de 3 segundos
      setTimeout(() => {
        setShowSuccess(null);
        setActiveChallenge(null);
        setUserAnswer("");
      }, 3000);
    }
  };

  // Manejar resolver reto
  const handleSolveChallenge = (challengeId, answer) => {
    const challenge = challengesByArea[decodedArea].find(c => c.id === challengeId);
    
    // Validar la respuesta (comparación flexible)
    const userAnswerNormalized = answer.trim().toLowerCase();
    const correctAnswerNormalized = challenge.answer.trim().toLowerCase();
    
    if (userAnswerNormalized === correctAnswerNormalized || 
        userAnswerNormalized.includes(correctAnswerNormalized) ||
        correctAnswerNormalized.includes(userAnswerNormalized)) {
      handleCompleteChallenge(challengeId, challenge.points);
    } else {
      alert(`Respuesta incorrecta. La respuesta correcta era: ${challenge.answer}`);
    }
  };

  // Reiniciar un reto para reintentar
  const handleRetryChallenge = (challengeId, e) => {
    e.stopPropagation();
    setActiveChallenge(challengeId);
    setUserAnswer("");
  };

  // Obtener retos para el área
  const areaChallenges = decodedArea ? challengesByArea[decodedArea] : null;

  if (!decodedArea || !areaChallenges) {
    return (
      <>
        <Navbar />
        <div style={containerStyle}>
          <div style={errorCard}>
            <h2 style={errorTitle}>Área no encontrada</h2>
            <p style={errorMessage}>No pudimos encontrar el área que buscas.</p>
            <Link to="/areas" style={backButton}>
              Volver a Áreas
            </Link>
          </div>
        </div>
      </>
    );
  }

  const progress = progressManager.getProgress();
  const areaStats = progressManager.getAreaStats(decodedArea);

  return (
    <>
      <Navbar />

      <div style={containerStyle}>
        <Link to="/areas" style={backButton}>
          ← Volver a Áreas
        </Link>

        <div style={headerStyle}>
          <h1 style={titleStyle}>Retos de {decodedArea}</h1>
          <p style={subtitleStyle}>
            Completa estos retos para ganar puntos y subir de nivel. 
            Nivel actual: {progress.level}
          </p>
        </div>

        {showSuccess && (
          <div style={successMessage}>
            {showSuccess}
          </div>
        )}

        <div style={statsBar}>
          <div>
            <strong>Progreso:</strong> {areaStats.completed} de {areaChallenges.length} retos completados
          </div>
          <div style={progressBarContainer}>
            <div 
              style={{
                ...progressBarFill,
                width: `${areaStats.percentage}%`
              }}
            ></div>
          </div>
        </div>

        <div style={gridStyle}>
          {areaChallenges.map((challenge) => {
            const isCompleted = completedChallenges.includes(challenge.id);
            const categoryIcon = categoryIcons[challenge.category] || '📚';
            
            return (
              <div 
                key={challenge.id} 
                style={{
                  ...cardStyle,
                  borderLeft: `5px solid ${difficultyColors[challenge.difficulty]}`,
                  opacity: isCompleted ? 0.8 : 1
                }}
              >
                <div style={challengeHeader}>
                  <div style={categoryBadge}>
                    {categoryIcon} {challenge.category}
                  </div>
                  <div style={difficultyBadge(challenge.difficulty)}>
                    {challenge.difficulty}
                  </div>
                </div>
                
                <h3 style={cardTitle}>{challenge.title}</h3>
                <p style={cardDescription}>{challenge.description}</p>
                
                <div style={statsContainer}>
                  <div style={statItem}>
                    <span style={statLabel}>Puntos</span>
                    <span style={statValue}>+{challenge.points}</span>
                  </div>
                  <div style={statItem}>
                    <span style={statLabel}>Tiempo</span>
                    <span style={statValue}>{challenge.time}</span>
                  </div>
                </div>
                
                {activeChallenge?.id === challenge.id ? (
                  <div style={solverContainer}>
                    <p style={solverProblem}>
                      <strong>Problema:</strong> {challenge.problem}
                    </p>
                    
                    <input
                      type="text"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      style={solverInput}
                      placeholder="Escribe tu respuesta"
                      aria-label="Respuesta al reto"
                    />
                    
                    <button 
                      style={solverButton}
                      onClick={() => handleSolveChallenge(challenge.id, userAnswer)}
                      aria-label="Verificar respuesta"
                    >
                      Verificar Respuesta
                    </button>
                    
                    <button 
                      style={{...solverButton, background: "#64748b", marginTop: "8px"}}
                      onClick={() => setActiveChallenge(null)}
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <div style={{display: "flex", gap: "8px", flexWrap: "wrap"}}>
                    <button 
                      style={{
                        ...buttonStyle,
                        ...(isCompleted ? buttonCompletedStyle : {}),
                        flex: isCompleted ? "1 1 auto" : "1 1 100%"
                      }}
                      onClick={() => setActiveChallenge(challenge)}
                      disabled={isCompleted}
                    >
                      {isCompleted ? "✅ Completado" : "🎯 Iniciar Reto"}
                    </button>
                    
                    {isCompleted && (
                      <button 
                        style={{
                          ...buttonStyle,
                          background: "#6366f1",
                          padding: "10px",
                          fontSize: "0.95rem"
                        }}
                        onClick={(e) => handleRetryChallenge(challenge.id, e)}
                      >
                        🔄 Reintentar
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

/* ====== ESTILOS ====== */

const containerStyle = {
  maxWidth: "1200px",
  margin: "100px auto 60px",
  padding: "0 20px"
};

const backButton = {
  display: "inline-block",
  marginBottom: "30px",
  textDecoration: "none",
  color: "#2563eb",
  fontWeight: "600",
  fontSize: "1.1rem"
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

const successMessage = {
  background: "#dcfce7",
  borderLeft: "4px solid #22c55e",
  color: "#166534",
  padding: "12px 20px",
  borderRadius: "0 8px 8px 0",
  marginBottom: "25px",
  fontSize: "1.05rem",
  fontWeight: "500"
};

const statsBar = {
  background: "#f1f5f9",
  borderRadius: "12px",
  padding: "20px",
  marginBottom: "35px",
  border: "1px solid #e2e8f0"
};

const progressBarContainer = {
  height: "8px",
  background: "#cbd5e1",
  borderRadius: "4px",
  marginTop: "8px",
  overflow: "hidden"
};

const progressBarFill = {
  height: "100%",
  background: "linear-gradient(90deg, #2563eb, #8b5cf6)",
  transition: "width 0.5s ease"
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: "30px"
};

const cardStyle = {
  backgroundColor: "#ffffff",
  padding: "28px",
  borderRadius: "16px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  transition: "all 0.3s ease",
  position: "relative"
};

const challengeHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "18px",
  flexWrap: "wrap",
  gap: "8px"
};

const categoryBadge = {
  background: "#dbeafe",
  color: "#1e40af",
  padding: "4px 12px",
  borderRadius: "20px",
  fontSize: "0.85rem",
  fontWeight: "600"
};

const difficultyBadge = (difficulty) => ({
  background: difficultyColors[difficulty],
  color: "#ffffff",
  padding: "4px 12px",
  borderRadius: "20px",
  fontSize: "0.85rem",
  fontWeight: "600"
});

const cardTitle = {
  fontSize: "1.5rem",
  marginBottom: "12px",
  color: "#1e293b",
  fontWeight: "700"
};

const cardDescription = {
  color: "#475569",
  marginBottom: "22px",
  lineHeight: "1.6",
  fontSize: "1rem"
};

const statsContainer = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "20px",
  padding: "12px 15px",
  background: "#f8fafc",
  borderRadius: "10px",
  border: "1px solid #e2e8f0"
};

const statItem = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "4px"
};

const statLabel = {
  fontSize: "0.85rem",
  color: "#64748b",
  fontWeight: "500"
};

const statValue = {
  fontSize: "1.25rem",
  fontWeight: "700",
  color: "#1e293b"
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  border: "none",
  borderRadius: "10px",
  backgroundColor: "#2563eb",
  color: "white",
  fontWeight: "600",
  fontSize: "1rem",
  cursor: "pointer",
  transition: "all 0.2s",
  boxShadow: "0 2px 8px rgba(37, 99, 235, 0.3)"
};

const buttonCompletedStyle = {
  background: "#94a3b8",
  boxShadow: "none",
  cursor: "not-allowed"
};

const solverContainer = {
  marginTop: "20px",
  padding: "20px",
  border: "2px solid #e2e8f0",
  borderRadius: "12px",
  background: "#f8fafc"
};

const solverProblem = {
  marginBottom: "15px",
  color: "#1e293b",
  fontSize: "1.1rem",
  padding: "10px",
  background: "#fff",
  borderRadius: "8px",
  borderLeft: "4px solid #2563eb"
};

const solverInput = {
  width: "100%",
  padding: "12px 15px",
  border: "2px solid #cbd5e1",
  borderRadius: "8px",
  fontSize: "1rem",
  marginBottom: "15px",
  outline: "none"
};

const solverButton = {
  width: "100%",
  padding: "12px",
  border: "none",
  borderRadius: "8px",
  backgroundColor: "#2563eb",
  color: "white",
  fontWeight: "600",
  fontSize: "1rem",
  cursor: "pointer",
  transition: "all 0.2s",
  boxShadow: "0 2px 8px rgba(37, 99, 235, 0.3)"
};

const errorCard = {
  background: "#fff",
  borderRadius: "16px",
  padding: "40px",
  textAlign: "center",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  maxWidth: "600px",
  margin: "0 auto"
};

const errorTitle = {
  fontSize: "2rem",
  color: "#ef4444",
  marginBottom: "15px"
};

const errorMessage = {
  fontSize: "1.1rem",
  color: "#475569",
  marginBottom: "25px"
};
