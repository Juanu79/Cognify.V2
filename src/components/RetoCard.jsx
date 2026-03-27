import { useState } from 'react';

// Estilos como objeto JavaScript
const styles = {
  card: {
    background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
    border: '2px solid #e0e0e0',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '20px',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    position: 'relative',
    overflow: 'hidden',
  },
  cardHover: {
    transform: 'translateY(-6px)',
    boxShadow: '0 12px 28px rgba(0, 0, 0, 0.15)',
    border: '2px solid #4f46e5',
  },
  cardActive: {
    transform: 'translateY(0)',
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)',
    border: '2px solid #4f46e5',
  },
  cardCompletado: {
    border: '2px solid #55efc4',
    background: 'linear-gradient(145deg, #f0fff4, #e6f7ea)',
  },
  cardLocked: {
    opacity: '0.6',
    cursor: 'not-allowed',
  },
  cardBorderTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '6px',
    background: 'linear-gradient(90deg, #4f46e5, #7c3aed, #ff7675)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
    gap: '12px',
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '1.3rem',
    fontWeight: '700',
    color: '#2d3436',
    lineHeight: '1.4',
  },
  dificultad: {
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    display: 'inline-block',
    minWidth: '70px',
    textAlign: 'center',
  },
  dificultadFacil: {
    backgroundColor: '#55efc4',
    color: '#006d5b',
  },
  dificultadMedia: {
    backgroundColor: '#ffeaa7',
    color: '#8c6d00',
  },
  dificultadDificil: {
    backgroundColor: '#ff7675',
    color: '#c0392b',
  },
  dificultadExperto: {
    backgroundColor: '#dfe6e9',
    color: '#2d3436',
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '20px',
  },
  description: {
    color: '#636e72',
    fontSize: '0.95rem',
    lineHeight: '1.6',
    margin: '0',
  },
  stats: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
  },
  stat: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.95rem',
    color: '#2d3436',
    fontWeight: '600',
  },
  statIcon: {
    fontSize: '1.4rem',
  },
  statLabel: {
    color: '#636e72',
    fontSize: '0.85rem',
    fontWeight: '500',
  },
  button: {
    width: '100%',
    padding: '14px 20px',
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
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
  buttonHover: {
    transform: 'translateY(-3px)',
    boxShadow: '0 8px 25px rgba(79, 70, 229, 0.6)',
  },
  buttonActive: {
    transform: 'translateY(1px)',
    boxShadow: '0 2px 8px rgba(79, 70, 229, 0.4)',
  },
  buttonDisabled: {
    opacity: '0.6',
    cursor: 'not-allowed',
    transform: 'none',
    boxShadow: 'none',
  },
  buttonCompletado: {
    background: 'linear-gradient(135deg, #55efc4, #00cec9)',
    cursor: 'default',
  },
  buttonLocked: {
    background: 'linear-gradient(135deg, #dfe6e9, #b2bec3)',
    cursor: 'not-allowed',
  },
  spinner: {
    width: '20px',
    height: '20px',
    border: '3px solid rgba(255, 255, 255, 0.3)',
    borderTop: '3px solid #fff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  rewardBadge: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    background: 'linear-gradient(135deg, #ffd700, #ff9800)',
    color: '#333',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '700',
    boxShadow: '0 4px 10px rgba(255, 152, 0, 0.4)',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    zIndex: '10',
  },
  levelRequired: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    background: '#e84393',
    color: '#fff',
    borderRadius: '16px',
    fontSize: '0.75rem',
    fontWeight: '700',
    marginTop: '8px',
  },
  icon: {
    fontSize: '1.2rem',
  },
  timer: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#e17055',
    fontWeight: '600',
    fontSize: '0.95rem',
  },
  featured: {
    border: '3px solid #ff9ff3',
    boxShadow: '0 0 20px rgba(255, 159, 243, 0.4)',
  },
  featuredBorder: {
    background: 'linear-gradient(90deg, #ff9ff3, #ff6b81, #ff9ff3)',
  },
  newBadge: {
    position: 'absolute',
    top: '16px',
    left: '-30px',
    background: '#00d2d3',
    color: '#fff',
    padding: '4px 30px',
    transform: 'rotate(-45deg)',
    fontSize: '0.75rem',
    fontWeight: '800',
    letterSpacing: '2px',
    boxShadow: '0 4px 10px rgba(0, 210, 211, 0.4)',
  },
  streakBonus: {
    marginTop: '12px',
    padding: '8px 12px',
    background: 'linear-gradient(135deg, #ff9ff3, #ee5a6f)',
    color: '#fff',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
};

