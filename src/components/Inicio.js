import React from "react";
import { useHome } from "../HomeContext"; // Para obtener el hogar actual
import "./styles/Inicio.css"; // Estilos para la página Inicio

const Inicio = ({ linkedPets }) => {
  const { currentHome } = useHome(); // Obtener el hogar actual del contexto

  return (
    <div className="inicio-container">
      {/* Mostrar el nombre del hogar */}
      <h1>Hogar: {currentHome?.name || "Cargando..."}</h1>

      {/* Listar las mascotas */}
      <h2>Mascotas:</h2>
      <ul className="mascotas-list">
        {linkedPets.length > 0 ? (
          linkedPets.map((pet) => (
            <li key={pet.id} className="mascota-item">
              {pet.name}
            </li>
          ))
        ) : (
          <p>No hay mascotas registradas en este hogar.</p>
        )}
      </ul>

      {/* Panel de notificaciones */}
      <div className="notificaciones-panel">
        <h2>Panel de Notificaciones</h2>
        <p>Aquí se mostrarán las alertas conectadas con el calendario y salud.</p>
      </div>
    </div>
  );
};

export default Inicio;