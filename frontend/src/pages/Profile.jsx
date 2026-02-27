import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { supabase } from "../lib/supabaseClient";
import { progressManager } from "../utils/progressManager";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Cargar datos del usuario
  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        setError("");
        
        // Verificar sesión
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !sessionData?.session) {
          navigate("/");
          return;
        }
        
        // Obtener datos del usuario
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sessionData.session.user.id)
          .single();
        
        if (userError) {
          // Crear perfil si no existe
          await supabase.from('profiles').insert({
            id: sessionData.session.user.id,
            email: sessionData.session.user.email,
            name: sessionData.session.user.email.split('@')[0]
          });
          
          setUser({
            name: sessionData.session.user.email.split('@')[0],
            email: sessionData.session.user.email
          });
          
          setName(sessionData.session.user.email.split('@')[0]);
          setEmail(sessionData.session.user.email);
        } else {
          setUser(userData);
          setName(userData.name || sessionData.session.user.email.split('@')[0]);
          setEmail(userData.email || sessionData.session.user.email);
        }
      } catch (err) {
        console.error("Error al cargar el perfil:", err);
        setError("Error al cargar tu perfil. Por favor, intenta iniciar sesión nuevamente.");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [navigate]);

  // Guardar cambios
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      // Actualizar perfil en Supabase
      const { error } = await supabase
        .from('profiles')
        .update({ name, email })
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Actualizar en localStorage
      localStorage.setItem('user', JSON.stringify({ name, email }));
      
      setSuccess("¡Perfil actualizado exitosamente!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error al actualizar el perfil:", err);
      setError(err.message || "Error al actualizar el perfil");
    } finally {
      setLoading(false);
    }
  };

  // Cerrar sesión
  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('user');
    navigate("/");
  };

  // Manejo de carga y errores
  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={loadingContainer}>
          <div style={loadingSpinner}></div>
          <p style={loadingText}>Cargando tu perfil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <div style={errorContainer}>
          <p style={errorText}>{error}</p>
          <button style={retryButton} onClick={() => window.location.reload()}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Si no hay usuario (redirigido)
  if (!user) {
    return (
      <div style={containerStyle}>
        <div style={errorContainer}>
          <p style={errorText}>No estás autenticado. Redirigiendo al inicio...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>Configuración de Perfil</h1>
          <p style={subtitleStyle}>
            Actualiza tus datos personales y preferencias
          </p>
        </div>
        
        <div style={cardStyle}>
          <div style={formGroup}>
            <label style={labelStyle}>Nombre Completo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
              placeholder="Tu nombre completo"
              required
            />
          </div>
          
          <div style={formGroup}>
            <label style={labelStyle}>Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              placeholder="tu@ejemplo.com"
              required
              disabled
            />
          </div>
          
          {success && (
            <div style={successMessage}>
              {success}
            </div>
          )}
          
          {error && (
            <div style={errorMessage}>
              {error}
            </div>
          )}
          
          <div style={buttonGroup}>
            <button 
              type="button" 
              style={cancelButton}
              onClick={() => navigate("/dashboard")}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              style={saveButton}
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </div>
        
        <div style={logoutSection}>
          <h2 style={sectionTitle}>Cerrar Sesión</h2>
          <p style={sectionDescription}>
            Al cerrar sesión, se cerrará tu cuenta en todos los dispositivos
          </p>
          <button 
            type="button" 
            style={logoutButton}
            onClick={handleLogout}
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </>
  );
}

/* ====== ESTILOS ====== */

const containerStyle = {
  maxWidth: "1200px",
  margin: "100px auto 60px",
  padding: "0 20px"
};

const headerStyle = {
  textAlign: "center",
  marginBottom: "40px"
};

const titleStyle = {
  fontSize: "2.6rem",
  marginBottom: "15px",
  color: "#1e293b",
  fontWeight: "800"
};

const subtitleStyle = {
  color: "#475569",
  fontSize: "1.2rem",
  maxWidth: "700px",
  margin: "0 auto"
};

const cardStyle = {
  backgroundColor: "#ffffff",
  padding: "30px",
  borderRadius: "16px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  marginBottom: "30px"
};

const formGroup = {
  marginBottom: "25px"
};

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  fontWeight: "600",
  color: "#2d3748"
};

const inputStyle = {
  width: "100%",
  padding: "12px 15px",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  fontSize: "1rem",
  transition: "border-color 0.3s"
};

const buttonGroup = {
  display: "flex",
  gap: "15px",
  marginTop: "25px",
  justifyContent: "flex-end"
};

const cancelButton = {
  padding: "12px 25px",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  backgroundColor: "#f8fafc",
  color: "#475569",
  fontWeight: "600",
  fontSize: "1rem",
  cursor: "pointer",
  transition: "all 0.3s"
};

const saveButton = {
  padding: "12px 25px",
  border: "none",
  borderRadius: "8px",
  backgroundColor: "#2563eb",
  color: "white",
  fontWeight: "600",
  fontSize: "1rem",
  cursor: "pointer",
  transition: "all 0.3s",
  boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)"
};

const successMessage = {
  background: "#dcfce7",
  borderLeft: "4px solid #22c55e",
  color: "#166534",
  padding: "12px 20px",
  borderRadius: "0 8px 8px 0",
  marginBottom: "25px",
  fontSize: "1.05rem",
  fontWeight: "500"
};

const errorMessage = {
  background: "#fee2e2",
  borderLeft: "4px solid #ef4444",
  color: "#b91c1c",
  padding: "12px 20px",
  borderRadius: "0 8px 8px 0",
  marginBottom: "25px",
  fontSize: "1.05rem",
  fontWeight: "500"
};

const logoutSection = {
  marginTop: "30px",
  padding: "25px",
  backgroundColor: "#f8fafc",
  borderRadius: "16px",
  border: "1px solid #e2e8f0"
};

const sectionTitle = {
  fontSize: "1.5rem",
  marginBottom: "15px",
  color: "#1e293b"
};

const sectionDescription = {
  color: "#475569",
  marginBottom: "20px"
};

const logoutButton = {
  width: "100%",
  padding: "14px",
  border: "none",
  borderRadius: "8px",
  backgroundColor: "#ef4444",
  color: "white",
  fontWeight: "600",
  fontSize: "1.1rem",
  cursor: "pointer",
  transition: "all 0.3s",
  boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)"
};

/* ====== ESTILOS DE CARGA Y ERRORES ====== */

const loadingContainer = {
  textAlign: "center",
  padding: "60px 0"
};

const loadingSpinner = {
  width: "40px",
  height: "40px",
  border: "4px solid #e2e8f0",
  borderTop: "4px solid #2563eb",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
  margin: "0 auto 20px"
};

const loadingText = {
  fontSize: "1.1rem",
  color: "#475569",
  fontWeight: "500"
};

const errorContainer = {
  textAlign: "center",
  padding: "40px",
  backgroundColor: "#fee2e2",
  borderRadius: "12px",
  border: "1px solid #ef4444"
};

const errorText = {
  fontSize: "1.2rem",
  color: "#b91c1c",
  marginBottom: "20px"
};

const retryButton = {
  padding: "10px 25px",
  backgroundColor: "#ef4444",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontWeight: "600",
  fontSize: "1rem",
  cursor: "pointer",
  transition: "all 0.3s"
};