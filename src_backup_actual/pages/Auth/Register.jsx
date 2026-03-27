import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleEmailRegister = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else {
      alert("¡Cuenta creada! Revisa tu correo o inicia sesión.");
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-500 to-purple-800 flex items-center justify-center p-6">
      <div className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-md text-center">
        <h1 className="text-4xl font-black text-slate-800 mb-2 tracking-tight">Únete</h1>
        <p className="text-slate-400 font-semibold mb-8">Crea tu cuenta en Cognify</p>
        
        <form onSubmit={handleEmailRegister} className="space-y-4">
          <input type="text" placeholder="Nombre completo" className="w-full p-5 bg-slate-50 border-none rounded-2xl outline-none" required />
          <input type="email" placeholder="Correo electrónico" className="w-full p-5 bg-slate-50 border-none rounded-2xl outline-none" onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Contraseña" className="w-full p-5 bg-slate-50 border-none rounded-2xl outline-none" onChange={(e) => setPassword(e.target.value)} required />
          
          <button className="w-full bg-[#a855f7] hover:bg-[#9333ea] text-white font-black py-5 rounded-2xl shadow-lg transition-all active:scale-95 text-xl mt-4">Crear cuenta</button>
        </form>

        <p className="mt-8 text-slate-500 font-bold">
          ¿Ya tienes cuenta? <Link to="/" className="text-purple-600 hover:underline">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
