import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./lib/supabaseClient";

import Login          from "./pages/Login";
import Register       from "./pages/Register";
import Dashboard      from "./pages/Dashboard";
import Areas          from "./pages/Areas";
import Retos          from "./pages/Retos";
import Progreso       from "./pages/Progreso";
import Profile        from "./pages/Profile";
import Salas          from "./pages/Salas";
import AdminDashboard from "./pages/AdminDashboard";

const checkAdmin = async (email) => {
  if (!email) return false;
  try {
    const { data, error } = await supabase
      .from("admins")
      .select("id")
      .eq("email", email)
      .single();
    return !error && !!data;
  } catch {
    return false;
  }
};

export default function App() {
  const [user,    setUser]    = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener sesión inicial de forma directa (evita esperar el evento)
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser) {
        const admin = await checkAdmin(currentUser.email);
        setIsAdmin(admin);
      }
      setLoading(false);
    };

    initSession();

    // Escuchar cambios de sesión posteriores (login, logout, refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser) {
        const admin = await checkAdmin(currentUser.email);
        setIsAdmin(admin);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ display:"flex", justifyContent:"center", alignItems:"center", height:"100vh" }}>
        <p style={{ fontFamily:"sans-serif", color:"#64748b" }}>Cargando sesión...</p>
      </div>
    );
  }

  return (
    <Routes>
      {/* Raíz: redirige según rol */}
      <Route path="/" element={
        !user
          ? <Login />
          : isAdmin
            ? <Navigate to="/admin" replace />
            : <Navigate to="/dashboard" replace />
      } />

      <Route path="/register" element={
        !user ? <Register /> : <Navigate to="/dashboard" replace />
      } />

      {/* Callback OAuth */}
      <Route path="/auth/callback" element={
        !user
          ? <div style={{ display:"flex", justifyContent:"center", alignItems:"center", height:"100vh" }}>
              <p style={{ fontFamily:"sans-serif", color:"#64748b" }}>Iniciando sesión...</p>
            </div>
          : isAdmin
            ? <Navigate to="/admin" replace />
            : <Navigate to="/dashboard" replace />
      } />

      {/* Rutas de usuario normal */}
      <Route path="/dashboard" element={user && !isAdmin ? <Dashboard />          : <Navigate to="/" replace />} />
      <Route path="/areas"     element={user && !isAdmin ? <Areas />              : <Navigate to="/" replace />} />
      <Route path="/retos/:area" element={user && !isAdmin ? <Retos />            : <Navigate to="/" replace />} />
      <Route path="/progreso"  element={user && !isAdmin ? <Progreso />           : <Navigate to="/" replace />} />
      <Route path="/profile"   element={user && !isAdmin ? <Profile />            : <Navigate to="/" replace />} />
      <Route path="/salas"     element={user && !isAdmin ? <Salas user={user} />  : <Navigate to="/" replace />} />

      {/* Ruta de admin */}
      <Route path="/admin" element={
        user && isAdmin
          ? <AdminDashboard user={user} />
          : <Navigate to="/" replace />
      } />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}