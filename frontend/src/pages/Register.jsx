import React, { useState } from "react";
import styled from "styled-components";
import { supabase } from "../lib/supabaseClient";
import { Link } from "react-router-dom";

export default function Register() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Registro con email
  const handleRegister = async (e) => {
    e.preventDefault();

    const { error } = await supabase.auth.signUp({
      email: email,
      password: password
    });

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("Cuenta creada. Revisa tu correo para confirmar.");
    }
  };

  // Login con Google
  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google"
    });
  };

  // Login con GitHub
  const handleGithub = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "github"
    });
  };

  return (
    <Wrapper>

      <div className="container">

        <h1 className="logo">Cognify</h1>

        <h2 className="title">Crear cuenta</h2>

        <form onSubmit={handleRegister}>

          <input
            type="email"
            placeholder="Correo electrónico"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Contraseña"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" className="mainBtn">
            Registrarse
          </button>

        </form>

        <p className="divider">O continúa con</p>

        <div className="social">

          <button onClick={handleGoogle} className="socialBtn">
            Google
          </button>

          <button onClick={handleGithub} className="socialBtn">
            GitHub
          </button>

        </div>

        <p className="loginLink">
          ¿Ya tienes cuenta? <Link to="/">Inicia sesión</Link>
        </p>

      </div>

    </Wrapper>
  );
}

const Wrapper = styled.div`

display:flex;
justify-content:center;
align-items:center;
height:100vh;
background:#0f0f0f;

.container{
width:350px;
background:#121212;
padding:40px;
border-radius:20px;
border:1px solid #3b0a6b;
box-shadow:0px 20px 40px rgba(128,0,255,0.3);
text-align:center;
}

.logo{
color:#d4af37;
font-size:32px;
margin-bottom:10px;
}

.title{
color:#a855f7;
margin-bottom:20px;
}

input{
width:100%;
padding:12px;
margin:10px 0;
border-radius:10px;
border:none;
background:#1c1c1c;
color:white;
}

input:focus{
outline:none;
border:1px solid #a855f7;
}

.mainBtn{
width:100%;
padding:12px;
margin-top:15px;
border:none;
border-radius:10px;
background:linear-gradient(45deg,#7e22ce,#a855f7);
color:white;
font-weight:bold;
cursor:pointer;
}

.divider{
margin-top:20px;
color:#aaa;
font-size:12px;
}

.social{
display:flex;
gap:10px;
margin-top:10px;
}

.socialBtn{
flex:1;
padding:10px;
border:none;
border-radius:10px;
background:#1c1c1c;
color:white;
cursor:pointer;
border:1px solid #333;
}

.socialBtn:hover{
border:1px solid #a855f7;
}

.loginLink{
margin-top:20px;
font-size:12px;
color:#aaa;
}

.loginLink a{
color:#a855f7;
text-decoration:none;
}

`;