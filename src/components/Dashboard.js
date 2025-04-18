import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { app } from "../firebaseConfig";
import { logoutUser, getLinkedPets, unlinkPet } from "../authService"; // Asegúrate de tener una función unlinkPet en authService.js

const auth = getAuth(app);

const Dashboard = () => {
  const navigate = useNavigate();
  const [showPetMenu, setShowPetMenu] = useState(false); // Estado para el menú de nombres de mascotas
  const [showConfigMenu, setShowConfigMenu] = useState(false); // Estado para el menú de configuración
  const [linkedPets, setLinkedPets] = useState([]); // Estado para almacenar las mascotas vinculadas
  const [currentView, setCurrentView] = useState("Todas"); // Estado para la vista actual (nombre de la mascota o "Todas")
  const [showPopup, setShowPopup] = useState(false); // Estado para controlar la visibilidad del popup
  const [selectedPet, setSelectedPet] = useState(null); // Mascota seleccionada para desvincular

  // Obtener las mascotas vinculadas al usuario
  useEffect(() => {
    const fetchLinkedPets = async () => {
      try {
        const userId = auth.currentUser.uid; // Obtener el ID del usuario actual
        const pets = await getLinkedPets(userId); // Obtener mascotas vinculadas
        setLinkedPets(pets);
      } catch (error) {
        console.error("Error al obtener mascotas vinculadas:", error.message);
      }
    };

    fetchLinkedPets();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser(); // Cerrar sesión
      navigate("/"); // Redirigir al login
    } catch (error) {
      console.error("Error al cerrar sesión:", error.message);
    }
  };

  const handleAddPet = () => {
    navigate("/home"); // Redirigir al Home para crear o vincular mascota
  };

  const handleViewAllPets = () => {
    setCurrentView("Todas"); // Cambiar la vista a "Todas"
    setShowPetMenu(false); // Cerrar el menú de nombres de mascotas
  };

  const handleSelectPet = (petName) => {
    setCurrentView(petName); // Cambiar la vista al nombre de la mascota seleccionada
    setShowPetMenu(false); // Cerrar el menú de nombres de mascotas
  };

  const handleUnlinkPet = async () => {
    try {
      const userId = auth.currentUser.uid; // Obtener el ID del usuario actual
      await unlinkPet(selectedPet.id, userId); // Desvincular la mascota
      setLinkedPets(linkedPets.filter((pet) => pet.id !== selectedPet.id)); // Actualizar la lista de mascotas
      setShowPopup(false); // Cerrar el popup
    } catch (error) {
      console.error("Error al desvincular mascota:", error.message);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        {/* Botón de selección de mascota */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => {
              setShowPetMenu(!showPetMenu); // Alternar visibilidad del menú de nombres de mascotas
              setShowConfigMenu(false); // Cerrar el menú de configuración
            }}
            className="menu-button"
          >
            🐾 {currentView}
          </button>
          {showPetMenu && (
            <div className="menu-container">
              {/* Lista de mascotas vinculadas */}
              <ul style={{ listStyle: "none", padding: "0", margin: "0" }}>
                {linkedPets.map((pet) => (
                  <li
                    key={pet.id}
                    className="menu-item"
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                  >
                    <span onClick={() => handleSelectPet(pet.name)} style={{ cursor: "pointer" }}>
                      {pet.name}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedPet(pet); // Seleccionar la mascota
                        setShowPopup(true); // Mostrar el popup
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "red",
                        cursor: "pointer",
                        fontSize: "16px",
                      }}
                    >
                      🗑️
                    </button>
                  </li>
                ))}
              </ul>
              {/* Botón "Ver todas" */}
              <button className="menu-item" onClick={handleViewAllPets}>
                Ver todas
              </button>
              {/* Botón "Agregar mascota" */}
              <button className="menu-item" onClick={handleAddPet}>
                Agregar mascota
              </button>
            </div>
          )}
        </div>

        {/* Botón de configuración */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => {
              setShowConfigMenu(!showConfigMenu); // Alternar visibilidad del menú de configuración
              setShowPetMenu(false); // Cerrar el menú de nombres de mascotas
            }}
            className="menu-button"
          >
            ⚙ Configuración
          </button>
          {showConfigMenu && (
            <div className="menu-container" style={{ right: "0", left: "auto" }}>
              <button className="menu-item" onClick={handleLogout}>
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="dashboard-main">
        {currentView === "Todas" ? (
          <h2>Mostrando todas las mascotas</h2>
        ) : (
          <h2>Bienvenido al Dashboard de {currentView}</h2>
        )}
        {/* Aquí puedes agregar más contenido dinámico según la vista */}
      </main>

      {/* Popup de confirmación */}
      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3>¿Deseas desvincular esta mascota?</h3>
            <p>{selectedPet?.name}</p>
            <div className="popup-actions">
              <button onClick={handleUnlinkPet} className="popup-button confirm">
                Aceptar
              </button>
              <button onClick={() => setShowPopup(false)} className="popup-button cancel">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;