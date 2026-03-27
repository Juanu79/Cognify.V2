import { Link, useNavigate } from "react-router-dom";
import Input from "../components/Input";
import "../styles/auth.css";

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="auth-container">
      <form className="auth-box" onSubmit={handleLogin}>
        <h2>Iniciar Sesión</h2>

        <Input label="Correo" type="email" placeholder="correo@ejemplo.com" />
        <Input label="Contraseña" type="password" placeholder="********" />

        <button type="submit">Entrar</button>

        <p>
          ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
        </p>
      </form>
    </div>
  );
}
