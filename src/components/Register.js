import React, { useState } from "react";
import "./styles/Register.css";
import { useNavigate } from "react-router-dom"; 
import { registerUser } from "../authService";
import "../App.css";
import { useLoading } from "../context/LoadingContext"; // Importar el contexto de carga

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { setLoading } = useLoading(); // Usar el contexto de carga

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true); // Activar el indicador de carga

    try {
      await registerUser(email, password); // Llamada a la API para registrar al usuario
      setSuccess(true); // Mostrar mensaje de éxito
      setEmail(""); // Limpiar el campo de correo
      setPassword(""); // Limpiar el campo de contraseña
    } catch (err) {
      setError("Error al registrarse: " + err.message); // Mostrar mensaje de error
    } finally {
      setLoading(false); // Desactivar el indicador de carga
    }
  };

  const handleBackToLogin = () => {
    navigate("/"); // Redirigir a la página de inicio de sesión
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2 className="register-title">Registrarse</h2>
        <form className="register-form" onSubmit={handleSubmit}>
          <input
            className="register-input"
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="register-input"
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="register-button" type="submit">Crear cuenta</button>
        </form>
        <button className="register-back-button" onClick={handleBackToLogin}>
          Volver a iniciar sesión
        </button>
        {success && <p className="register-success">✅ Cuenta creada con éxito. Ahora podés iniciar sesión.</p>}
        {error && <p className="register-error">❌ {error}</p>}
      </div>
    </div>
  );
};

export default Register;