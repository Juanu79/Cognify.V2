import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import RetoCard from "../components/RetoCard";

export default function Retos() {
  const { area } = useParams();

  const retos = [
    { id: 1, titulo: "Reto básico", dificultad: "Fácil", puntos: 10 },
    { id: 2, titulo: "Reto intermedio", dificultad: "Media", puntos: 20 },
    { id: 3, titulo: "Reto avanzado", dificultad: "Difícil", puntos: 30 }
  ];

  return (
    <>
      <Navbar />
      <div style={{ padding: "20px" }}>
        <h2>Retos de {area}</h2>
        {retos.map(reto => (
          <RetoCard key={reto.id} reto={reto} />
        ))}
      </div>
    </>
  );
}
