import {
  updateDoc,
  doc,
  arrayRemove,
  arrayUnion,
  getDoc,
} from "firebase/firestore";
import { db } from '../../firebaseConfig';

export const addVaccine = async (petId, vaccineData) => {
  try {
    const petRef = doc(db, "pets", petId); // Referencia al documento de la mascota
    await updateDoc(petRef, {
      vaccines: arrayUnion(vaccineData), // Agregar la vacuna al array de vacunas
    });
    console.log("Vacuna agregada correctamente.");
  } catch (error) {
    console.error("Error al agregar la vacuna:", error.message);
    throw new Error("No se pudo agregar la vacuna. Intenta nuevamente.");
  }
};

export const getVaccines = async (petId) => {
  try {
    const petRef = doc(db, "pets", petId); // Referencia al documento de la mascota
    const petDoc = await getDoc(petRef);

    if (petDoc.exists()) {
      const petData = petDoc.data();
      return petData.vaccines || []; // Retornar las vacunas o un array vacío si no existen
    } else {
      throw new Error("No se encontró la mascota.");
    }
  } catch (error) {
    console.error("Error al obtener las vacunas:", error.message);
    throw new Error("No se pudieron obtener las vacunas.");
  }
};

export const deleteVaccine = async (petId, vaccineData) => {
  try {
    const petRef = doc(db, "pets", petId); // Referencia al documento de la mascota
    await updateDoc(petRef, {
      vaccines: arrayRemove(vaccineData), // Eliminar la vacuna del array
    });
    console.log("Vacuna eliminada correctamente.");
  } catch (error) {
    console.error("Error al eliminar la vacuna:", error.message);
    throw new Error("No se pudo eliminar la vacuna.");
  }
};

export const addClinicalEntry = async (petId, clinicalData) => {
  try {
    const petRef = doc(db, "pets", petId); // Referencia al documento de la mascota
    await updateDoc(petRef, {
      clinicalHistory: arrayUnion(clinicalData), // Agregar la entrada al array de historial clínico
    });
    console.log("Entrada de historial clínico agregada correctamente.");
  } catch (error) {
    console.error("Error al agregar la entrada al historial clínico:", error.message);
    throw new Error("No se pudo agregar la entrada al historial clínico. Intenta nuevamente.");
  }
};

export const getClinicalHistory = async (petId) => {
  try {
    const petRef = doc(db, "pets", petId); // Referencia al documento de la mascota
    const petDoc = await getDoc(petRef);

    if (petDoc.exists()) {
      const petData = petDoc.data();
      return petData.clinicalHistory || []; // Retornar el historial clínico o un array vacío si no existe
    } else {
      throw new Error("No se encontró la mascota.");
    }
  } catch (error) {
    console.error("Error al obtener el historial clínico:", error.message);
    throw new Error("No se pudo obtener el historial clínico.");
  }
};

export const deleteClinicalEntry = async (petId, clinicalData) => {
  try {
    const petRef = doc(db, "pets", petId); // Referencia al documento de la mascota
    await updateDoc(petRef, {
      clinicalHistory: arrayRemove(clinicalData), // Eliminar la entrada del array de historial clínico
    });
    console.log("Entrada de historial clínico eliminada correctamente.");
  } catch (error) {
    console.error("Error al eliminar la entrada del historial clínico:", error.message);
    throw new Error("No se pudo eliminar la entrada del historial clínico.");
  }
};

export const addMedication = async (petId, medicationData) => {
  try {
    const petRef = doc(db, "pets", petId); // Referencia al documento de la mascota
    await updateDoc(petRef, {
      medications: arrayUnion(medicationData), // Agregar la medicación al array de medicaciones
    });
    console.log("Medicación agregada correctamente.");
  } catch (error) {
    console.error("Error al agregar la medicación:", error.message);
    throw new Error("No se pudo agregar la medicación. Intenta nuevamente.");
  }
};

export const getMedications = async (petId) => {
  try {
    const petRef = doc(db, "pets", petId); // Referencia al documento de la mascota
    const petDoc = await getDoc(petRef);

    if (petDoc.exists()) {
      const petData = petDoc.data();
      return petData.medications || []; // Retornar las medicaciones o un array vacío si no existen
    } else {
      throw new Error("No se encontró la mascota.");
    }
  } catch (error) {
    console.error("Error al obtener las medicaciones:", error.message);
    throw new Error("No se pudieron obtener las medicaciones.");
  }
};

export const deleteMedication = async (petId, medicationData) => {
  try {
    const petRef = doc(db, "pets", petId); // Referencia al documento de la mascota
    await updateDoc(petRef, {
      medications: arrayRemove(medicationData), // Eliminar la medicación del array
    });
    console.log("Medicación eliminada correctamente.");
  } catch (error) {
    console.error("Error al eliminar la medicación:", error.message);
    throw new Error("No se pudo eliminar la medicación.");
  }
};