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
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  statCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    transition: 'all 0.3s ease',
    border: '2px solid transparent',
  },
  statCardHover: {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
    borderColor: '#4f46e5',
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
  sectionTitle: {
    fontSize: '1.8rem',
    color: '#2d3436',
    marginBottom: '20px',
    fontWeight: '700',
  },
  areasGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
    marginBottom: '30px',
  },
  quickActions: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
    marginBottom: '30px',
  },
  actionButton: {
    flex: '1',
    minWidth: '180px',
    padding: '16px 24px',
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    boxShadow: '0 4px 15px rgba(79, 70, 229, 0.4)',
  },
  actionButtonHover: {
    transform: 'translateY(-3px)',
    boxShadow: '0 8px 25px rgba(79, 70, 229, 0.6)',
  },
  actionButtonSecondary: {
    background: 'linear-gradient(135deg, #55efc4, #00cec9)',
  },
  progressBarContainer: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    marginBottom: '30px',
  },
  progressBarLabel: {
    fontSize: '1.1rem',
    color: '#2d3436',
    margin: '0 0 12px 0',
    fontWeight: '600',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressBar: {
    height: '12px',
    background: '#e0e0e0',
    borderRadius: '6px',
    overflow: 'hidden',
    position: 'relative',
  },
  progressBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #4f46e5, #7c3aed)',
    transition: 'width 0.5s ease',
    borderRadius: '6px',
  },
  levelBadge: {
    background: 'linear-gradient(135deg, #ffd700, #ff9800)',
    color: '#333',
    padding: '6px 16px',
    borderRadius: '20px',
    fontSize: '0.9rem',
    fontWeight: '700',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    boxShadow: '0 4px 10px rgba(255, 152, 0, 0.4)',
  },
  streakContainer: {
    background: 'linear-gradient(135deg, #ff9ff3, #ee5a6f)',
    color: 'white',
    borderRadius: '16px',
    padding: '20px',
    textAlign: 'center',
    marginBottom: '30px',
    boxShadow: '0 8px 24px rgba(238, 90, 111, 0.4)',
  },
  streakTitle: {
    fontSize: '1.3rem',
    margin: '0 0 10px 0',
    fontWeight: '700',
  },
  streakCount: {
    fontSize: '2.5rem',
    margin: '0',
    fontWeight: '800',
  },
  streakLabel: {
    fontSize: '0.95rem',
    opacity: '0.9',
    margin: '8px 0 0 0',
  },
};

