import { useState } from 'react';

// Estilos como objeto JavaScript
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '20px',
    width: '100%',
  },
  label: {
    fontSize: '14px',
    marginBottom: '8px',
    color: '#2d3436',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  labelRequired: {
    color: '#e74c3c',
    fontSize: '16px',
    fontWeight: '700',
  },
  input: {
    padding: '14px',
    borderRadius: '10px',
    border: '2px solid #ddd',
    fontSize: '16px',
    transition: 'all 0.3s ease',
    backgroundColor: '#fff',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  inputFocus: {
    border: '2px solid #4f46e5',
    boxShadow: '0 0 0 4px rgba(79, 70, 229, 0.15)',
  },
  inputError: {
    border: '2px solid #e74c3c',
    boxShadow: '0 0 0 4px rgba(231, 76, 60, 0.1)',
  },
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    cursor: 'not-allowed',
    opacity: '0.7',
  },
  inputSuccess: {
    border: '2px solid #27ae60',
    boxShadow: '0 0 0 4px rgba(39, 174, 96, 0.1)',
  },
  error: {
    color: '#e74c3c',
    fontSize: '13px',
    marginTop: '6px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  helper: {
    color: '#7f8c8d',
    fontSize: '13px',
    marginTop: '6px',
    fontStyle: 'italic',
  },
  icon: {
    width: '20px',
    height: '20px',
  },
  inputWrapper: {
    position: 'relative',
  },
  inputWithIcon: {
    paddingLeft: '45px',
  },
  iconLeft: {
    position: 'absolute',
    left: '15px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#95a5a6',
    fontSize: '18px',
  },
  iconRight: {
    position: 'absolute',
    right: '15px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '18px',
  },
  inputSmall: {
    padding: '10px',
    fontSize: '14px',
  },
  labelSmall: {
    fontSize: '13px',
    marginBottom: '6px',
  },
};

export default function Input({ 
  label, 
  type = "text", 
  error, 
  helperText,
  required,
  disabled,
  iconLeft,
  iconRight,
  size = "medium",
  success,
  fullWidth = true,
  ...props 
}) {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  // Determinar estilo del input según estado
  const getInputStyle = () => {
    let style = { ...styles.input };

    // Tamaño
    if (size === "small") {
      style = { ...style, ...styles.inputSmall };
    }

    // Ancho completo
    if (fullWidth) {
      style.width = '100%';
    }

    // Estado de focus
    if (isFocused && !disabled) {
      style = { ...style, ...styles.inputFocus };
    }

    // Estado de error
    if (error) {
      style = { ...style, ...styles.inputError };
    }

    // Estado de éxito
    if (success) {
      style = { ...style, ...styles.inputSuccess };
    }

    // Estado disabled
    if (disabled) {
      style = { ...style, ...styles.inputDisabled };
    }

    // Icono izquierdo
    if (iconLeft) {
      style = { ...style, ...styles.inputWithIcon };
    }

    return style;
  };

  // Iconos según tipo
  const getDefaultIcon = (type) => {
    const icons = {
      email: '📧',
      password: '🔒',
      search: '🔍',
      tel: '📱',
      url: '🌐',
      date: '📅',
      time: '⏰',
      number: '🔢',
    };
    return icons[type] || '✏️';
  };

  return (
    <div style={styles.container}>
      {/* Label */}
      {label && (
        <label style={styles.label}>
          {label}
          {required && (
            <span style={styles.labelRequired} aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      {/* Contenedor del input con iconos */}
      <div style={styles.inputWrapper}>
        {/* Icono izquierdo */}
        {iconLeft && (
          <span style={styles.iconLeft} aria-hidden="true">
            {typeof iconLeft === 'string' ? iconLeft : getDefaultIcon(type)}
          </span>
        )}

        {/* Input principal */}
        <input
          type={type}
          style={getInputStyle()}
          disabled={disabled}
          aria-invalid={!!error}
          aria-required={required}
          aria-describedby={error || helperText ? `${props.id}-helper` : undefined}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />

        {/* Icono derecho */}
        {iconRight && (
          <span style={styles.iconRight} aria-hidden="true">
            {iconRight}
          </span>
        )}
      </div>

      {/* Mensaje de error */}
      {error && (
        <span style={styles.error} id={`${props.id}-helper`} role="alert">
          ❌ {error}
        </span>
      )}

      {/* Mensaje de ayuda */}
      {!error && helperText && (
        <span style={styles.helper} id={`${props.id}-helper`}>
          ℹ️ {helperText}
        </span>
      )}
    </div>
  );
}