// src/pages/Areas.jsx
import { Link } from "react-router-dom";
import AreaCard from "../components/AreaCard";

export default function Areas() {
  const areas = [
    { id: 1, nombre: "Matemáticas", retosDisponibles: 15 },
    { id: 2, nombre: "Lógica", color: "#4ecdc4", retosDisponibles: 12 },
    { id: 3, nombre: "Cultura General", retosDisponibles: 20 },
    { id: 4, nombre: "Programación", retosDisponibles: 10 }
  ];

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '30px' }}>
        <Link 
          to="/dashboard" 
          style={{ 
            color: '#4f46e5', 
            textDecoration: 'none',
            fontSize: '1rem',
            display: 'inline-block',
            marginBottom: '15px'
          }}
        >
          ← Volver al inicio
        </Link>
        <h2 style={{ fontSize: '2rem', color: '#2d3436', margin: '0 0 10px 0' }}>
          📚 Áreas de Conocimiento
        </h2>
        <p style={{ color: '#636e72', fontSize: '1.1rem' }}>
          Selecciona un área para comenzar a resolver retos y ganar puntos
        </p>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {areas.map(area => (
          <AreaCard key={area.id} area={area} />
        ))}
      </div>
    </div>
  );
}