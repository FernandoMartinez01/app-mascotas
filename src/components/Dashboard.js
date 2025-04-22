import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { app } from "../firebaseConfig";
import { logoutUser, getLinkedPets, deletePet } from "../authService";
import { useHome } from "../HomeContext"; // Importar el contexto del hogar
import Stock from "./Stock";
import Calendario from "./Calendario";
import Salud from "./Salud";
import "./styles/Dashboard.css";
import { useLoading } from "../context/LoadingContext";

const auth = getAuth(app);

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentHome } = useHome(); // Obtener el hogar actual del contexto
  const [showPetMenu, setShowPetMenu] = useState(false);
  const [showConfigMenu, setShowConfigMenu] = useState(false);
  const [linkedPets, setLinkedPets] = useState([]);
  const [currentView, setCurrentView] = useState("Todas");
  const [currentSection, setCurrentSection] = useState("stock");
  const [error, setError] = useState(""); // Estado para manejar errores
  const [showConfirmPopup, setShowConfirmPopup] = useState(false); // Controla si se muestra el popup
  const [petToDelete, setPetToDelete] = useState(null); // Almacena la mascota que se desea eliminar
  const { setLoading } = useLoading();

  // Cargar las mascotas vinculadas al hogar actual
  useEffect(() => {
    const fetchLinkedPets = async () => {
      setLoading(true);
      try {
        if (currentHome) {
          const pets = await getLinkedPets(currentHome.id); // Obtener mascotas vinculadas al hogar actual
          setLinkedPets(pets);
        }
      } catch (error) {
        console.error("Error al obtener mascotas vinculadas:", error.message);
        setError("No se pudieron cargar las mascotas. Intenta nuevamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchLinkedPets();
  }, [currentHome]);

  // Mostrar el popup de confirmación
  const handleConfirmDelete = (petId) => {
    setPetToDelete(petId); // Establecer la mascota que se desea eliminar
    setShowConfirmPopup(true); // Mostrar el popup
  };

  // Confirmar la eliminación de la mascota
  const confirmDeletePet = async () => {
    if (petToDelete) {
      setLoading(true);
      try {
        await deletePet(petToDelete); // Eliminar la mascota de Firestore
        setLinkedPets((prevPets) => prevPets.filter((pet) => pet.id !== petToDelete)); // Actualizar el estado local
        alert("Mascota eliminada con éxito.");
      } catch (error) {
        console.error("Error al eliminar la mascota:", error.message);
        setError("No se pudo eliminar la mascota. Intenta nuevamente.");
      } finally {
        setLoading(false); 
        setShowConfirmPopup(false); // Ocultar el popup
        setPetToDelete(null); // Limpiar la mascota seleccionada
      }
    }
  };

  // Cancelar la eliminación
  const cancelDeletePet = () => {
    setShowConfirmPopup(false); // Ocultar el popup
    setPetToDelete(null); // Limpiar la mascota seleccionada
  };

  // Manejar el cierre de sesión
  const handleLogout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      navigate("/"); // Redirigir al inicio de sesión
    } catch (error) {
      console.error("Error al cerrar sesión:", error.message);
      setError("No se pudo cerrar sesión. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // Mostrar el código del hogar actual
  const handleShareHome = () => {
    if (currentHome) {
      alert(`Código para compartir hogar: ${currentHome.id}`); // Mostrar el código del hogar actual
    } else {
      alert("No se encontró un hogar asociado.");
    }
  };

  // Redirigir a Mascota.js para crear una nueva mascota
  const handleCreateNewPet = () => {
    navigate("/mascota");
  };

  return (
    <div className="dashboard-container">
      {/* Renglón superior */}
      <div className="dashboard-top-bar">

          <button
            onClick={() => setShowPetMenu(!showPetMenu)}
            className="menu-button"
          >
            🐾 {currentView}
          </button>
        
        <button
          onClick={() => setShowConfigMenu(!showConfigMenu)}
          className="menu-button"
        >
          ⚙ Configuración
        </button>
      </div>
  
      {/* Menú de navegación */}
      <nav className="dashboard-nav">
        <button
          className={`nav-button ${currentSection === "stock" ? "active" : ""}`}
          onClick={() => {
            setCurrentSection("stock");
            setCurrentView("Todas");
            setShowPetMenu(false);
          }}
        >
          Stock
        </button>
        <button
          className={`nav-button ${currentSection === "calendario" ? "active" : ""}`}
          onClick={() => setCurrentSection("calendario")}
        >
          Calendario
        </button>
        <button
          className={`nav-button ${currentSection === "salud" ? "active" : ""}`}
          onClick={() => setCurrentSection("salud")}
        >
          Salud
        </button>
      </nav>
  
      {/* Contenido dinámico */}
      <main className="dashboard-main">
        {currentSection === "stock" && <Stock />}
        {currentSection === "calendario" && (
          <Calendario selectedPet={currentView} />
        )}
        {currentSection === "salud" && (
          <Salud selectedPet={currentView} currentHome={currentHome} />
        )}
      </main>
  
      {/* Menú desplegable de mascotas */}
      {showPetMenu && (
        <div className="pet-menu show">
          <ul className="pet-menu-list">
            {linkedPets.map((pet) => (
              <li key={pet.id} className="pet-menu-item">
                <span
                  onClick={() => setCurrentView(pet.name)}
                  className="pet-name"
                >
                  {pet.name}
                </span>
                <button
                  onClick={() => handleConfirmDelete(pet.id)}
                  className="delete-pet-button"
                  title="Eliminar mascota"
                >
                  🗑️
                </button>
              </li>
            ))}
          </ul>
          <button
            className="pet-menu-item"
            onClick={() => setCurrentView("Todas")}
          >
            Ver todas
          </button>
          <button
            className="pet-menu-item"
            onClick={handleCreateNewPet}
          >
            Crear nueva mascota
          </button>
        </div>
      )}
  
      {/* Menú de configuración */}
      {showConfigMenu && (
        <div className="config-menu show">
          <button className="config-menu-item" onClick={handleShareHome}>
            Compartir hogar
          </button>
          <button className="config-menu-item" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      )}
  
      {/* Popup de confirmación */}
      {showConfirmPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>
              ¿Deseas desvincular a{" "}
              <strong>
                {linkedPets.find((pet) => pet.id === petToDelete)?.name}
              </strong>{" "}
              de tu hogar?
            </h3>
            <div className="popup-buttons">
              <button
                onClick={confirmDeletePet}
                className="popup-button accept"
              >
                Aceptar
              </button>
              <button
                onClick={cancelDeletePet}
                className="popup-button cancel"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
  
      {/* Mostrar errores */}
      {error && <p className="dashboard-error">{error}</p>}
    </div>
  );
};

export default Dashboard;