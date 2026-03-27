import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Retos from "./pages/Retos";

export default function App() {
  return (
    <div style={{ backgroundColor: "#fdfdff", minHeight: "100vh", fontFamily: "Inter, system-ui, sans-serif" }}>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/areas" element={<Retos />} />
      </Routes>
    </div>
  );
}
