import { Link } from "react-router-dom";
import { useState, useEffect } from 'react';

// Estilos como objeto JavaScript
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e7f4 100%)',
    padding: '20px',
  },
  header: {
    marginBottom: '30px',
    textAlign: 'center',
  },
  title: {
    fontSize: '2.5rem',
    color: '#2d3436',
    margin: '0 0 10px 0',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed, #ff7675)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#636e72',
    margin: '0',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  statCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    textAlign: 'center',
    transition: 'all 0.3s ease',
  },
  statCardHover: {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
  },
  statIcon: {
    fontSize: '3rem',
    marginBottom: '12px',
  },
  statNumber: {
    fontSize: '2rem',
    fontWeight: '800',
    margin: '0 0 8px 0',
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  statLabel: {
    fontSize: '0.95rem',
    color: '#636e72',
    margin: '0',
    fontWeight: '500',
  },
  section: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '1.6rem',
    color: '#2d3436',
    margin: '0 0 20px 0',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  chartContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '24px',
    marginBottom: '24px',
  },
  chartCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  },
  chartTitle: {
    fontSize: '1.2rem',
    color: '#2d3436',
    margin: '0 0 16px 0',
    fontWeight: '600',
  },
  radialChart: {
    width: '150px',
    height: '150px',
    position: 'relative',
    margin: '0 auto 20px',
  },
  radialBg: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    background: '#e0e0e0',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  radialFill: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    background: 'conic-gradient(#4f46e5 0%, #4f46e5 var(--progress), transparent var(--progress), transparent 100%)',
    position: 'absolute',
    top: 0,
    left: 0,
    clipPath: 'circle(45% at 50% 50%)',
  },
  radialCenter: {
    width: '70%',
    height: '70%',
    background: 'white',
    borderRadius: '50%',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radialNumber: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#4f46e5',
    margin: '0',
  },
  radialLabel: {
    fontSize: '0.85rem',
    color: '#636e72',
    margin: '4px 0 0 0',
  },
  achievementsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
  },
  achievementCard: {
    background: 'linear-gradient(145deg, #f8f9fa, #e9ecef)',
    borderRadius: '12px',
    padding: '16px',
    textAlign: 'center',
    transition: 'all 0.3s ease',
    border: '2px solid transparent',
  },
  achievementCardLocked: {
    opacity: '0.6',
    cursor: 'not-allowed',
  },
  achievementCardUnlocked: {
    background: 'linear-gradient(145deg, #55efc4, #00cec9)',
    border: '2px solid #00cec9',
  },
  achievementIcon: {
    fontSize: '2.5rem',
    marginBottom: '8px',
  },
  achievementTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    margin: '0 0 4px 0',
    color: '#2d3436',
  },
  achievementDesc: {
    fontSize: '0.8rem',
    color: '#636e72',
    margin: '0',
  },
  historyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  historyItem: {
    padding: '16px',
    background: '#f8f9fa',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    transition: 'all 0.3s ease',
  },
  historyItemHover: {
    background: '#e9ecef',
    transform: 'translateX(5px)',
  },
  historyIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    color: 'white',
    flexShrink: 0,
  },
  historyContent: {
    flex: 1,
  },
  historyTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    margin: '0 0 4px 0',
    color: '#2d3436',
  },
  historyDate: {
    fontSize: '0.85rem',
    color: '#636e72',
    margin: '0',
  },
  historyPoints: {
    fontSize: '1.2rem',
    fontWeight: '800',
    color: '#4f46e5',
    minWidth: '60px',
    textAlign: 'right',
  },
  levelProgress: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '20px',
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    borderRadius: '16px',
    color: 'white',
  },
  levelNumber: {
    fontSize: '3rem',
    fontWeight: '800',
    margin: '0',
  },
  levelInfo: {
    flex: 1,
  },
  levelLabel: {
    fontSize: '1.1rem',
    margin: '0 0 8px 0',
    opacity: '0.9',
  },
  levelBar: {
    height: '10px',
    background: 'rgba(255, 255, 255, 0.3)',
    borderRadius: '5px',
    overflow: 'hidden',
  },
  levelBarFill: {
    height: '100%',
    background: 'white',
    borderRadius: '5px',
    transition: 'width 0.5s ease',
  },
};

