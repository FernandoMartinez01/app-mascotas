import React, { useState, useEffect, useRef } from "react";
import "./styles/Home.css";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { app } from "../firebaseConfig";
import { createHome, linkToHome } from "../services/auth/homeService"; // Importar funciones para crear y vincular hogar
import { useHome } from "../HomeContext"; // Importar el contexto del hogar
import { useLoading } from "../context/LoadingContext"; // Importar el contexto de carga
import CLOUDS from "vanta/dist/vanta.clouds.min";
import * as THREE from "three";

const auth = getAuth(app); // Inicializar auth

const Home = () => {
  const navigate = useNavigate();
  const { setCurrentHome } = useHome(); // Obtener la función para actualizar el hogar actual
  const { setLoading } = useLoading(); // Usar el contexto de carga
  const [showCreateHome, setShowCreateHome] = useState(false); // Estado para mostrar el formulario de crear hogar
  const [showLinkHome, setShowLinkHome] = useState(false); // Estado para mostrar el formulario de vincular hogar
  const [homeName, setHomeName] = useState(""); // Estado para el nombre del hogar
  const [homeCode, setHomeCode] = useState(""); // Estado para el código del hogar
  const [error, setError] = useState(""); // Estado para manejar errores
  const [vantaEffect, setVantaEffect] = useState(null);
  const vantaRef = useRef(null);

  // Función para crear un hogar
  const handleCreateHome = async (e) => {
    e.preventDefault();
    setError(""); // Limpiar errores previos
    setLoading(true); // Activar el indicador de carga

    if (!homeName.trim()) {
      setError("El nombre del hogar no puede estar vacío.");
      setLoading(false); // Desactivar el indicador de carga
      return;
    }

    try {
      const userId = auth.currentUser?.uid; // Obtener el ID del usuario actual
      if (!userId) {
        setError("No se encontró un usuario autenticado. Por favor, inicia sesión nuevamente.");
        setLoading(false); // Desactivar el indicador de carga
        return;
      }

      const homeId = await createHome(userId, homeName); // Crear el hogar en Firestore
      // console.log("Hogar creado con ID:", homeId); // Verificar si se devuelve un homeId
      setCurrentHome({ id: homeId.id, name: homeName }); // Actualizar el contexto con el nuevo hogar
      // console.log("Contexto actualizado con el hogar:", { id: homeId, name: homeName });
      alert("Hogar creado con éxito."); // Mostrar mensaje de éxito

      // Redirigir a Mascota.js
      navigate("/mascota", { state: { homeId } });
      console.log("Redirigiendo a Mascota.js con homeId:", homeId.id);
    } catch (err) {
      console.error("Error al crear el hogar:", err.message);
      setError("Error al crear el hogar: " + err.message);
    } finally {
      setLoading(false); // Desactivar el indicador de carga
    }
  };

  // Función para vincular un hogar
  const handleLinkHome = async (e) => {
    e.preventDefault();
    setError(""); // Limpiar errores previos
    setLoading(true); // Activar el indicador de carga

    if (!homeCode.trim()) {
      setError("El código del hogar no puede estar vacío.");
      setLoading(false); // Desactivar el indicador de carga
      return;
    }

    try {
      const userId = auth.currentUser?.uid; // Obtener el ID del usuario actual
      if (!userId) {
        setError("No se encontró un usuario autenticado. Por favor, inicia sesión nuevamente.");
        setLoading(false); // Desactivar el indicador de carga
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
    } finally {
      setLoading(false); // Desactivar el indicador de carga
    }
  };

  useEffect(() => {
    if (!vantaEffect) {
      setVantaEffect(
        CLOUDS({
          el: vantaRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          THREE: THREE, // Necesario para que funcione Vanta.js
        })
      );
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy(); // Limpia el efecto al desmontar el componente
    };
  }, [vantaEffect]);

  return (
    <div ref={vantaRef} className="home-container">
      <div className="home-box">
        <h2 className="home-title">Bienvenido/a</h2>
        <p className="home-subtitle">Elige una opción para continuar:</p>

        {/* Opciones principales */}
        {!showCreateHome && !showLinkHome && (
          <div className="home-options">
            <button className="home-button" onClick={() => setShowCreateHome(true)}>
              Crear hogar
            </button>
            <div className="home-divider">o</div> {/* Separador visual */}
            <button className="home-button" onClick={() => setShowLinkHome(true)}>
              Vincular hogar
            </button>
          </div>
        )}

        {/* Formulario para crear hogar */}
        {showCreateHome && (
          <form className="home-form" onSubmit={handleCreateHome}>
            <h3 className="home-form-title">Crear un nuevo hogar</h3>
            <input
              className="home-input"
              type="text"
              placeholder="Nombre del hogar"
              value={homeName}
              onChange={(e) => setHomeName(e.target.value)}
              required
            />
            <button className="home-button" type="submit">Crear hogar</button>
            <button className="home-back-button" type="button" onClick={() => setShowCreateHome(false)}>
              Volver
            </button>
          </form>
        )}

        {/* Formulario para vincular hogar */}
        {showLinkHome && (
          <form className="home-form" onSubmit={handleLinkHome}>
            <h3 className="home-form-title">Vincular a un hogar existente</h3>
            <input
              className="home-input"
              type="text"
              placeholder="Código del hogar"
              value={homeCode}
              onChange={(e) => setHomeCode(e.target.value)}
              required
            />
            <button className="home-button" type="submit">Vincular hogar</button>
            <button className="home-back-button" type="button" onClick={() => setShowLinkHome(false)}>
              Volver
            </button>
          </form>
        )}

        {/* Mostrar errores */}
        {error && <p className="home-error">{error}</p>}
      </div>
    </div>
  );
};

export default Home;