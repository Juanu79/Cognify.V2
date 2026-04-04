import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import Navbar from "../components/Navbar";

// Color por área
const AREA_COLORS = {
  "Matemáticas": "#ff6b6b",
  "Lógica":      "#4ecdc4",
  "Programación":"#9b59b6",
  "Memoria":     "#f39c12",
};
const DEFAULT_COLORS = ["#e74c3c","#3498db","#2ecc71","#e67e22","#9b59b6","#1abc9c"];

export default function Areas() {
  const [areas,   setAreas]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    const cargarAreas = async () => {
      try {
        // Traer áreas con conteo de retos
        const { data, error } = await supabase
          .from("areas")
          .select(`
            id,
            nombre,
            descripcion,
            retos (count)
          `)
          .order("nombre");

        if (error) throw error;
        setAreas(data || []);
      } catch (err) {
        console.error("Error cargando áreas:", err);
        setError("No se pudieron cargar las áreas.");
      } finally {
        setLoading(false);
      }
    };

    cargarAreas();
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={loadingWrap}>
          <div style={spinner} />
          <p style={{ color: "#64748b", fontFamily: "Poppins, sans-serif" }}>
            Cargando áreas...
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap');`}</style>
      <Navbar />

      <div style={containerStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>Áreas de Conocimiento</h1>
          <p style={subtitleStyle}>
            Selecciona un área para comenzar a resolver retos y ganar puntos
          </p>
        </div>

        {error && <div style={errorBox}>{error}</div>}

        <div style={gridStyle}>
          {areas.map((area, idx) => {
            const color  = AREA_COLORS[area.nombre] || DEFAULT_COLORS[idx % DEFAULT_COLORS.length];
            const count  = area.retos?.[0]?.count ?? 0;

            return (
              <Link
                key={area.id}
                to={`/retos/${encodeURIComponent(area.nombre)}`}
                style={{ ...cardStyle, backgroundColor: color }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow = "0 15px 30px rgba(0,0,0,0.25)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = cardStyle.boxShadow;
                }}
              >
                <h3 style={cardTitle}>{area.nombre}</h3>
                <p style={cardSubtitle}>
                  {count > 0 ? `${count} retos disponibles` : "Próximamente"}
                </p>
                {area.descripcion && (
                  <p style={cardDesc}>{area.descripcion}</p>
                )}
                <div style={badgeStyle}>+XP por reto</div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}

/* ── ESTILOS ── */
const loadingWrap = {
  display: "flex", flexDirection: "column",
  alignItems: "center", justifyContent: "center",
  height: "80vh", gap: "16px"
};
const spinner = {
  width: "40px", height: "40px",
  border: "4px solid #7c3aed",
  borderTopColor: "transparent",
  borderRadius: "50%",
  animation: "spin 0.8s linear infinite"
};
const containerStyle = {
  maxWidth: "1200px",
  margin: "100px auto 60px",
  padding: "0 20px",
  fontFamily: "Poppins, sans-serif"
};
const headerStyle  = { textAlign: "center", marginBottom: "50px" };
const titleStyle   = { fontSize: "2.8rem", marginBottom: "15px", color: "#2d3436", fontWeight: "800" };
const subtitleStyle = { color: "#636e72", fontSize: "1.1rem", maxWidth: "600px", margin: "0 auto" };
const errorBox     = { background: "#ffe5e5", color: "#b91c1c", padding: "12px 16px", borderRadius: "8px", marginBottom: "20px" };
const gridStyle    = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "30px" };
const cardStyle    = {
  textDecoration: "none", color: "white",
  padding: "35px 30px", borderRadius: "20px",
  transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)",
  boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
  display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center"
};
const cardTitle    = { fontSize: "1.8rem", marginBottom: "10px", fontWeight: "700" };
const cardSubtitle = { fontSize: "1rem", opacity: "0.9", marginBottom: "8px", fontWeight: "500" };
const cardDesc     = { fontSize: "0.85rem", opacity: "0.8", marginBottom: "16px" };
const badgeStyle   = {
  background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)",
  padding: "6px 18px", borderRadius: "30px",
  fontSize: "0.9rem", fontWeight: "700", marginTop: "8px"
};