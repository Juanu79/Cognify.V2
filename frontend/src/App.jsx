import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./lib/supabaseClient"; 

// Importación de páginas
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Areas from "./pages/Areas";
import Retos from "./pages/Retos";
import Progreso from "./pages/Progreso";
import Profile from "./pages/Profile";
import History from "./pages/History";
import Salas from "./pages/Salas";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Obtener la sesión activa al cargar la aplicación
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };

    getInitialSession();

    // 2. Escuchar cambios en tiempo real (Login, Logout, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    // Limpieza al desmontar el componente
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Evita mostrar las rutas mientras se verifica si hay un usuario
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Cargando sesión...</p>
      </div>
    );
  }

  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />

      {/* Rutas Privadas (Redirigen a "/" si no hay usuario) */}
      <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/" />} />
      <Route path="/areas" element={user ? <Areas /> : <Navigate to="/" />} />
      <Route path="/retos/:area" element={user ? <Retos /> : <Navigate to="/" />} />
      <Route path="/progreso" element={user ? <Progreso /> : <Navigate to="/" />} />
      <Route path="/profile" element={user ? <Profile /> : <Navigate to="/" />} />
      <Route path="/history" element={user ? <History /> : <Navigate to="/" />} />
      <Route path="/salas" element={user ? <Salas user={user} /> : <Navigate to="/" />} />

      {/* Redirección por defecto si la ruta no existe */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}