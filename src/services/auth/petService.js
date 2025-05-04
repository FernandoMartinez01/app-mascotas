import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    doc,
    deleteDoc,
    Timestamp
} from "firebase/firestore";
import { db } from '../../firebaseConfig';
import { v4 as uuidv4 } from "uuid";

// **Crear una mascota**
export const createPet = async (petData, homeId) => {
    try {
        // console.log("Iniciando creación de mascota...");
        // console.log("Datos enviados:", { petData, homeId });

        const linkCode = uuidv4(); // Generar un código único para la mascota

        // Guardar los datos de la mascota en Firestore
        const petRef = await addDoc(collection(db, "pets"), {
            ...petData,
            linkCode, // Código de vinculación
            homeId, // Asociar la mascota al hogar
            createdAt: Timestamp.now(), // Fecha de creación
        });

        // console.log("Mascota creada en Firebase con ID:", petRef.id);

        return { id: petRef.id, linkCode }; // Retornar el ID y el código de vinculación
    } catch (error) {
        throw new Error("Error al crear mascota: " + error.message);
    }
};

// **Obtener las mascotas vinculadas a un hogar**
export const getLinkedPets = async (homeId) => {
    try {
        // console.log("Buscando mascotas vinculadas al hogar con ID:", homeId);

        // Ajustar la consulta para comparar el subcampo 'homeId.id'
        const petsQuery = query(collection(db, "pets"), where("homeId", "==", homeId));
        const querySnapshot = await getDocs(petsQuery);

        if (querySnapshot.empty) {
            // console.log("No se encontraron mascotas vinculadas al hogar.");
            return []; // Retornar un arreglo vacío si no hay resultados
        }

        const pets = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        // console.log("Mascotas encontradas:", pets);
        return pets;
    } catch (error) {
        console.error("Error al obtener mascotas vinculadas:", error.message);
        throw new Error("No se pudieron obtener las mascotas vinculadas.");
    }
};

// **Eliminar una mascota**
export const deletePet = async (petId) => {
    try {
        const petRef = doc(db, "pets", petId);
        await deleteDoc(petRef);
    } catch (error) {
        throw new Error("Error al eliminar la mascota: " + error.message);
    }
};