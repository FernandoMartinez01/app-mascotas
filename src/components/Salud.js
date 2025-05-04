import React, { useState, useEffect } from "react";
import "./styles/Salud.css";
import { getLinkedPets } from "../services/auth/petService";
import { addVaccine, getVaccines, deleteVaccine } from "../services/auth/saludService";
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

  // Estado para manejar los desplegables
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (petId, section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [petId]: {
        ...prev[petId],
        [section]: !prev[petId]?.[section],
      },
    }));
  };

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
              {new Date().getFullYear() - new Date(pet.birthDate).getFullYear()}{" "}
              años)
            </p>
            <p className="section-detail">
              <strong>Peso:</strong> {parseFloat(pet.weight)} kg
            </p>
          </div>

          {/* Vacunas */}
          <div className="section">
            <h3
              className="section-title"
              onClick={() => toggleSection(pet.id, "vacunas")}
            >
              Vacunas
            </h3>
            {expandedSections[pet.id]?.vacunas && (
              <div className="section-content">
                <p>Contenido de vacunas aquí.</p>
              </div>
            )}
          </div>

          {/* Historial clínico */}
          <div className="section">
            <h3
              className="section-title"
              onClick={() => toggleSection(pet.id, "historialClinico")}
            >
              Historial Clínico
            </h3>
            {expandedSections[pet.id]?.historialClinico && (
              <div className="section-content">
                <p>Contenido del historial clínico aquí.</p>
              </div>
            )}
          </div>

          {/* Medicaciones activas */}
          <div className="section">
            <h3
              className="section-title"
              onClick={() => toggleSection(pet.id, "medicaciones")}
            >
              Medicaciones Activas
            </h3>
            {expandedSections[pet.id]?.medicaciones && (
              <div className="section-content">
                <p>Contenido de medicaciones activas aquí.</p>
              </div>
            )}
          </div>

          {/* Estudios y análisis */}
          <div className="section">
            <h3
              className="section-title"
              onClick={() => toggleSection(pet.id, "estudios")}
            >
              Estudios y Análisis
            </h3>
            {expandedSections[pet.id]?.estudios && (
              <div className="section-content">
                <p>Contenido de estudios y análisis aquí.</p>
              </div>
            )}
          </div>

          {/* Notas del dueño */}
          <div className="section">
            <h3
              className="section-title"
              onClick={() => toggleSection(pet.id, "notas")}
            >
              Notas del Dueño
            </h3>
            {expandedSections[pet.id]?.notas && (
              <div className="section-content">
                <p>Contenido de notas del dueño aquí.</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Salud;