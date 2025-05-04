import React, { useState } from "react";
import "./styles/Login.css";
import { useNavigate } from "react-router-dom";
import { loginUser, loginWithGoogle } from "../services/auth/authService";
import { getUserHome } from "../services/auth/homeService";
import { useHome } from "../HomeContext"; // Importar el contexto del hogar
import { useLoading } from "../context/LoadingContext"; // Importar el contexto de carga

const { version } = require("../../package.json");

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [setError] = useState("");
  const { setCurrentHome } = useHome(); // Usar el contexto del hogar
  const { setLoading } = useLoading(); // Usar el contexto de carga
  const navigate = useNavigate();

  // Manejar el inicio de sesión con correo y contraseña
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Activar el indicador de carga
    try {
      const user = await loginUser(email, password); // Iniciar sesión
      const home = await getUserHome(user.uid); // Verificar si el usuario ya tiene un hogar

      if (home) {
        setCurrentHome(home); // Guardar el hogar actual en el contexto
        navigate("/dashboard", { state: { homeId: home.id } }); // Redirigir al Dashboard
      } else {
        navigate("/home"); // Mostrar opciones para crear o vincular un hogar
      }
    } catch (err) {
      setError("Error al iniciar sesión: " + err.message);
    } finally {
      setLoading(false); // Desactivar el indicador de carga
    }
  };

  // Manejar el inicio de sesión con Google
  const handleGoogleLogin = async () => {
    setLoading(true); // Activar el indicador de carga
    try {
      const user = await loginWithGoogle(); // Iniciar sesión con Google
      // console.log("Usuario autenticado con Google:", user); // Verificar el usuario autenticado

      const home = await getUserHome(user.uid); // Verificar si el usuario ya tiene un hogar

      if (home) {
        setCurrentHome(home); // Guardar el hogar actual en el contexto
        navigate("/dashboard", { state: { homeId: home.id } }); // Redirigir al Dashboard
      } else {
        navigate("/home"); // Mostrar opciones para crear o vincular un hogar
      }
    } catch (err) {
      console.error("Error con el inicio de sesión de Google:", err.message);
      setError("Error con el inicio de sesión de Google: " + err.message);
    } finally {
      setLoading(false); // Desactivar el indicador de carga
    }
  };

  const handleRegisterRedirect = () => {
    navigate("/register"); // Redirigir al formulario de registro
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Iniciar sesión</h2>
        <p className="login-subtitle"></p>
        <button className="login-google-button" onClick={handleGoogleLogin}>
          <img
            className="google-icon"
            src="https://raw.githubusercontent.com/Loopple/loopple-public-assets/main/motion-tailwind/img/logos/logo-google.png"
            alt="Google"
          />
          Iniciar sesión con Google
        </button>
        <div className="login-divider">
          <hr className="divider-line" />
          <span className="divider-text">o</span>
          <hr className="divider-line" />
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="email" className="login-label">
            Correo electrónico
          </label>
          <input
            id="email"
            className="login-input"
            type="email"
            placeholder="correo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label htmlFor="password" className="login-label">
            Contraseña
          </label>
          <input
            id="password"
            className="login-input"
            type="password"
            placeholder="Ingresa tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {/* <div className="login-options">
            <a href="#" className="login-forgot-password">
              ¿Olvidaste tu contraseña?
            </a>
          </div> */}
          <button className="login-button" type="submit">
            Iniciar sesión
          </button>
        </form>
        <p className="login-register">
          ¿No tienes cuenta?{" "}
          <a href="#" onClick={handleRegisterRedirect}>
            Regístrate aquí
          </a>
        </p>
        <p className="app-version">Versión: {version}</p>
      </div>
    </div>
  );
};

export default Login;