export default function Progreso() {
  const [user, setUser] = useState({
    name: 'Juan Pérez',
    level: 3,
    puntos: 245,
    retosCompletados: 18,
    areasCompletadas: 2,
    tiempoTotal: '4h 30m',
  });

  const [progress, setProgress] = useState(65);

  useEffect(() => {
    // Simular carga de datos
    const savedProgress = localStorage.getItem('cognify_progress');
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress));
    }
  }, []);

  const estadisticas = [
    { icon: '⭐', number: user.puntos, label: 'Puntos Totales', color: '#4f46e5' },
    { icon: '🎯', number: user.retosCompletados, label: 'Retos Completados', color: '#55efc4' },
    { icon: '📚', number: user.areasCompletadas, label: 'Áreas Dominadas', color: '#ffeaa7' },
    { icon: '⏱️', number: user.tiempoTotal, label: 'Tiempo de Estudio', color: '#74b9ff' },
  ];

  const logros = [
    { id: 1, icon: '🥇', title: 'Primeros Pasos', desc: 'Completar 5 retos', unlocked: true },
    { id: 2, icon: '🥈', title: 'Aprendiz Activo', desc: 'Completar 15 retos', unlocked: true },
    { id: 3, icon: '🥉', title: 'Maestro de Áreas', desc: 'Dominar 3 áreas', unlocked: false },
    { id: 4, icon: '🔥', title: 'Racha de 7 Días', desc: 'Estudiar 7 días seguidos', unlocked: false },
    { id: 5, icon: '⭐', title: 'Nivel 5', desc: 'Alcanzar nivel 5', unlocked: false },
    { id: 6, icon: '🏆', title: 'Campeón', desc: 'Completar 50 retos', unlocked: false },
  ];

  const historial = [
    { id: 1, title: 'Sumas Básicas', area: 'Matemáticas', date: 'Hoy', points: 10, color: '#ff6b6b' },
    { id: 2, title: 'Patrones Lógicos', area: 'Lógica', date: 'Ayer', points: 15, color: '#4ecdc4' },
    { id: 3, title: 'Variables', area: 'Programación', date: 'Hace 2 días', points: 20, color: '#9b59b6' },
    { id: 4, title: 'Multiplicaciones', area: 'Matemáticas', date: 'Hace 3 días', points: 25, color: '#ff6b6b' },
    { id: 5, title: 'Secuencias', area: 'Lógica', date: 'Hace 4 días', points: 15, color: '#4ecdc4' },
  ];

  const [isHovered, setIsHovered] = useState(null);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>📊 Tu Progreso</h1>
        <p style={styles.subtitle}>
          Visualiza tu evolución y logros en Cognify
        </p>
      </div>

      {/* Nivel Actual */}
      <div style={styles.levelProgress}>
        <div>
          <p style={styles.levelNumber}>Nivel {user.level}</p>
        </div>
        <div style={styles.levelInfo}>
          <p style={styles.levelLabel}>Progreso al Nivel {user.level + 1}</p>
          <div style={styles.levelBar}>
            <div
              style={{
                ...styles.levelBarFill,
                width: `${progress}%`,
              }}
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              role="progressbar"
            ></div>
          </div>
          <p style={{ fontSize: '0.85rem', margin: '4px 0 0 0', opacity: '0.8' }}>
            {progress}% completado
          </p>
        </div>
      </div>

      {/* Estadísticas Generales */}
      <div style={styles.statsGrid}>
        {estadisticas.map((stat, index) => (
          <div
            key={index}
            style={styles.statCard}
            onMouseEnter={() => setIsHovered(index)}
            onMouseLeave={() => setIsHovered(null)}
            style={{
              ...styles.statCard,
              ...(isHovered === index ? styles.statCardHover : {}),
            }}
            role="article"
            aria-label={`${stat.label}: ${stat.number}`}
          >
            <div style={{ ...styles.statIcon, color: stat.color }} aria-hidden="true">
              {stat.icon}
            </div>
            <p style={styles.statNumber}>{stat.number}</p>
            <p style={styles.statLabel}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Gráficos de Progreso */}
      <div style={styles.chartContainer}>
        {/* Progreso General */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>📊 Progreso General</h3>
          <div style={styles.radialChart}>
            <div style={styles.radialBg}></div>
            <div 
              style={{ 
                ...styles.radialFill,
                '--progress': `${progress * 3.6}deg`,
              }}
            ></div>
            <div style={styles.radialCenter}>
              <p style={styles.radialNumber}>{progress}%</p>
              <p style={styles.radialLabel}>Completado</p>
            </div>
          </div>
          <p style={{ textAlign: 'center', color: '#636e72', fontSize: '0.9rem' }}>
            Has completado {user.retosCompletados} de 30 retos
          </p>
        </div>

        {/* Áreas Completadas */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>📚 Áreas Completadas</h3>
          <div style={styles.radialChart}>
            <div style={styles.radialBg}></div>
            <div 
              style={{ 
                ...styles.radialFill,
                '--progress': '144deg',
                background: 'conic-gradient(#55efc4 0%, #55efc4 144deg, transparent 144deg, transparent 100%)',
              }}
            ></div>
            <div style={styles.radialCenter}>
              <p style={{ ...styles.radialNumber, color: '#55efc4' }}>40%</p>
              <p style={styles.radialLabel}>Dominadas</p>
            </div>
          </div>
          <p style={{ textAlign: 'center', color: '#636e72', fontSize: '0.9rem' }}>
            2 de 5 áreas completadas
          </p>
        </div>
      </div>

      {/* Logros y Medallas */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>🏆 Tus Logros</h2>
        <div style={styles.achievementsGrid}>
          {logros.map((logro) => (
            <div
              key={logro.id}
              style={{
                ...styles.achievementCard,
                ...(logro.unlocked ? styles.achievementCardUnlocked : styles.achievementCardLocked),
              }}
              aria-label={`${logro.title}: ${logro.unlocked ? 'Desbloqueado' : 'Bloqueado'}`}
            >
              <div style={{ ...styles.achievementIcon, opacity: logro.unlocked ? 1 : 0.4 }} aria-hidden="true">
                {logro.icon}
              </div>
              <h4 style={styles.achievementTitle}>{logro.title}</h4>
              <p style={styles.achievementDesc}>{logro.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Historial de Actividad */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>📅 Historial Reciente</h2>
        <div style={styles.historyList}>
          {historial.map((item, index) => (
            <div
              key={item.id}
              style={{
                ...styles.historyItem,
                ...(isHovered === `history-${index}` ? styles.historyItemHover : {}),
              }}
              onMouseEnter={() => setIsHovered(`history-${index}`)}
              onMouseLeave={() => setIsHovered(null)}
            >
              <div style={{ ...styles.historyIcon, background: `linear-gradient(135deg, ${item.color}, ${item.color}cc)` }}>
                {index + 1}
              </div>
              <div style={styles.historyContent}>
                <h4 style={styles.historyTitle}>{item.title}</h4>
                <p style={styles.historyDate}>
                  {item.area} • {item.date}
                </p>
              </div>
              <div style={styles.historyPoints}>+{item.points}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Botón para volver */}
      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <Link
          to="/dashboard"
          style={{
            ...styles.statCard,
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            color: 'white',
            textDecoration: 'none',
            maxWidth: '300px',
            margin: '0 auto',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(79, 70, 229, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
          }}
        >
          <p style={{ ...styles.statNumber, WebkitTextFillColor: 'white' }}>🏠</p>
          <p style={{ ...styles.statLabel, color: 'rgba(255, 255, 255, 0.9)' }}>
            Volver al Inicio
          </p>
        </Link>
      </div>
    </div>
  );
}