export default function Dashboard() {
  const [user, setUser] = useState({
    name: 'Juan Pérez',
    level: 3,
    puntos: 245,
    retosCompletados: 18,
    rachaDias: 5,
  });

  const [progress, setProgress] = useState(65);
  const [isStatHovered, setIsStatHovered] = useState(null);

  useEffect(() => {
    // Simular carga de datos del usuario
    const savedUser = localStorage.getItem('cognify_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const stats = [
    {
      icon: '⭐',
      number: user.puntos,
      label: 'Puntos Totales',
      color: '#4f46e5',
    },
    {
      icon: '🏆',
      number: user.level,
      label: 'Nivel Actual',
      color: '#ffd700',
    },
    {
      icon: '🎯',
      number: user.retosCompletados,
      label: 'Retos Completados',
      color: '#55efc4',
    },
    {
      icon: '🔥',
      number: `${user.rachaDias} días`,
      label: 'Racha Actual',
      color: '#ff7675',
    },
  ];

  const areasDestacadas = [
    { id: 1, nombre: 'Matemáticas', color: '#ff6b6b', retosDisponibles: 15 },
    { id: 2, nombre: 'Lógica', color: '#4ecdc4', retosDisponibles: 12 },
    { id: 3, nombre: 'Programación', color: '#9b59b6', retosDisponibles: 10 },
  ];

  const handleStatMouseEnter = (index) => {
    setIsStatHovered(index);
  };

  const handleStatMouseLeave = () => {
    setIsStatHovered(null);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>🧠 Cognify</h1>
        <p style={styles.subtitle}>
          Fortalece tus habilidades cognitivas con retos interactivos
        </p>
      </div>

      {/* Streak Container */}
      <div style={styles.streakContainer}>
        <h3 style={styles.streakTitle}>🔥 Tu Racha de Aprendizaje</h3>
        <p style={styles.streakCount}>{user.rachaDias}</p>
        <p style={styles.streakLabel}>Días consecutivos entrenando</p>
      </div>

      {/* Estadísticas */}
      <div style={styles.statsContainer}>
        {stats.map((stat, index) => (
          <div
            key={index}
            style={{
              ...styles.statCard,
              ...(isStatHovered === index ? styles.statCardHover : {}),
            }}
            onMouseEnter={() => handleStatMouseEnter(index)}
            onMouseLeave={handleStatMouseLeave}
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

      {/* Barra de Progreso de Nivel */}
      <div style={styles.progressBarContainer}>
        <div style={styles.progressBarLabel}>
          <span>Progreso al Nivel {user.level + 1}</span>
          <span style={styles.levelBadge}>
            🏆 Nivel {user.level}
          </span>
        </div>
        <div style={styles.progressBar}>
          <div
            style={{
              ...styles.progressBarFill,
              width: `${progress}%`,
            }}
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            role="progressbar"
          ></div>
        </div>
        <p style={{ 
          fontSize: '0.85rem', 
          color: '#636e72', 
          marginTop: '8px',
          textAlign: 'center',
        }}>
          {progress}% completado - {100 - progress}% para subir de nivel
        </p>
      </div>

      {/* Acciones Rápidas */}
      <div style={styles.quickActions}>
        <Link
          to="/areas"
          style={{
            ...styles.actionButton,
            ...(isStatHovered === 'areas' ? styles.actionButtonHover : {}),
          }}
          onMouseEnter={() => setIsStatHovered('areas')}
          onMouseLeave={() => setIsStatHovered(null)}
        >
          📚 Explorar Áreas
        </Link>
        <Link
          to="/progreso"
          style={{
            ...styles.actionButton,
            ...styles.actionButtonSecondary,
            ...(isStatHovered === 'progreso' ? styles.actionButtonHover : {}),
          }}
          onMouseEnter={() => setIsStatHovered('progreso')}
          onMouseLeave={() => setIsStatHovered(null)}
        >
          📊 Ver Progreso
        </Link>
      </div>

      {/* Áreas Destacadas */}
      <h2 style={styles.sectionTitle}>📚 Áreas Destacadas</h2>
      <div style={styles.areasGrid}>
        {areasDestacadas.map((area) => (
          <Link
            key={area.id}
            to={`/retos/${area.nombre}`}
            style={{
              ...styles.statCard,
              background: `linear-gradient(145deg, ${area.color}, ${area.color}cc)`,
              color: 'white',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
            }}
            aria-label={`Ir a retos de ${area.nombre}`}
          >
            <h3 style={{ 
              ...styles.statNumber, 
              WebkitTextFillColor: 'white',
              fontSize: '1.8rem',
            }}>
              {area.nombre}
            </h3>
            <p style={{ 
              ...styles.statLabel, 
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '1rem',
            }}>
              {area.retosDisponibles} retos disponibles
            </p>
          </Link>
        ))}
      </div>

      {/* Mensaje de Bienvenida */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        textAlign: 'center',
        marginTop: '20px',
      }}>
        <h3 style={{ 
          color: '#2d3436', 
          margin: '0 0 12px 0',
          fontSize: '1.5rem',
        }}>
          ¡Hola, {user.name.split(' ')[0]}! 👋
        </h3>
        <p style={{ 
          color: '#636e72', 
          margin: '0',
          fontSize: '1.1rem',
        }}>
          Continúa tu camino hacia la excelencia cognitiva
        </p>
      </div>
    </div>
  );
}