// Animación keyframes (para el spinner)
const keyframes = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

// Inyectar animaciones en el head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = keyframes;
  document.head.appendChild(styleSheet);
}

// Helper para obtener color de dificultad
const getDificultadStyle = (dificultad) => {
  const dificultadLower = dificultad?.toLowerCase() || 'media';
  const mapping = {
    'fácil': styles.dificultadFacil,
    'facil': styles.dificultadFacil,
    'easy': styles.dificultadFacil,
    'media': styles.dificultadMedia,
    'medium': styles.dificultadMedia,
    'difícil': styles.dificultadDificil,
    'dificil': styles.dificultadDificil,
    'hard': styles.dificultadDificil,
    'experto': styles.dificultadExperto,
    'expert': styles.dificultadExperto,
  };
  return mapping[dificultadLower] || styles.dificultadMedia;
};

// Helper para obtener icono de dificultad
const getDificultadIcon = (dificultad) => {
  const dificultadLower = dificultad?.toLowerCase() || 'media';
  const mapping = {
    'fácil': '🟢',
    'facil': '🟢',
    'easy': '🟢',
    'media': '🟡',
    'medium': '🟡',
    'difícil': '🔴',
    'dificil': '🔴',
    'hard': '🔴',
    'experto': '⭐',
    'expert': '⭐',
  };
  return mapping[dificultadLower] || '🟡';
};

// Helper para obtener icono de tiempo
const getTimeIcon = (tiempo) => {
  if (!tiempo) return '⏱️';
  const mins = typeof tiempo === 'string' ? parseInt(tiempo) : tiempo;
  if (mins <= 5) return '⚡';
  if (mins <= 15) return '⏱️';
  return '🕐';
};

