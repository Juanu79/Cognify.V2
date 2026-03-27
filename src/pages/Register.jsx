import { Link, useNavigate } from "react-router-dom";
import Input from "../components/Input";
import "../styles/auth.css";

export default function Register() {
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    navigate("/");
  };

  return (
    <div className="auth-container">
      <form className="auth-box" onSubmit={handleRegister}>
        <h2>Registro</h2>

        <Input label="Nombre" type="text" placeholder="Tu nombre" />
        <Input label="Correo" type="email" placeholder="correo@ejemplo.com" />
        <Input label="Contraseña" type="password" placeholder="********" />

        <button type="submit">Crear cuenta</button>

        <p>
          ¿Ya tienes cuenta? <Link to="/">Inicia sesión</Link>
        </p>
      </form>
    </div>
  );
}
