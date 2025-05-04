import React, { useState, useEffect } from "react";
import "./styles/Salud.css";
import { getLinkedPets } from "../services/auth/petService";
import { addVaccine, getVaccines, deleteVaccine, addClinicalEntry, getClinicalHistory, deleteClinicalEntry, addMedication, getMedications, deleteMedication } from "../services/auth/saludService";
import { useLoading } from "../context/LoadingContext";

const Salud = ({ selectedPet, currentHome }) => {
  const [pets, setPets] = useState([]); // Lista de mascotas
  const [error, setError] = useState(""); // Estado para manejar errores
  const { setLoading } = useLoading();
  const [vaccines, setVaccines] = useState({}); // Estado para almacenar las vacunas de cada mascota
  const [showPopup, setShowPopup] = useState(false); // Estado para mostrar el popup
  const [newVaccine, setNewVaccine] = useState({
    name: "",
    applicationDate: new Date().toISOString().split("T")[0], // Fecha de hoy por defecto
    nextDoseDate: "",
    veterinarian: "",
  });
  const [currentPetId, setCurrentPetId] = useState(null); // Mascota seleccionada para agregar vacuna
  const [clinicalHistory, setClinicalHistory] = useState({}); // Estado para almacenar el historial clínico de cada mascota
  const [showClinicalPopup, setShowClinicalPopup] = useState(false); // Estado para mostrar el popup del historial clínico
  const [newClinicalEntry, setNewClinicalEntry] = useState({
    date: new Date().toISOString().split("T")[0], // Fecha de hoy por defecto
    reason: "",
    diagnosis: "",
    treatment: "",
    medication: "",
    veterinarian: "",
  });
  const [medications, setMedications] = useState({}); // Estado para almacenar las medicaciones activas de cada mascota
  const [showMedicationPopup, setShowMedicationPopup] = useState(false); // Estado para mostrar el popup de medicaciones
  const [newMedication, setNewMedication] = useState({
    name: "",
    dose: "",
    frequency: "",
    startDate: new Date().toISOString().split("T")[0], // Fecha de hoy por defecto
    endDate: "",
    status: "En curso", // Estado inicial
  });

  useEffect(() => {
    setLoading(true); // Activar el indicador de carga
    const fetchPets = async () => {
      try {
        if (currentHome) {
          const linkedPets = await getLinkedPets(currentHome.id); // Obtener mascotas vinculadas al hogar
          setPets(linkedPets);

          // Cargar las vacunas, historial clínico y medicaciones de cada mascota
          const vaccinesData = {};
          const clinicalHistoryData = {};
          const medicationsData = {};

          for (const pet of linkedPets) {
            // Cargar vacunas
            const petVaccines = await getVaccines(pet.id);
            vaccinesData[pet.id] = petVaccines;

            // Cargar historial clínico
            const petClinicalHistory = await getClinicalHistory(pet.id);
            clinicalHistoryData[pet.id] = petClinicalHistory;

            // Cargar medicaciones
            const petMedications = await getMedications(pet.id);
            medicationsData[pet.id] = petMedications;
          }

          setVaccines(vaccinesData);
          setClinicalHistory(clinicalHistoryData);
          setMedications(medicationsData);
        }
      } catch (err) {
        console.error("Error al cargar las mascotas o sus datos:", err.message);
        setError("No se pudieron cargar las mascotas o sus datos. Intenta nuevamente.");
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

  const handleAddVaccine = (petId) => {
    setCurrentPetId(petId); // Establecer la mascota actual
    setShowPopup(true); // Mostrar el popup
  };

  const handleSaveVaccine = async () => {
    try {
      setLoading(true); // Mostrar indicador de carga
      await addVaccine(currentPetId, newVaccine); // Guardar la vacuna en la base de datos
      console.log("Vacuna guardada:", newVaccine);

      // Actualizar las vacunas en el estado
      setVaccines((prev) => ({
        ...prev,
        [currentPetId]: [...(prev[currentPetId] || []), newVaccine],
      }));

      setShowPopup(false); // Cerrar el popup
      setNewVaccine({
        name: "",
        applicationDate: new Date().toISOString().split("T")[0],
        nextDoseDate: "",
        veterinarian: "",
      });
    } catch (error) {
      console.error("Error al guardar la vacuna:", error.message);
      setError("No se pudo guardar la vacuna. Intenta nuevamente.");
    } finally {
      setLoading(false); // Ocultar indicador de carga
    }
  };

  const handleDeleteVaccine = async (petId, vaccine) => {
    try {
      setLoading(true); // Mostrar indicador de carga
      await deleteVaccine(petId, vaccine); // Eliminar la vacuna de la base de datos
      console.log("Vacuna eliminada:", vaccine);

      // Actualizar las vacunas en el estado
      setVaccines((prev) => ({
        ...prev,
        [petId]: prev[petId].filter((v) => v.name !== vaccine.name),
      }));
    } catch (error) {
      console.error("Error al eliminar la vacuna:", error.message);
      setError("No se pudo eliminar la vacuna. Intenta nuevamente.");
    } finally {
      setLoading(false); // Ocultar indicador de carga
    }
  };

  const handleAddClinicalEntry = (petId) => {
    setCurrentPetId(petId); // Establecer la mascota actual
    setShowClinicalPopup(true); // Mostrar el popup
  };

  const handleSaveClinicalEntry = async () => {
    try {
      setLoading(true); // Mostrar indicador de carga
      await addClinicalEntry(currentPetId, newClinicalEntry); // Guardar la entrada en la base de datos
      console.log("Entrada de historial clínico guardada:", newClinicalEntry);

      // Actualizar el historial clínico en el estado
      setClinicalHistory((prev) => ({
        ...prev,
        [currentPetId]: [...(prev[currentPetId] || []), newClinicalEntry],
      }));

      setShowClinicalPopup(false); // Cerrar el popup
      setNewClinicalEntry({
        date: new Date().toISOString().split("T")[0],
        reason: "",
        diagnosis: "",
        treatment: "",
        medication: "",
        veterinarian: "",
      });
    } catch (error) {
      console.error("Error al guardar la entrada del historial clínico:", error.message);
      setError("No se pudo guardar la entrada del historial clínico. Intenta nuevamente.");
    } finally {
      setLoading(false); // Ocultar indicador de carga
    }
  };

  const handleDeleteClinicalEntry = async (petId, clinicalEntry) => {
    try {
      setLoading(true); // Mostrar indicador de carga
      await deleteClinicalEntry(petId, clinicalEntry); // Eliminar la entrada del historial clínico de la base de datos
      console.log("Entrada de historial clínico eliminada:", clinicalEntry);

      // Actualizar el historial clínico en el estado
      setClinicalHistory((prev) => ({
        ...prev,
        [petId]: prev[petId].filter((entry) => entry.date !== clinicalEntry.date),
      }));
    } catch (error) {
      console.error("Error al eliminar la entrada del historial clínico:", error.message);
      setError("No se pudo eliminar la entrada del historial clínico. Intenta nuevamente.");
    } finally {
      setLoading(false); // Ocultar indicador de carga
    }
  };

  const handleAddMedication = (petId) => {
    setCurrentPetId(petId); // Establecer la mascota actual
    setShowMedicationPopup(true); // Mostrar el popup
  };

  const handleSaveMedication = async () => {
    try {
      setLoading(true); // Mostrar indicador de carga
      await addMedication(currentPetId, newMedication); // Guardar la medicación en la base de datos
      console.log("Medicación guardada:", newMedication);

      // Actualizar las medicaciones en el estado
      setMedications((prev) => ({
        ...prev,
        [currentPetId]: [...(prev[currentPetId] || []), newMedication],
      }));

      setShowMedicationPopup(false); // Cerrar el popup
      setNewMedication({
        name: "",
        dose: "",
        frequency: "",
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
        status: "En curso",
      });
    } catch (error) {
      console.error("Error al guardar la medicación:", error.message);
      setError("No se pudo guardar la medicación. Intenta nuevamente.");
    } finally {
      setLoading(false); // Ocultar indicador de carga
    }
  };

  const handleDeleteMedication = async (petId, medication) => {
    try {
      setLoading(true); // Mostrar indicador de carga
      await deleteMedication(petId, medication); // Eliminar la medicación de la base de datos
      console.log("Medicación eliminada:", medication);

      // Actualizar las medicaciones en el estado
      setMedications((prev) => ({
        ...prev,
        [petId]: prev[petId].filter((med) => med.name !== medication.name),
      }));
    } catch (error) {
      console.error("Error al eliminar la medicación:", error.message);
      setError("No se pudo eliminar la medicación. Intenta nuevamente.");
    } finally {
      setLoading(false); // Ocultar indicador de carga
    }
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
                <button
                  className="add-vaccine-button"
                  onClick={() => handleAddVaccine(pet.id)}
                >
                  Agregar Vacuna
                </button>
                <ul>
                  {vaccines[pet.id]?.map((vaccine, index) => (
                    <li key={index} className="vaccine-item">
                      <p>
                        <strong>Nombre:</strong> {vaccine.name}
                      </p>
                      <p>
                        <strong>Fecha de Aplicación:</strong>{" "}
                        {vaccine.applicationDate}
                      </p>
                      {vaccine.nextDoseDate && (
                        <p>
                          <strong>Próxima Dosis:</strong> {vaccine.nextDoseDate}
                        </p>
                      )}
                      <p>
                        <strong>Veterinario:</strong> {vaccine.veterinarian}
                      </p>
                      <button
                        className="delete-vaccine-button"
                        onClick={() => handleDeleteVaccine(pet.id, vaccine)}
                      >
                        Eliminar
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Historial clínico */}
          <div className="section">
            <h3
              className="section-title"
              onClick={() => toggleSection(pet.id, "clinicalHistory")}
            >
              Historial Clínico
            </h3>
            {expandedSections[pet.id]?.clinicalHistory && (
              <div className="section-content">
                <button
                  className="add-clinical-entry-button"
                  onClick={() => handleAddClinicalEntry(pet.id)}
                >
                  Agregar Entrada
                </button>
                <ul>
                  {clinicalHistory[pet.id]?.map((entry, index) => (
                    <li key={index} className="clinical-entry-item">
                      <p>
                        <strong>Fecha:</strong> {entry.date}
                      </p>
                      <p>
                        <strong>Motivo:</strong> {entry.reason}
                      </p>
                      <p>
                        <strong>Diagnóstico:</strong> {entry.diagnosis}
                      </p>
                      <p>
                        <strong>Tratamiento:</strong> {entry.treatment}
                      </p>
                      <p>
                        <strong>Medicación:</strong> {entry.medication}
                      </p>
                      <p>
                        <strong>Veterinario:</strong> {entry.veterinarian}
                      </p>
                      <button
                        className="delete-clinical-entry-button"
                        onClick={() => handleDeleteClinicalEntry(pet.id, entry)}
                      >
                        Eliminar
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Medicaciones activas */}
          <div className="section">
            <h3
              className="section-title"
              onClick={() => toggleSection(pet.id, "medications")}
            >
              Medicaciones Activas
            </h3>
            {expandedSections[pet.id]?.medications && (
              <div className="section-content">
                <button
                  className="add-medication-button"
                  onClick={() => handleAddMedication(pet.id)}
                >
                  Agregar Medicación
                </button>
                <ul>
                  {medications[pet.id]?.map((medication, index) => (
                    <li key={index} className="medication-item">
                      <p>
                        <strong>Nombre:</strong> {medication.name}
                      </p>
                      <p>
                        <strong>Dosis:</strong> {medication.dose}
                      </p>
                      <p>
                        <strong>Frecuencia:</strong> {medication.frequency}
                      </p>
                      <p>
                        <strong>Fecha de Inicio:</strong> {medication.startDate}
                      </p>
                      <p>
                        <strong>Fecha de Fin:</strong> {medication.endDate}
                      </p>
                      <p>
                        <strong>Estado:</strong> {medication.status}
                      </p>
                      <button
                        className="delete-medication-button"
                        onClick={() => handleDeleteMedication(pet.id, medication)}
                      >
                        Eliminar
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Popup para agregar vacuna */}
      {showPopup && (
        <div className="salud-popup-overlay">
          <div className="salud-popup">
            <h3>Agregar Vacuna</h3>
            <label>
              Nombre de la vacuna:
              <input
                type="text"
                value={newVaccine.name}
                onChange={(e) =>
                  setNewVaccine({ ...newVaccine, name: e.target.value })
                }
              />
            </label>
            <label>
              Fecha de aplicación:
              <input
                type="date"
                value={newVaccine.applicationDate}
                onChange={(e) =>
                  setNewVaccine({
                    ...newVaccine,
                    applicationDate: e.target.value,
                  })
                }
              />
            </label>
            <label>
              Fecha de próxima dosis (si aplica):
              <input
                type="date"
                value={newVaccine.nextDoseDate}
                onChange={(e) =>
                  setNewVaccine({ ...newVaccine, nextDoseDate: e.target.value })
                }
              />
            </label>
            <label>
              Veterinario:
              <input
                type="text"
                value={newVaccine.veterinarian}
                onChange={(e) =>
                  setNewVaccine({ ...newVaccine, veterinarian: e.target.value })
                }
              />
            </label>
            <div className="salud-popup-buttons">
              <button onClick={handleSaveVaccine}>Guardar</button>
              <button onClick={() => setShowPopup(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Popup para agregar entrada al historial clínico */}
      {showClinicalPopup && (
        <div className="salud-popup-overlay">
          <div className="salud-popup">
            <h3>Agregar Entrada al Historial Clínico</h3>
            <label>
              Fecha:
              <input
                type="date"
                value={newClinicalEntry.date}
                onChange={(e) =>
                  setNewClinicalEntry({ ...newClinicalEntry, date: e.target.value })
                }
              />
            </label>
            <label>
              Motivo de consulta:
              <input
                type="text"
                value={newClinicalEntry.reason}
                onChange={(e) =>
                  setNewClinicalEntry({
                    ...newClinicalEntry,
                    reason: e.target.value,
                  })
                }
              />
            </label>
            <label>
              Diagnóstico:
              <input
                type="text"
                value={newClinicalEntry.diagnosis}
                onChange={(e) =>
                  setNewClinicalEntry({
                    ...newClinicalEntry,
                    diagnosis: e.target.value,
                  })
                }
              />
            </label>
            <label>
              Tratamiento:
              <input
                type="text"
                value={newClinicalEntry.treatment}
                onChange={(e) =>
                  setNewClinicalEntry({
                    ...newClinicalEntry,
                    treatment: e.target.value,
                  })
                }
              />
            </label>
            <label>
              Medicación indicada:
              <input
                type="text"
                value={newClinicalEntry.medication}
                onChange={(e) =>
                  setNewClinicalEntry({
                    ...newClinicalEntry,
                    medication: e.target.value,
                  })
                }
              />
            </label>
            <label>
              Veterinario que atendió:
              <input
                type="text"
                value={newClinicalEntry.veterinarian}
                onChange={(e) =>
                  setNewClinicalEntry({
                    ...newClinicalEntry,
                    veterinarian: e.target.value,
                  })
                }
              />
            </label>
            <div className="salud-popup-buttons">
              <button onClick={handleSaveClinicalEntry}>Guardar</button>
              <button onClick={() => setShowClinicalPopup(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Popup para agregar medicación */}
      {showMedicationPopup && (
        <div className="salud-popup-overlay">
          <div className="salud-popup">
            <h3>Agregar Medicación</h3>
            <label>
              Nombre del medicamento:
              <input
                type="text"
                value={newMedication.name}
                onChange={(e) =>
                  setNewMedication({ ...newMedication, name: e.target.value })
                }
              />
            </label>
            <label>
              Dosis:
              <input
                type="text"
                value={newMedication.dose}
                onChange={(e) =>
                  setNewMedication({ ...newMedication, dose: e.target.value })
                }
              />
            </label>
            <label>
              Frecuencia:
              <input
                type="text"
                value={newMedication.frequency}
                onChange={(e) =>
                  setNewMedication({ ...newMedication, frequency: e.target.value })
                }
              />
            </label>
            <label>
              Fecha de Inicio:
              <input
                type="date"
                value={newMedication.startDate}
                onChange={(e) =>
                  setNewMedication({ ...newMedication, startDate: e.target.value })
                }
              />
            </label>
            <label>
              Fecha de Fin:
              <input
                type="date"
                value={newMedication.endDate}
                onChange={(e) =>
                  setNewMedication({ ...newMedication, endDate: e.target.value })
                }
              />
            </label>
            <label>
              Estado:
              <select
                value={newMedication.status}
                onChange={(e) =>
                  setNewMedication({ ...newMedication, status: e.target.value })
                }
              >
                <option value="En curso">En curso</option>
                <option value="Finalizado">Finalizado</option>
              </select>
            </label>
            <div className="salud-popup-buttons">
              <button onClick={handleSaveMedication}>Guardar</button>
              <button onClick={() => setShowMedicationPopup(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Salud;