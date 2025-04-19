import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth"; // Importar getAuth
import { app } from "../firebaseConfig"; // Importar la configuración de Firebase
import { loginUser, loginWithGoogle, getUserHome, createHome, linkToHome } from "../authService";
import { useHome } from "../HomeContext"; // Importar el contexto del hogar

const auth = getAuth(app); // Inicializar auth

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showHomeOptions, setShowHomeOptions] = useState(false); // Controla si se muestran las opciones de hogar
  const [homeName, setHomeName] = useState(""); // Nombre del hogar para crear
  const [homeCode, setHomeCode] = useState(""); // Código del hogar para vincular
  const { setCurrentHome } = useHome(); // Usar el contexto del hogar
  const navigate = useNavigate();

  // Manejar el inicio de sesión con correo y contraseña
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await loginUser(email, password); // Iniciar sesión
      const home = await getUserHome(user.uid); // Verificar si el usuario ya tiene un hogar

      if (home) {
        setCurrentHome(home); // Guardar el hogar actual en el contexto
        navigate("/dashboard", { state: { homeId: home.id } }); // Redirigir al Dashboard
      } else {
        setShowHomeOptions(true); // Mostrar opciones para crear o vincular un hogar
      }
    } catch (err) {
      setError("Error al iniciar sesión: " + err.message);
    }
  };

  // Manejar el inicio de sesión con Google
  const handleGoogleLogin = async () => {
    try {
      const user = await loginWithGoogle(); // Iniciar sesión con Google
      console.log("Usuario autenticado con Google:", user); // Verificar el usuario autenticado
  
      const home = await getUserHome(user.uid); // Verificar si el usuario ya tiene un hogar
  
      if (home) {
        setCurrentHome(home); // Guardar el hogar actual en el contexto
        navigate("/dashboard", { state: { homeId: home.id } }); // Redirigir al Dashboard
      } else {
        setShowHomeOptions(true); // Mostrar opciones para crear o vincular un hogar
      }
    } catch (err) {
      console.error("Error con el inicio de sesión de Google:", err.message);
      setError("Error con el inicio de sesión de Google: " + err.message);
    }
  };

  // Manejar la creación de un nuevo hogar
  const handleCreateHome = async () => {
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
    }
  };

  // Manejar la vinculación a un hogar existente
  const handleLinkToHome = async () => {
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
    }
  };

  const handleRegisterRedirect = () => {
    navigate("/register"); // Redirigir al formulario de registro
  };

  return (
    <div className="container">
      <h2>Iniciar sesión</h2>
      {!showHomeOptions ? (
        <>
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">Iniciar sesión</button>
          </form>
          <button onClick={handleGoogleLogin}>Iniciar sesión con Google</button>
          <button onClick={handleRegisterRedirect}>Registrarse</button>
          {error && <p className="error">{error}</p>}
        </>
      ) : (
        <>
          <h3>Elige una opción para continuar</h3>
          <div>
            <h4>Crear un nuevo hogar</h4>
            <input
              type="text"
              placeholder="Nombre del hogar"
              value={homeName}
              onChange={(e) => setHomeName(e.target.value)}
            />
            <button onClick={handleCreateHome}>Crear hogar</button>
          </div>
          <div>
            <h4>Vincularse a un hogar existente</h4>
            <input
              type="text"
              placeholder="Código del hogar"
              value={homeCode}
              onChange={(e) => setHomeCode(e.target.value)}
            />
            <button onClick={handleLinkToHome}>Vincular hogar</button>
          </div>
          <button onClick={() => setShowHomeOptions(false)}>Volver</button>
        </>
      )}
    </div>
  );
};

export default Login;