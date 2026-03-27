import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const linkStyle = { textDecoration: "none", color: "#64748b", fontWeight: "600", fontSize: "15px" };
  return (
    <nav style={{ 
      background: "#fff", height: "75px", display: "flex", alignItems: "center", 
      justifyContent: "space-between", padding: "0 50px", borderBottom: "1px solid #f1f5f9",
      position: "sticky", top: 0, zIndex: 1000, boxShadow: "0 4px 12px rgba(0,0,0,0.03)"
    }}>
      <div style={{ color: "#7c3aed", fontSize: "26px", fontWeight: "900", letterSpacing: "-1px" }}>Cognify</div>
      <div style={{ display: "flex", gap: "35px" }}>
        <Link to="/dashboard" style={linkStyle}>Dashboard</Link>
        <Link to="/areas" style={linkStyle}>Áreas</Link>
        <Link to="/progreso" style={linkStyle}>Progreso</Link>
      </div>
    </nav>
  );
}
