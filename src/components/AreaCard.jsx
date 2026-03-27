import { useNavigate } from "react-router-dom";
import { useState } from 'react';

// Estilos como objeto JavaScript
const styles = {
  card: {
    background: 'linear-gradient(145deg, var(--area-color), #000)',
    padding: '24px',
    borderRadius: '16px',
    border: 'none',
    cursor: 'pointer',
    color: '#fff',
    width: '220px',
    textAlign: 'left',
    transition: 'all 0.3s ease',
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)',
    position: 'relative',
    overflow: 'hidden'
  },
  cardHover: {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.3)',
  },
  cardActive: {
    transform: 'translateY(0)',
  },
  title: {
    margin: '0 0 12px 0',
    fontSize: '1.3rem',
    fontWeight: '700',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
  },
  icon: {
    fontSize: '3rem',
    textAlign: 'center',
    display: 'block',
    marginBottom: '8px',
    transition: 'transform 0.3s',
  },
  iconHover: {
    transform: 'scale(1.2) rotate(10deg)',
  },
  badge: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '600',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(4px)',
  },
};

export default function AreaCard({ area }) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const handleClick = () => {
    navigate(`/retos/${area.nombre}`);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    setIsActive(false);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsActive(false);
  };

  const handleMouseDown = () => {
    setIsActive(true);
  };

  const handleMouseUp = () => {
    setIsActive(false);
  };

  // Iconos según el área
  const getIcon = (nombre) => {
    const icons = {
      'Matemáticas': '➗',
      'Lógica': '🧠',
      'Cultura General': '🌍',
      'Programación': '💻',
      'Memoria': '🎯',
      'Concentración': '🎯'
    };
    return icons[nombre] || '📚';
  };

  // Obtener color según el área (fallback si no hay color)
  const getColor = (area) => {
    const colors = {
      'Matemáticas': '#ff6b6b',
      'Lógica': '#4ecdc4',
      'Cultura General': '#45b7d1',
      'Programación': '#9b59b6',
      'Memoria': '#f39c12',
      'Concentración': '#2ecc71'
    };
    return area.color || colors[area.nombre] || '#3498db';
  };

  const cardColor = getColor(area);

  return (
    <button
      style={{
        ...styles.card,
        '--area-color': cardColor,
        ...(isHovered && !isActive ? styles.cardHover : {}),
        ...(isActive ? styles.cardActive : {}),
      }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      aria-label={`Ir a retos de ${area.nombre}`}
      role="link"
    >
      {/* Badge con cantidad de retos */}
      {area.retosDisponibles && (
        <div style={styles.badge}>
          {area.retosDisponibles} retos
        </div>
      )}

      {/* Icono del área */}
      <span
        style={{
          ...styles.icon,
          ...(isHovered && !isActive ? styles.iconHover : {}),
        }}
        aria-hidden="true"
      >
        {getIcon(area.nombre)}
      </span>

      {/* Título del área */}
      <h3 style={styles.title}>{area.nombre}</h3>
    </button>
  );
}