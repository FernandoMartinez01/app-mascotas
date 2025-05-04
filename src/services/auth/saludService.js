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