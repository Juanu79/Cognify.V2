import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { progressManager } from "../utils/progressManager";
import { challengesByArea } from "../data/challenges";
import "../styles/global.css";

export default function Progreso() {
  const [progress, setProgress] = useState(null);
  const [areaStats, setAreaStats] = useState({});

  useEffect(() => {
    // Cargar progreso real
    const prog = progressManager.getProgress();
    setProgress(prog);

    // Calcular estadísticas por área
    const stats = {};
    let totalCompleted = 0;
    let totalChallenges = 0;

    Object.keys(challengesByArea).forEach(area => {
      const completed = prog.completedChallenges[area]?.length || 0;
      const total = challengesByArea[area].length;
      stats[area] = {
        completed,
        total,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0
      };
      totalCompleted += completed;
      totalChallenges += total;
    });

    setAreaStats(stats);
  }, []);

  if (!progress) {
    return (
      <>
        <Navbar />
        <div className="container">
          <h1>Tu Progreso</h1>
          <p>Cargando...</p>
        </div>
      </>
    );
  }

  const overallPercentage = areaStats['Matemáticas']?.percentage || 0;

  return (
    <>
      <Navbar />
      <div className="container">
        <h1>Tu Progreso</h1>
        
        {/* Nivel y Puntos */}
        <div className="card">
          <h2>Nivel {progress.level}</h2>
          <p>🏆 {progress.totalPoints} puntos totales</p>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${overallPercentage}%` }}
            ></div>
          </div>
          <p>{overallPercentage}% completado</p>
        </div>

        {/* Estadísticas por Área */}
        <div className="areas-grid">
          {Object.keys(areaStats).map(area => (
            <div key={area} className="card area-card">
              <h3>{area}</h3>
              <p>
                {areaStats[area].completed} de {areaStats[area].total} retos
              </p>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${areaStats[area].percentage}%`,
                    background: getAreaColor(area)
                  }}
                ></div>
              </div>
              <p>{areaStats[area].percentage}%</p>
            </div>
          ))}
        </div>

        {/* Racha */}
        <div className="card">
          <h3>🔥 Racha de Actividad</h3>
          <p>{progress.streakDays} días consecutivos</p>
        </div>
      </div>
    </>
  );
}

// Colores por área
function getAreaColor(area) {
  const colors = {
    'Matemáticas': 'linear-gradient(90deg, #667eea, #764ba2)',
    'Lógica': 'linear-gradient(90deg, #f093fb, #f5576c)',
    'Programación': 'linear-gradient(90deg, #4facfe, #00f2fe)',
    'Memoria': 'linear-gradient(90deg, #43e97b, #38f9d7)'
  };
  return colors[area] || '#667eea';
}
