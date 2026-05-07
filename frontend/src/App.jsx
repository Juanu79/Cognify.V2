import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./lib/supabaseClient"; 

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Areas from "./pages/Areas";
import Retos from "./pages/Retos";
import Progreso from "./pages/Progreso";
import Profile from "./pages/Profile";
import Salas from "./pages/Salas";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdmin = async (email) => {
    if (!email) return false;
    try {
      const { data, error } = await supabase
        .from("admins")
        .select("id")
        .eq("email", email)
        .single();
      if (error) return false;
      return !!data;
    } catch {
      return false;
    }
  };

  useEffect(() => {
  // Timeout de seguridad — si en 3s no dispara, quita el loading
  const timeout = setTimeout(() => setLoading(false), 3000);

  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
    clearTimeout(timeout);
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

  return () => {
    clearTimeout(timeout);
    subscription.unsubscribe();
  };
}, []);

  useEffect(() => {
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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Cargando sesión...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={
        !user ? <Login /> : isAdmin ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />
      } />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
      <Route path="/auth/callback" element={
        user ? (isAdmin ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />) : (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <p>Iniciando sesión...</p>
          </div>
        )
      } />
      <Route path="/dashboard" element={user && !isAdmin ? <Dashboard /> : <Navigate to="/" />} />
      <Route path="/areas" element={user && !isAdmin ? <Areas /> : <Navigate to="/" />} />
      <Route path="/retos/:area" element={user && !isAdmin ? <Retos /> : <Navigate to="/" />} />
      <Route path="/progreso" element={user && !isAdmin ? <Progreso /> : <Navigate to="/" />} />
      <Route path="/profile" element={user && !isAdmin ? <Profile /> : <Navigate to="/" />} />
      <Route path="/salas" element={user && !isAdmin ? <Salas user={user} /> : <Navigate to="/" />} />
      <Route path="/admin" element={user && isAdmin ? <AdminDashboard user={user} /> : <Navigate to="/" />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}


