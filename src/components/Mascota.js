import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPet } from "../authService"; // Importar la función para crear una mascota
import { useHome } from "../HomeContext"; // Importar el contexto del hogar

const Mascota = () => {
  const navigate = useNavigate();
  const { currentHome } = useHome(); // Obtener el hogar actual del contexto
  const [petType, setPetType] = useState(""); // Tipo de mascota (Gato o Perro)
  const [petData, setPetData] = useState({
    name: "",
    gender: "",
    birthDate: "",
    weight: "",
  });
  const [error, setError] = useState(""); // Estado para manejar errores

  // Manejar la selección del tipo de mascota
  const handlePetTypeSelection = (type) => {
    setPetType(type);
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!currentHome) {
        setError("No se encontró un hogar asociado. Por favor, crea un hogar primero.");
        return;
      }

      // Crear la mascota vinculada al hogar actual
      await createPet({ ...petData, type: petType }, currentHome.id);
      alert("Mascota creada con éxito."); // Mostrar mensaje de éxito

      // Redirigir al Dashboard
      navigate("/dashboard");
    } catch (err) {
      setError("Error al crear la mascota: " + err.message);
    }
  };

  return (
    <div>
      <h2>Crear tu primera mascota</h2>

      {/* Selección del tipo de mascota */}
      {!petType ? (
        <div>
          <h3>Selecciona el tipo de mascota</h3>
          <button onClick={() => handlePetTypeSelection("Gato")}>Gato</button>
          <button onClick={() => handlePetTypeSelection("Perro")}>Perro</button>
        </div>
      ) : (
        // Formulario para ingresar los datos de la mascota
        <form onSubmit={handleSubmit}>
          <h3>Crear nueva mascota ({petType})</h3>
          <input
            type="text"
            placeholder="Nombre de la mascota"
            value={petData.name}
            onChange={(e) => setPetData({ ...petData, name: e.target.value })}
            required
          />
          <select
            value={petData.gender}
            onChange={(e) => setPetData({ ...petData, gender: e.target.value })}
            required
          >
            <option value="">Selecciona el sexo</option>
            <option value="Femenino">Femenino</option>
            <option value="Masculino">Masculino</option>
          </select>
          <input
            type="date"
            placeholder="Fecha de nacimiento"
            value={petData.birthDate}
            onChange={(e) => setPetData({ ...petData, birthDate: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Peso (kg) (opcional)"
            value={petData.weight}
            onChange={(e) => setPetData({ ...petData, weight: e.target.value })}
          />
          <button type="submit">Crear mascota</button>
        </form>
      )}

      {/* Mostrar errores */}
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default Mascota;