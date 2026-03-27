import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else navigate("/dashboard");
  };

  const handleSocialLogin = async (provider) => {
    const { error } = await supabase.auth.signInWithOAuth({ provider });
    if (error) alert(error.message);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-500 to-purple-800 flex items-center justify-center p-6">
      <div className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-md transform transition-all">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black text-gray-800 tracking-tight italic">Cognify</h1>
          <p className="text-gray-400 mt-3 font-semibold">¡Qué bueno verte de nuevo!</p>
        </div>
        
        <form onSubmit={handleEmailLogin} className="space-y-6">
          <input type="email" placeholder="Correo electrónico" className="w-full p-5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-purple-500 focus:outline-none transition-all" onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Contraseña" className="w-full p-5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-purple-500 focus:outline-none transition-all" onChange={(e) => setPassword(e.target.value)} required />
          <button className="w-full bg-[#00c985] hover:bg-[#00b377] text-white font-black py-5 rounded-2xl shadow-[0_10px_20px_rgba(0,201,133,0.3)] transition-all active:scale-95 text-xl mt-4">Entrar</button>
        </form>

        <div className="relative my-8 text-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
          <span className="relative bg-white px-4 text-sm text-gray-400 font-medium">o continuar con</span>
        </div>

        <div className="flex gap-4">
          <button onClick={() => handleSocialLogin("google")} className="w-full flex justify-center items-center gap-2 p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-2xl transition-all">
            <img src="https://authjs.dev/img/providers/google.svg" alt="Google" className="h-6 w-6" /> Google
          </button>
          <button onClick={() => handleSocialLogin("github")} className="w-full flex justify-center items-center gap-2 p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-2xl transition-all">
            <img src="https://authjs.dev/img/providers/github.svg" alt="GitHub" className="h-6 w-6" /> GitHub
          </button>
        </div>

        <p className="text-center mt-10 text-gray-500 font-bold">¿No tienes cuenta? <Link to="/register" className="text-purple-600 font-bold hover:underline">Regístrate</Link></p>
      </div>
    </div>
  );
}
