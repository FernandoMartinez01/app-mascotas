import React, { useState } from "react";
import "./styles/Login.css";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth"; // Importar getAuth
import { app } from "../firebaseConfig"; // Importar la configuración de Firebase
import { loginUser, loginWithGoogle, getUserHome, createHome, linkToHome } from "../authService";
import { useHome } from "../HomeContext"; // Importar el contexto del hogar
import { useLoading } from "../context/LoadingContext"; // Importar el contexto de carga

const { version } = require("../../package.json");
const auth = getAuth(app); // Inicializar auth

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showHomeOptions, setShowHomeOptions] = useState(false); // Controla si se muestran las opciones de hogar
  const [homeName, setHomeName] = useState(""); // Nombre del hogar para crear
  const [homeCode, setHomeCode] = useState(""); // Código del hogar para vincular
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

  // Manejar la creación de un nuevo hogar
  const handleCreateHome = async () => {
    setLoading(true); // Activar el indicador de carga
    try {
      const userId = auth.currentUser?.uid; // Usar el usuario autenticado actual
      if (!userId) {
        throw new Error("No se encontró un usuario autenticado. Por favor, inicia sesión nuevamente.");
      }

      const homeId = await createHome(userId, homeName); // Crear un nuevo hogar
      setCurrentHome({ id: homeId, name: homeName }); // Guardar el nuevo hogar en el contexto
      navigate("/mascota", { state: { homeId } }); // Redirigir a Mascota.js con el nuevo hogar
    } catch (err) {
      setError("Error al crear el hogar: " + err.message);
    } finally {
      setLoading(false); // Desactivar el indicador de carga
    }
  };

  // Manejar la vinculación a un hogar existente
  const handleLinkToHome = async () => {
    setLoading(true); // Activar el indicador de carga
    try {
      const userId = auth.currentUser?.uid; // Usar el usuario autenticado actual
      if (!userId) {
        throw new Error("No se encontró un usuario autenticado. Por favor, inicia sesión nuevamente.");
      }

      await linkToHome(homeCode, userId); // Vincular al hogar existente
      setCurrentHome({ id: homeCode }); // Guardar el hogar vinculado en el contexto
      navigate("/dashboard", { state: { homeId: homeCode } }); // Redirigir al Dashboard con el hogar vinculado
    } catch (err) {
      setError("Error al vincular al hogar: " + err.message);
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
        {!showHomeOptions ? (
          <>
            <form className="login-form" onSubmit={handleSubmit}>
              <input
                className="login-input"
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                className="login-input"
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button className="login-button" type="submit">Iniciar sesión</button>
            </form>
            <button className="login-google-button" onClick={handleGoogleLogin}>
              Iniciar sesión con Google
            </button>
            <button className="login-register-button" onClick={handleRegisterRedirect}>
              Registrarse
            </button>
            {error && <p className="login-error">{error}</p>}
          </>
        ) : (
          <>
            <h3 className="login-home-options-title">Elige una opción para continuar</h3>
            <div className="login-home-option">
              <h4 className="login-home-option-title">Crear un nuevo hogar</h4>
              <input
                className="login-input"
                type="text"
                placeholder="Nombre del hogar"
                value={homeName}
                onChange={(e) => setHomeName(e.target.value)}
              />
              <button className="login-button" onClick={handleCreateHome}>Crear hogar</button>
            </div>
            <div className="login-home-option">
              <h4 className="login-home-option-title">Vincularse a un hogar existente</h4>
              <input
                className="login-input"
                type="text"
                placeholder="Código del hogar"
                value={homeCode}
                onChange={(e) => setHomeCode(e.target.value)}
              />
              <button className="login-button" onClick={handleLinkToHome}>Vincular hogar</button>
            </div>
            <button className="login-back-button" onClick={() => setShowHomeOptions(false)}>
              Volver
            </button>
          </>
        )}
        {/* Mostrar la versión de la app */}
        <p className="app-version">Versión: {version}</p>
      </div>
    </div>
  );
};

export default Login;