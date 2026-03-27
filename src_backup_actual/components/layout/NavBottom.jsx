import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, LayoutGrid, Trophy, User } from "lucide-react";

export default function NavBottom() {
  const location = useLocation();
  const navItems = [
    { name: "Inicio", path: "/dashboard", icon: Home },
    { name: "Retos", path: "/retos", icon: LayoutGrid },
    { name: "Logros", path: "/progreso", icon: Trophy },
    { name: "Perfil", path: "/perfil", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-[100]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link key={item.path} to={item.path} className={`flex flex-col items-center gap-1 ${isActive ? "text-purple-600" : "text-gray-400"}`}>
            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-bold uppercase">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
