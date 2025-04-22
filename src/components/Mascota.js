import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPet } from "../authService"; // Importar la función para crear una mascota
import { useHome } from "../HomeContext"; // Importar el contexto del hogar
import { useLoading } from "../context/LoadingContext"; // Importar el contexto de carga
import CELLS from "vanta/dist/vanta.cells.min";
import * as THREE from "three";
import "./styles/Mascota.css";

const Mascota = () => {
  const navigate = useNavigate();
  const { currentHome } = useHome(); // Obtener el hogar actual del contexto
  const { setLoading } = useLoading(); // Usar el contexto de carga
  const [petType, setPetType] = useState(""); // Tipo de mascota (Gato o Perro)
  const [petData, setPetData] = useState({
    name: "",
    gender: "",
    birthDate: "",
    weight: "",
  });
  const [error, setError] = useState(""); // Estado para manejar errores
  const [vantaEffect, setVantaEffect] = useState(null);
  const vantaRef = useRef(null);

  useEffect(() => {
    if (!vantaEffect) {
      setVantaEffect(
        CELLS({
          el: vantaRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          scale: 1.0,
          THREE: THREE,
        })
      );
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  // Manejar la selección del tipo de mascota
  const handlePetTypeSelection = (type) => {
    setPetType(type);
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Limpiar errores previos
    setLoading(true); // Activar el indicador de carga

    try {
      if (!currentHome) {
        setError("No se encontró un hogar asociado. Por favor, crea un hogar primero.");
        setLoading(false); // Desactivar el indicador de carga
        return;
      }

      // Crear la mascota vinculada al hogar actual
      await createPet({ ...petData, type: petType }, currentHome.id);
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Redirigir al Dashboard
      navigate("/dashboard");
    } catch (err) {
      setError("Error al crear la mascota: " + err.message);
    } finally {
      setLoading(false); // Desactivar el indicador de carga
    }
  };

  return (
    <div ref={vantaRef} className="mascota-container">
      <div className="mascota-box">
        <h2 className="mascota-title">Crear nueva mascota</h2>
  
        {/* Selección del tipo de mascota */}
        {!petType ? (
          <div className="mascota-selection">
            <button
              className="mascota-button"
              onClick={() => handlePetTypeSelection("Gato")}
            >
              <img
                src={require("../assets/images/gato.png")}
                alt="Gato"
                className="mascota-button-image"
              />
            </button>
            <button
              className="mascota-button"
              onClick={() => handlePetTypeSelection("Perro")}
            >
              <img
                src={require("../assets/images/perro.png")}
                alt="Perro"
                className="mascota-button-image"
              />
            </button>
          </div>
        ) : (
          // Formulario para ingresar los datos de la mascota
          <form className="mascota-form" onSubmit={handleSubmit}>
            <h3 className="mascota-form-title">Crear nueva mascota ({petType})</h3>
            <input
              className="mascota-input"
              type="text"
              placeholder="Nombre de la mascota"
              value={petData.name}
              onChange={(e) => setPetData({ ...petData, name: e.target.value })}
              required
            />
            <select
              className="mascota-select"
              value={petData.gender}
              onChange={(e) => setPetData({ ...petData, gender: e.target.value })}
              required
            >
              <option value="">Selecciona el sexo</option>
              <option value="Femenino">Femenino</option>
              <option value="Masculino">Masculino</option>
            </select>
            <input
              className="mascota-input"
              type="date"
              placeholder="Fecha de nacimiento"
              value={petData.birthDate}
              onChange={(e) =>
                setPetData({ ...petData, birthDate: e.target.value })
              }
              required
            />
            <input
              className="mascota-input"
              type="number"
              placeholder="Peso (kg) (opcional)"
              value={petData.weight}
              onChange={(e) =>
                setPetData({ ...petData, weight: e.target.value })
              }
            />
            <button className="mascota-button" type="submit">
              Crear mascota
            </button>
          </form>
        )}
  
        {/* Mostrar errores */}
        {error && <p className="mascota-error">{error}</p>}
      </div>
    </div>
  );
};

export default Mascota;