export default function RetoCard({ 
  reto, 
  onCompletar, 
  onIniciar, 
  completado = false, 
  locked = false,
  isFeatured = false,
  isNew = false,
  streakBonus = 0,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompletado, setIsCompletado] = useState(completado);

  // Manejar hover
  const handleMouseEnter = () => {
    if (!locked && !isCompletado) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsActive(false);
  };

  // Manejar click
  const handleMouseDown = () => {
    if (!locked && !isCompletado) {
      setIsActive(true);
    }
  };

  const handleMouseUp = () => {
    setIsActive(false);
  };

  // Manejar completar reto
  const handleCompletar = async () => {
    if (locked || isCompletado || isLoading) return;

    try {
      setIsLoading(true);
      
      if (onCompletar) {
        await onCompletar(reto.id);
      } else if (onIniciar) {
        await onIniciar(reto.id);
        return;
      }

      setIsCompletado(true);
    } catch (error) {
      console.error('Error al completar reto:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Determinar texto del botón
  const getButtonText = () => {
    if (isLoading) return '⏳ Cargando...';
    if (isCompletado) return '✅ ¡Completado!';
    if (locked) return '🔒 Bloqueado';
    return '🎯 Iniciar Reto';
  };

  // Obtener estilo del botón
  const getButtonStyle = () => {
    let style = { ...styles.button };

    if (isCompletado) {
      style = { ...style, ...styles.buttonCompletado };
    } else if (locked) {
      style = { ...style, ...styles.buttonLocked };
    } else if (isLoading) {
      style = { ...style, ...styles.buttonDisabled };
    } else if (isActive) {
      style = { ...style, ...styles.buttonActive };
    } else if (isHovered) {
      style = { ...style, ...styles.buttonHover };
    }

    return style;
  };

  // Obtener estilo de la tarjeta
  const getCardStyle = () => {
    let style = { ...styles.card };

    if (isFeatured) {
      style = { ...style, ...styles.featured };
    }

    if (isCompletado) {
      style = { ...style, ...styles.cardCompletado };
    }

    if (locked) {
      style = { ...style, ...styles.cardLocked };
    }

    if (isActive && !locked && !isCompletado) {
      style = { ...style, ...styles.cardActive };
    } else if (isHovered && !locked && !isCompletado) {
      style = { ...style, ...styles.cardHover };
    }

    return style;
  };

  // Obtener color de dificultad
  const dificultadStyle = getDificultadStyle(reto.dificultad);
  const dificultadIcon = getDificultadIcon(reto.dificultad);
  const timeIcon = getTimeIcon(reto.tiempo);

  return (
    <div 
      style={getCardStyle()}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      aria-label={`Reto: ${reto.titulo}`}
      role="article"
    >
      {/* Borde superior decorativo */}
      <div style={{
        ...styles.cardBorderTop,
        ...(isFeatured ? styles.featuredBorder : {}),
      }}></div>

      {/* Badge de nuevo */}
      {isNew && (
        <div style={styles.newBadge} aria-label="Nuevo reto">
          NUEVO
        </div>
      )}

      {/* Badge de recompensa extra */}
      {streakBonus > 0 && (
        <div style={styles.rewardBadge} aria-label={`Bonus de racha: +${streakBonus} puntos`}>
          <span aria-hidden="true">🔥</span>
          +{streakBonus}
        </div>
      )}

      {/* Header */}
      <div style={styles.header}>
        <div style={{ flex: 1 }}>
          <h3 style={styles.title}>{reto.titulo}</h3>
          
          {/* Descripción */}
          {reto.descripcion && (
            <p style={styles.description}>{reto.descripcion}</p>
          )}

          {/* Nivel requerido */}
          {reto.nivelRequerido && reto.nivelRequerido > 1 && (
            <div style={styles.levelRequired} aria-label={`Nivel requerido: ${reto.nivelRequerido}`}>
              <span aria-hidden="true">🏆</span>
              Nivel {reto.nivelRequerido}
            </div>
          )}
        </div>

        {/* Badge de dificultad */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ ...styles.dificultad, ...dificultadStyle }}>
            {dificultadIcon} {reto.dificultad}
          </div>
        </div>
      </div>

      {/* Body - Estadísticas */}
      <div style={styles.body}>
        <div style={styles.stats}>
          {/* Puntos */}
          <div style={styles.stat}>
            <span style={styles.statIcon} aria-hidden="true">
              ⭐
            </span>
            <div>
              <div>{reto.puntos}</div>
              <div style={styles.statLabel}>puntos</div>
            </div>
          </div>

          {/* Tiempo estimado */}
          {reto.tiempo && (
            <div style={styles.stat}>
              <span style={styles.statIcon} aria-hidden="true">
                {timeIcon}
              </span>
              <div>
                <div>{reto.tiempo}</div>
                <div style={styles.statLabel}>minutos</div>
              </div>
            </div>
          )}

          {/* Intentos */}
          {reto.intentos !== undefined && (
            <div style={styles.stat}>
              <span style={styles.statIcon} aria-hidden="true">
                🔄
              </span>
              <div>
                <div>{reto.intentos}</div>
                <div style={styles.statLabel}>intentos</div>
              </div>
            </div>
          )}
        </div>

        {/* Streak bonus info */}
        {streakBonus > 0 && (
          <div style={styles.streakBonus}>
            <span aria-hidden="true">🔥</span>
            ¡Mantén tu racha! Bonus de {streakBonus} puntos extra
          </div>
        )}
      </div>

      {/* Botón de acción */}
      <button
        onClick={handleCompletar}
        style={getButtonStyle()}
        disabled={locked || isLoading}
        aria-busy={isLoading}
        aria-disabled={locked || isLoading}
        aria-label={getButtonText()}
      >
        {isLoading ? (
          <div style={styles.spinner} aria-hidden="true"></div>
        ) : (
          <>
            {isCompletado ? '✅' : locked ? '🔒' : '🎯'}
            {getButtonText()}
          </>
        )}
      </button>
    </div>
  );
}