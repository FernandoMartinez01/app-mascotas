import React, { useState, useEffect } from "react";
import "./styles/Salud.css";
import { getLinkedPets } from "../authService";
import { useLoading } from "../context/LoadingContext";

const Salud = ({ selectedPet, currentHome }) => {
  const [pets, setPets] = useState([]); // Lista de mascotas
  const [error, setError] = useState(""); // Estado para manejar errores
  const { setLoading } = useLoading();

  useEffect(() => {
    setLoading(true); // Activar el indicador de carga
    const fetchPets = async () => {
      try {
        if (currentHome) {
          const linkedPets = await getLinkedPets(currentHome.id); // Obtener mascotas vinculadas al hogar
          // console.log("Mascotas vinculadas:", linkedPets); // Log para depurar
          setPets(linkedPets);
        }
      } catch (err) {
        console.error("Error al cargar las mascotas:", err.message);
        setError("No se pudieron cargar las mascotas. Intenta nuevamente.");
      } finally {
        setLoading(false); // Desactivar el indicador de carga
      }
    };
  
    fetchPets();
  }, [currentHome]);

  // Filtrar mascotas según la selección
  const filteredPets =
  selectedPet === "Todas"
    ? pets
    : pets.filter((pet) => pet.name === selectedPet);

  return (
    <div className="salud-container">
      <h2 className="salud-title">Salud</h2>
  
      {/* Mostrar errores */}
      {error && <p className="salud-error">{error}</p>}
  
      {/* Sección de mascotas filtradas */}
      {filteredPets.map((pet) => (
        <div key={pet.id} className="pet-section">
          {/* Datos personales */}
          <div className="section personal-data">
            <h3 className="section-title">Datos Personales</h3>
            <p className="section-detail">
              <strong>Nombre:</strong> {pet.name}
            </p>
            <p className="section-detail">
              <strong>Fecha de Nacimiento:</strong> {pet.birthDate} (
              {new Date().getFullYear() - new Date(pet.birthDate).getFullYear()} años)
            </p>
            <p className="section-detail">
              <strong>Peso:</strong> {parseFloat(pet.weight)} kg
            </p>
          </div>
  
          {/* Vacunas */}
          <div className="section vaccines">
            <h3 className="section-title">Vacunas</h3>
            {pet.vaccines?.length > 0 ? (
              <ul className="vaccine-list">
                {pet.vaccines.map((vaccine, index) => (
                  <li key={index} className="vaccine-item">
                    <strong>{vaccine.name}</strong>: {vaccine.date} (Vence:{" "}
                    {vaccine.expiryDate})
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-vaccines">No hay vacunas registradas.</p>
            )}
            <button
              className="add-vaccine-button"
              onClick={() => alert("Agregar vacuna")}
            >
              Agregar Vacuna
            </button>
          </div>
  
          {/* Historial clínico */}
          <div className="section clinical-history">
            <h3 className="section-title">Historial Clínico</h3>
            <p className="section-detail">
              Información adicional sobre la salud de la mascota.
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Salud;