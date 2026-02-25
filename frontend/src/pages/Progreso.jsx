import React from "react";
import Navbar from "../components/Navbar";
import "../styles/global.css";

export default function Progreso() {
  return (
    <>
      <Navbar />
      <div className="container">
        <h1>Tu Progreso</h1>
        <div className="card">
          <h2>Nivel 3</h2>
          <p>65% completado</p>
        </div>
      </div>
    </>
  );
}