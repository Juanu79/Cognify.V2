import React from "react";
import { Trophy, Star, Target, Zap } from "lucide-react";

export default function Progreso() {
  // Datos de ejemplo (luego los traeremos de Supabase)
  const stats = [
    { label: "Nivel Actual", value: "1", icon: <Zap className="text-yellow-500" />, color: "bg-yellow-50" },
    { label: "Puntos Totales", value: "500", icon: <Star className="text-blue-500" />, color: "bg-blue-50" },
    { label: "Retos Resueltos", value: "12", icon: <CheckCircle2 className="text-green-500" />, color: "bg-green-50" },
    { label: "Racha Actual", value: "3 días", icon: <Trophy className="text-purple-500" />, color: "bg-purple-50" },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen pt-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black text-purple-600 mb-8 italic text-center">Tu Progreso</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, index) => (
            <div key={index} className={`${stat.color} p-6 rounded-[2rem] border border-white shadow-sm flex flex-col items-center text-center`}>
              <div className="mb-3">{stat.icon}</div>
              <p className="text-xs font-black uppercase text-gray-400 tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-gray-800">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
          <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-2">
            <Target className="text-purple-600" /> Próximos Objetivos
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-2xl flex justify-between items-center">
              <span className="font-bold text-gray-600">Llegar al Nivel 2</span>
              <span className="text-purple-600 font-black">75%</span>
            </div>
            <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
              <div className="bg-purple-600 h-full w-[75%]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-componente rápido para el icono
function CheckCircle2({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/>
    </svg>
  );
}
