// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Areas from "./pages/Areas";
import Retos from "./pages/Retos";
import Progreso from "./pages/Progreso";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/areas" element={<Areas />} />
      <Route path="/retos/:area" element={<Retos />} />
      <Route path="/progreso" element={<Progreso />} />
    </Routes>
  );
}