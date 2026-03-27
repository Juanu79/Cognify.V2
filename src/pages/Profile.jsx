import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user?.user_metadata?.full_name) {
        setNewName(user.user_metadata.full_name);
      }
    };
    getUser();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.updateUser({
      data: { full_name: newName }
    });

    if (error) {
      setMessage("Error: " + error.message);
    } else {
      setMessage("¡Perfil actualizado con éxito!");
      // Recargar página para ver cambios en el Navbar
      setTimeout(() => window.location.reload(), 1500);
    }
    setLoading(false);
  };

  if (!user) return <div className="p-20 mt-10 text-center font-bold">Inicia sesión para ver tu perfil</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen pt-24">
      <div className="max-w-2xl mx-auto bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100">
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">👤</div>
          <h2 className="text-3xl font-black text-gray-800 italic">Tu Perfil</h2>
          <p className="text-gray-400 font-bold uppercase text-xs tracking-widest mt-2 italic">Configuración de cuenta</p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-3xl">
            <label className="text-xs text-gray-400 font-black uppercase mb-1 block">Nombre Completo / Apodo</label>
            <input 
              type="text" 
              className="w-full bg-transparent border-none text-lg font-bold text-gray-700 outline-none focus:ring-0 p-0"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Escribe tu nombre aquí..."
            />
          </div>

          <div className="bg-gray-50 p-6 rounded-3xl opacity-60">
            <p className="text-xs text-gray-400 font-black uppercase mb-1">Correo Electrónico (No editable)</p>
            <p className="text-lg font-bold text-gray-700">{user.email}</p>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`w-full py-4 text-white font-black rounded-2xl shadow-lg transition-all ${
              loading ? "bg-gray-400" : "bg-purple-600 hover:scale-[1.02] shadow-purple-100"
            }`}
          >
            {loading ? "GUARDANDO..." : "GUARDAR CAMBIOS"}
          </button>

          {message && (
            <p className={`text-center font-bold text-sm ${message.includes("Error") ? "text-red-500" : "text-green-500"}`}>
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
