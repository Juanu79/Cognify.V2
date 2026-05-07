import React, { useEffect, useState, useRef, useCallback } from "react";
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

const INACTIVITY_LIMIT = 5 * 60 * 1000; // 5 minutos en ms

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

  const inactivityTimer = useRef(null);
  const userRef = useRef(null); // ref para acceder al user actual dentro de callbacks

  /* ── Cerrar sesión ── */
  const logout = useCallback(async () => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (userRef.current) localStorage.removeItem(`cognify_session_${userRef.current.id}`);
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
  }, []);

  /* ── Resetear timer de inactividad ── */
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      logout();
    }, INACTIVITY_LIMIT);
  }, [logout]);

  /* ── Escuchar eventos de actividad ── */
  useEffect(() => {
    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "click"];
    events.forEach(e => window.addEventListener(e, resetInactivityTimer, { passive: true }));
    return () => {
      events.forEach(e => window.removeEventListener(e, resetInactivityTimer));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [resetInactivityTimer]);

  /* ── Sesión principal ── */
  useEffect(() => {
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user || null;
      userRef.current = currentUser;
      setUser(currentUser);
      if (currentUser) {
        const admin = await checkAdmin(currentUser.email);
        setIsAdmin(admin);
        resetInactivityTimer();
      }
      setLoading(false);
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user || null;

      // ── Detectar sesión duplicada (mismo usuario, otra pestaña/dispositivo) ──
      if (event === "SIGNED_IN" && currentUser) {
        const sessionKey = `cognify_session_${currentUser.id}`;
        const prevTimestamp = localStorage.getItem(sessionKey);
        const now = Date.now();

        if (prevTimestamp && now - parseInt(prevTimestamp) > 3000) {
          // Otra sesión activa detectada → cerrar esta instancia
          localStorage.removeItem(sessionKey);
          await supabase.auth.signOut();
          alert("⚠️ Tu sesión fue cerrada porque iniciaste sesión en otro lugar.");
          setUser(null);
          setIsAdmin(false);
          setLoading(false);
          return;
        }
        localStorage.setItem(sessionKey, now.toString());
      }

      if (event === "SIGNED_OUT") {
        if (userRef.current) localStorage.removeItem(`cognify_session_${userRef.current.id}`);
        if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
        userRef.current = null;
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      userRef.current = currentUser;
      setUser(currentUser);

      if (currentUser) {
        const admin = await checkAdmin(currentUser.email);
        setIsAdmin(admin);
        resetInactivityTimer();
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

      <Route path="/auth/callback" element={
        !user
          ? <div style={{ display:"flex", justifyContent:"center", alignItems:"center", height:"100vh" }}>
              <p style={{ fontFamily:"sans-serif", color:"#64748b" }}>Iniciando sesión...</p>
            </div>
          : isAdmin
            ? <Navigate to="/admin" replace />
            : <Navigate to="/dashboard" replace />
      } />

      <Route path="/dashboard"   element={user && !isAdmin ? <Dashboard />         : <Navigate to="/" replace />} />
      <Route path="/areas"       element={user && !isAdmin ? <Areas />             : <Navigate to="/" replace />} />
      <Route path="/retos/:area" element={user && !isAdmin ? <Retos />             : <Navigate to="/" replace />} />
      <Route path="/progreso"    element={user && !isAdmin ? <Progreso />          : <Navigate to="/" replace />} />
      <Route path="/profile"     element={user && !isAdmin ? <Profile />           : <Navigate to="/" replace />} />
      <Route path="/salas"       element={user && !isAdmin ? <Salas user={user} /> : <Navigate to="/" replace />} />

      <Route path="/admin" element={
        user && isAdmin
          ? <AdminDashboard user={user} />
          : <Navigate to="/" replace />
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}