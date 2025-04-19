import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { app } from "../firebaseConfig";
import { createHome, linkToHome } from "../authService"; // Importar funciones para crear y vincular hogar
import { useHome } from "../HomeContext"; // Importar el contexto del hogar

const auth = getAuth(app); // Inicializar auth

const Home = () => {
  const navigate = useNavigate();
  const { setCurrentHome } = useHome(); // Obtener la función para actualizar el hogar actual
  const [showCreateHome, setShowCreateHome] = useState(false); // Estado para mostrar el formulario de crear hogar
  const [showLinkHome, setShowLinkHome] = useState(false); // Estado para mostrar el formulario de vincular hogar
  const [homeName, setHomeName] = useState(""); // Estado para el nombre del hogar
  const [homeCode, setHomeCode] = useState(""); // Estado para el código del hogar
  const [error, setError] = useState(""); // Estado para manejar errores

  // Función para crear un hogar
  const handleCreateHome = async (e) => {
    e.preventDefault();
    setError(""); // Limpiar errores previos

    if (!homeName.trim()) {
      setError("El nombre del hogar no puede estar vacío.");
      return;
    }

    try {
      const userId = auth.currentUser?.uid; // Obtener el ID del usuario actual
      if (!userId) {
        setError("No se encontró un usuario autenticado. Por favor, inicia sesión nuevamente.");
        return;
      }

      const homeId = await createHome(userId, homeName); // Crear el hogar en Firestore
      console.log("Hogar creado con ID:", homeId); // Verificar si se devuelve un homeId
      setCurrentHome({ id: homeId, name: homeName }); // Actualizar el contexto con el nuevo hogar
      console.log("Contexto actualizado con el hogar:", { id: homeId, name: homeName });
      alert("Hogar creado con éxito."); // Mostrar mensaje de éxito

      // Redirigir a Mascota.js
      navigate("/mascota", { state: { homeId } });
      console.log("Redirigiendo a Mascota.js con homeId:", homeId);
    } catch (err) {
      console.error("Error al crear el hogar:", err.message);
      setError("Error al crear el hogar: " + err.message);
    }
  };

  // Función para vincular un hogar
  const handleLinkHome = async (e) => {
    e.preventDefault();
    setError(""); // Limpiar errores previos

    if (!homeCode.trim()) {
      setError("El código del hogar no puede estar vacío.");
      return;
    }

    try {
      const userId = auth.currentUser?.uid; // Obtener el ID del usuario actual
      if (!userId) {
        setError("No se encontró un usuario autenticado. Por favor, inicia sesión nuevamente.");
        return;
      }

      await linkToHome(homeCode, userId); // Vincular al hogar existente
      setCurrentHome({ id: homeCode }); // Actualizar el contexto con el hogar vinculado
      alert("Hogar vinculado con éxito."); // Mostrar mensaje de éxito

      // Redirigir al Dashboard
      navigate("/dashboard", { state: { homeId: homeCode } });
    } catch (err) {
      console.error("Error al vincular el hogar:", err.message);
      setError("Error al vincular el hogar: " + err.message);
    }
  };

  return (
    <div>
      <h2>Bienvenido</h2>
      <p>Elige una opción para continuar:</p>

      {/* Opciones principales */}
      {!showCreateHome && !showLinkHome && (
        <div>
          <button onClick={() => setShowCreateHome(true)}>Crear hogar</button>
          <button onClick={() => setShowLinkHome(true)}>Vincular hogar</button>
        </div>
      )}

      {/* Formulario para crear hogar */}
      {showCreateHome && (
        <form onSubmit={handleCreateHome}>
          <h3>Crear un nuevo hogar</h3>
          <input
            type="text"
            placeholder="Nombre del hogar"
            value={homeName}
            onChange={(e) => setHomeName(e.target.value)}
            required
          />
          <button type="submit">Crear hogar</button>
          <button type="button" onClick={() => setShowCreateHome(false)}>
            Volver
          </button>
        </form>
      )}

      {/* Formulario para vincular hogar */}
      {showLinkHome && (
        <form onSubmit={handleLinkHome}>
          <h3>Vincular a un hogar existente</h3>
          <input
            type="text"
            placeholder="Código del hogar"
            value={homeCode}
            onChange={(e) => setHomeCode(e.target.value)}
            required
          />
          <button type="submit">Vincular hogar</button>
          <button type="button" onClick={() => setShowLinkHome(false)}>
            Volver
          </button>
        </form>
      )}

      {/* Mostrar errores */}
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default Home;