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

const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutos

// Verificar si el usuario es admin
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
  const [user,    setUser]    = useState(undefined); // undefined = todavía cargando
  const [isAdmin, setIsAdmin] = useState(false);

  const inactivityTimer = useRef(null);

  /* ── Cerrar sesión ── */
  const logout = useCallback(async () => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    await supabase.auth.signOut();
  }, []);

  /* ── Timer de inactividad ── */
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(logout, INACTIVITY_LIMIT);
  }, [logout]);

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
    let mounted = true;

    // Escuchar cambios de auth — esto cubre tanto la carga inicial
    // como login/logout posteriores
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        const currentUser = session?.user || null;

        if (event === "SIGNED_OUT" || !currentUser) {
          if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
          setUser(null);
          setIsAdmin(false);
          return;
        }

        // SIGNED_IN o INITIAL_SESSION
        setUser(currentUser);
        const admin = await checkAdmin(currentUser.email);
        if (!mounted) return;
        setIsAdmin(admin);
        resetInactivityTimer();
      }
    );

    // Cargar sesión existente al montar
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;

      if (!session?.user) {
        setUser(null);
        setIsAdmin(false);
        return;
      }

      const admin = await checkAdmin(session.user.email);
      if (!mounted) return;
      setUser(session.user);
      setIsAdmin(admin);
      resetInactivityTimer();
    };

    initSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Mientras carga la sesión inicial
  if (user === undefined) {
    return (
      <div style={{
        display:"flex", flexDirection:"column",
        justifyContent:"center", alignItems:"center",
        height:"100vh", background:"#0f1117", gap:"16px"
      }}>
        <div style={{
          width:"44px", height:"44px",
          border:"4px solid #7c3aed",
          borderTopColor:"transparent",
          borderRadius:"50%",
          animation:"spin 0.8s linear infinite"
        }}/>
        <p style={{ fontFamily:"Poppins,sans-serif", color:"#64748b", fontSize:"0.9rem" }}>
          Cargando sesión...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <Routes>
      {/* Ruta raíz */}
      <Route path="/" element={
        !user
          ? <Login />
          : isAdmin
            ? <Navigate to="/admin"     replace />
            : <Navigate to="/dashboard" replace />
      }/>

      {/* Registro */}
      <Route path="/register" element={
        !user ? <Register /> : <Navigate to="/dashboard" replace />
      }/>

      {/* Callback OAuth */}
      <Route path="/auth/callback" element={
        !user
          ? <div style={{ display:"flex", justifyContent:"center", alignItems:"center", height:"100vh" }}>
              <p style={{ fontFamily:"sans-serif", color:"#64748b" }}>Iniciando sesión...</p>
            </div>
          : isAdmin
            ? <Navigate to="/admin"     replace />
            : <Navigate to="/dashboard" replace />
      }/>

      {/* Rutas de usuario normal */}
      <Route path="/dashboard"   element={user && !isAdmin ? <Dashboard />           : <Navigate to="/" replace />}/>
      <Route path="/areas"       element={user && !isAdmin ? <Areas />               : <Navigate to="/" replace />}/>
      <Route path="/retos/:area" element={user && !isAdmin ? <Retos />               : <Navigate to="/" replace />}/>
      <Route path="/progreso"    element={user && !isAdmin ? <Progreso />            : <Navigate to="/" replace />}/>
      <Route path="/profile"     element={user && !isAdmin ? <Profile />             : <Navigate to="/" replace />}/>
      <Route path="/salas"       element={user && !isAdmin ? <Salas user={user} />   : <Navigate to="/" replace />}/>

      {/* Ruta admin */}
      <Route path="/admin" element={
        user && isAdmin
          ? <AdminDashboard user={user} />
          : <Navigate to="/" replace />
      }/>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />}/>
    </Routes>
  );
}