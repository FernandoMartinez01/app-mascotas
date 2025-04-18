import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { registerUser } from "../authService";
import '../App.css';

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    try {
      await registerUser(email, password);
      setSuccess(true);
      setEmail("");
      setPassword("");
    } catch (err) {
      setError("Error al registrarse: " + err.message);
    }
  };

  const handleBackToLogin = () => {
    navigate("/"); // Redirigir a la página de inicio de sesión
  };

  return (
    <div>
      <h2>Registrarse</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Crear cuenta</button>
      </form>
      <button onClick={handleBackToLogin}>Volver a iniciar sesión</button>
      {success && <p>✅ Cuenta creada con éxito. Ahora podés iniciar sesión.</p>}
      {error && <p>❌ {error}</p>}
    </div>
  );
};

export default Register;
