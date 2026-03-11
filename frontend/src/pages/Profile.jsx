import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { supabase } from "../lib/supabaseClient";

export default function Profile() {

  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();


  /* ============================= */
  /* CARGAR USUARIO               */
  /* ============================= */

  useEffect(() => {

    const loadUser = async () => {

      try {

        const { data } = await supabase.auth.getUser();

        if (!data.user) {
          navigate("/");
          return;
        }

        const currentUser = data.user;

        const displayName =
          currentUser.user_metadata?.full_name ||
          currentUser.user_metadata?.name ||
          currentUser.email.split("@")[0];

        setUser(currentUser);
        setName(displayName);
        setEmail(currentUser.email);

      } catch (err) {

        console.error(err);
        setError("Error al cargar el perfil");

      } finally {

        setLoading(false);

      }

    };

    loadUser();

  }, []);



  /* ============================= */
  /* GUARDAR CAMBIOS              */
  /* ============================= */

  const handleSave = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      const { error } = await supabase
        .from("usuarios")
        .update({ name })
        .eq("id", user.id);

      if (error) throw error;

      setSuccess("Perfil actualizado correctamente");

      setTimeout(() => setSuccess(""), 3000);

    } catch (err) {

      setError("Error al guardar cambios");

    } finally {

      setLoading(false);

    }

  };



  /* ============================= */
  /* CERRAR SESION                */
  /* ============================= */

  const handleLogout = async () => {

    await supabase.auth.signOut();
    navigate("/");

  };



  /* ============================= */
  /* LOADING                      */
  /* ============================= */

  if (loading) {

    return (
      <div style={containerStyle}>
        <p style={{ textAlign: "center" }}>Cargando perfil...</p>
      </div>
    );

  }



  /* ============================= */
  /* AVATAR                       */
  /* ============================= */

  const avatar =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    null;



  return (

    <>

      <Navbar />

      <div style={containerStyle}>

        <h1 style={titleStyle}>Perfil de Usuario</h1>



        {/* TARJETA PERFIL */}

        <div style={cardProfile}>

          {avatar && (
            <img
              src={avatar}
              alt="avatar"
              style={avatarStyle}
            />
          )}

          <h2 style={nameStyle}>{name}</h2>

          <p style={emailStyle}>{email}</p>

          <p style={providerStyle}>
            Login con: {user.app_metadata?.provider}
          </p>

        </div>



        {/* FORMULARIO */}

        <form style={cardStyle} onSubmit={handleSave}>

          <div style={formGroup}>
            <label style={labelStyle}>Nombre</label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
            />
          </div>


          <div style={formGroup}>
            <label style={labelStyle}>Correo</label>

            <input
              type="email"
              value={email}
              disabled
              style={inputStyle}
            />
          </div>



          {success && (
            <div style={successStyle}>{success}</div>
          )}

          {error && (
            <div style={errorStyle}>{error}</div>
          )}



          <button style={buttonStyle}>
            Guardar Cambios
          </button>

        </form>



        {/* LOGOUT */}

        <div style={logoutSection}>

          <button
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



/* ============================= */
/* ESTILOS                       */
/* ============================= */

const containerStyle = {

  maxWidth: "900px",
  margin: "120px auto",
  padding: "20px"

};

const titleStyle = {

  textAlign: "center",
  fontSize: "2.5rem",
  marginBottom: "40px",
  color: "#2d3436"

};


const cardProfile = {

  textAlign: "center",
  background: "#fff",
  padding: "30px",
  borderRadius: "16px",
  marginBottom: "30px",
  boxShadow: "0 4px 15px rgba(0,0,0,0.08)"

};

const avatarStyle = {

  width: "120px",
  height: "120px",
  borderRadius: "50%",
  objectFit: "cover",
  marginBottom: "15px",
  border: "4px solid #7c3aed"

};

const nameStyle = {

  fontSize: "1.6rem",
  fontWeight: "700"

};

const emailStyle = {

  color: "#636e72"

};

const providerStyle = {

  marginTop: "10px",
  color: "#7c3aed",
  fontWeight: "600"

};


const cardStyle = {

  background: "#fff",
  padding: "30px",
  borderRadius: "16px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)"

};

const formGroup = {

  marginBottom: "20px"

};

const labelStyle = {

  fontWeight: "600"

};

const inputStyle = {

  width: "100%",
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #ddd"

};

const buttonStyle = {

  width: "100%",
  padding: "14px",
  border: "none",
  borderRadius: "10px",
  background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
  color: "white",
  fontWeight: "700",
  cursor: "pointer"

};

const logoutSection = {

  marginTop: "40px"

};

const logoutButton = {

  width: "100%",
  padding: "14px",
  borderRadius: "10px",
  border: "none",
  background: "#ef4444",
  color: "white",
  fontWeight: "700",
  cursor: "pointer"

};

const successStyle = {

  background: "#dcfce7",
  padding: "10px",
  borderRadius: "8px",
  marginBottom: "15px"

};

const errorStyle = {

  background: "#fee2e2",
  padding: "10px",
  borderRadius: "8px",
  marginBottom: "15px"

};