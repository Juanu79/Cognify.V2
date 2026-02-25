import React from "react";
import { Link } from "react-router-dom";
import "../styles/global.css";

export default function Navbar() {
  return (
    <div className="navbar">
      <h2>Cognify</h2>
      <div>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/areas">Áreas</Link>
        <Link to="/progreso">Progreso</Link>
      </div>
    </div>
  );
}