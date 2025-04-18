import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Importar useNavigate
import { loginUser, loginWithGoogle, getLinkedPets } from "../authService";
import '../App.css';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate(); // Usar useNavigate para navegación

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await loginUser(email, password); // Iniciar sesión
      const linkedPets = await getLinkedPets(user.uid); // Obtener mascotas vinculadas

      if (linkedPets.length > 0) {
        // Si tiene mascotas vinculadas, redirigir al Dashboard con la primera mascota
        navigate("/dashboard", { state: { petName: linkedPets[0].name } });
      } else {
        // Si no tiene mascotas vinculadas, redirigir a la Home
        navigate("/home");
      }
    } catch (err) {
      setError("Error al iniciar sesión: " + err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const user = await loginWithGoogle(); // Iniciar sesión con Google
      const linkedPets = await getLinkedPets(user.uid); // Obtener mascotas vinculadas
  
      if (linkedPets.length > 0) {
        // Si tiene mascotas vinculadas, redirigir al Dashboard con la primera mascota
        navigate("/dashboard", { state: { petName: linkedPets[0].name } });
      } else {
        // Si no tiene mascotas vinculadas, redirigir a la Home
        navigate("/home");
      }
    } catch (err) {
      setError("Error con el inicio de sesión de Google: " + err.message);
    }
  };

  const handleRegisterRedirect = () => {
    navigate("/register"); // Redirigir al formulario de registro
  };

  return (
    <div className="container">
      <h2>Iniciar sesión</h2>
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
    </div>
  );
};

export default Login;
