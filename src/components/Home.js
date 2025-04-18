import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth"; 
import { app } from "../firebaseConfig"; 
import { createPet, linkAccount } from "../authService";  // Funciones para crear mascota y vincular cuenta

const auth = getAuth(app); // Inicializar auth

const Home = () => {
  const navigate = useNavigate();
  const [showCreatePet, setShowCreatePet] = useState(false);
  const [petType, setPetType] = useState("");
  const [showLinkAccount, setShowLinkAccount] = useState(false);
  const [newPet, setNewPet] = useState({ name: "", type: "", birthDate: "", weight: "" }); 
  const [accountCode, setAccountCode] = useState("");
  const [error, setError] = useState("");

  const handlePetTypeSelection = (type) => {
    setPetType(type);
  };

  // Función para crear mascota
  const handleCreatePet = async (e) => {
    e.preventDefault();
    try {
      const userId = auth.currentUser.uid; // Obtener el ID del usuario actual
      const { linkCode } = await createPet({ ...newPet, type: petType }, userId); // Crear la mascota
      setShowCreatePet(false);
      setPetType(""); // Reiniciar el tipo de mascota
      setNewPet({ name: "", birthDate: "", weight: "" }); // Reiniciar el formulario
      alert(`Mascota creada con éxito. Código de vinculación: ${linkCode}`); // Mostrar el código al usuario
  
      // Redirigir al Dashboard con el nombre de la mascota
      navigate("/dashboard", { state: { petName: newPet.name, petType: petType } });
    } catch (err) {
      setError("Error al crear mascota: " + err.message);
    }
  };


  // Función para vincular cuenta
  const handleLinkAccount = async (e) => {
    e.preventDefault();
    try {
      const userId = auth.currentUser.uid; // Obtener el ID del usuario actual
      const linkedPet = await linkAccount(accountCode, userId); // Vincular la cuenta y obtener la mascota vinculada
  
      if (linkedPet) {
        // Redirigir al Dashboard con el nombre de la mascota vinculada
        navigate("/dashboard", { state: { petName: linkedPet.name } });
      } else {
        setError("No se pudo vincular la cuenta. Intenta nuevamente.");
      }
    } catch (err) {
      setError("Error al vincular cuenta: " + err.message);
    }
  };

  return (
    <div>
      <h2>Bienvenido a la Home</h2>

      {/* Botones para mostrar formularios */}
      <button onClick={() => setShowCreatePet(true)}>Crear nueva mascota</button>
      <button onClick={() => setShowLinkAccount(true)}>Vincular cuenta</button>

      {error && <p className="error">{error}</p>}

      {/* Formulario para crear mascota */}
      {showCreatePet && (
        <div>
          {!petType ? (
            <div>
              <h3>Selecciona el tipo de mascota</h3>
              <button onClick={() => handlePetTypeSelection("Perro")}>Perro</button>
              <button onClick={() => handlePetTypeSelection("Gato")}>Gato</button>
              <button onClick={() => setShowCreatePet(false)}>Cancelar</button>
            </div>
          ) : (
            <form onSubmit={handleCreatePet}>
              <h3>Crear nueva mascota ({petType})</h3>
              <input
                type="text"
                placeholder="Nombre de la mascota"
                value={newPet.name}
                onChange={(e) => setNewPet({ ...newPet, name: e.target.value })}
                required
              />
              <input
                type="date"
                placeholder="Fecha de nacimiento"
                value={newPet.birthDate}
                onChange={(e) => setNewPet({ ...newPet, birthDate: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Peso (kg) (opcional)"
                value={newPet.weight}
                onChange={(e) => setNewPet({ ...newPet, weight: e.target.value })}
              />
              <button type="submit">Crear mascota</button>
              <button type="button" onClick={() => setShowCreatePet(false)}>
                Cancelar
              </button>
            </form>
          )}
        </div>
      )}

      {/* Formulario para vincular cuenta */}
      {showLinkAccount && (
        <form onSubmit={handleLinkAccount}>
          <h3>Vincular cuenta</h3>
          <input
            type="text"
            placeholder="Código de vinculación"
            value={accountCode}
            onChange={(e) => setAccountCode(e.target.value)}
          />
          <button type="submit">Vincular cuenta</button>
          <button type="button" onClick={() => setShowLinkAccount(false)}>
            Cancelar
          </button>
        </form>
      )}
    </div>
  );
};

export default Home;
