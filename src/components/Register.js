import React, { useState } from "react";
import "./styles/Register.css";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/auth/authService";
import { useLoading } from "../context/LoadingContext";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { setLoading } = useLoading();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      await registerUser(email, password);
      setSuccess(true);
      setEmail("");
      setPassword("");
    } catch (err) {
      setError("Error al registrarse: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/"); // Redirigir a la página de inicio de sesión
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2 className="register-title">Crear cuenta</h2>
        <p className="register-subtitle">Ingresa tu correo y crea una contraseña</p>
        <form className="register-form" onSubmit={handleSubmit}>
          <label htmlFor="email" className="register-label">
            Correo electrónico
          </label>
          <input
            id="email"
            className="register-input"
            type="email"
            placeholder="correo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label htmlFor="password" className="register-label">
            Contraseña
          </label>
          <input
            id="password"
            className="register-input"
            type="password"
            placeholder="Crea una contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="register-button" type="submit">
            Crear cuenta
          </button>
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