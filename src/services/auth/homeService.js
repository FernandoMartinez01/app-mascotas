import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    updateDoc,
    doc,
    arrayUnion,
    Timestamp
} from "firebase/firestore";
import { db } from '../../firebaseConfig';

// **Crear un hogar**
export const createHome = async (userId, homeName) => {
    try {

        // console.log("Iniciando creación del hogar...");
        // console.log("Datos enviados:", { userId, homeName });

        const homeRef = collection(db, "homes");
        const homeDoc = await addDoc(homeRef, {
            name: homeName,
            sharedWith: [userId], // El usuario que crea el hogar se vincula automáticamente
            createdBy: userId,
            createdAt: Timestamp.now(), // Fecha de creación
        });

        // console.log("Hogar creado en Firebase con ID:", homeDoc.id);

        // Agregar el ID del documento al propio documento
        await updateDoc(homeDoc, { id: homeDoc.id });

        // console.log("Hogar creado con ID:", homeDoc.id); // Verificar el ID del hogar

        // Retornar el ID y los datos que acabas de guardar
        return {
            id: homeDoc.id,
            name: homeName,
            sharedWith: [userId],
            createdBy: userId,
            createdAt: Timestamp.now(),
        };
    } catch (error) {
        console.error("Error al crear el hogar:", error.message);
        throw new Error("No se pudo crear el hogar. Intenta nuevamente.");
    }
};

// **Vincular a un hogar existente**
export const linkToHome = async (homeId, userId) => {
    try {
        // Verificar si el hogar existe
        const homeRef = doc(db, "homes", homeId);
        const homeSnapshot = await getDocs(query(collection(db, "homes"), where("__name__", "==", homeId)));

        if (homeSnapshot.empty) {
            throw new Error("El código del hogar no es válido.");
        }

        // Agregar el usuario al hogar
        await updateDoc(homeRef, {
            sharedWith: arrayUnion(userId),
        });
    } catch (error) {
        console.error("Error al vincular al hogar:", error.message);
        throw new Error("No se pudo vincular al hogar. Verifica el código e intenta nuevamente.");
    }
};

// **Obtener el hogar del usuario**
export const getUserHome = async (userId) => {
    try {
        // console.log("Buscando hogar para el usuario con ID:", userId);

        const homesQuery = query(collection(db, "homes"), where("sharedWith", "array-contains", userId));
        const querySnapshot = await getDocs(homesQuery);

        if (!querySnapshot.empty) {
            const home = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))[0];
            // console.log("Hogar encontrado:", home);
            return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))[0]; // Retornar el primer hogar encontrado
        }
        // console.log("No se encontró un hogar para el usuario.");
        return null; // Si no hay hogar, retornar null
    } catch (error) {
        console.error("Error al obtener el hogar del usuario:", error.message);
        throw new Error("No se pudo obtener el hogar del usuario.");
    }
};

// **Vincular un usuario a un hogar existente**
export const linkAccount = async (accountCode, userId) => {
    try {
        // Buscar el hogar asociado al código de vinculación
        const homeRef = doc(db, "homes", accountCode);
        const homeSnapshot = await getDocs(query(collection(db, "homes"), where("__name__", "==", accountCode)));

        if (homeSnapshot.empty) {
            throw new Error("El código del hogar no es válido.");
        }

        // Actualizar el documento del hogar para incluir al nuevo usuario
        await updateDoc(homeRef, {
            sharedWith: arrayUnion(userId), // Agregar el usuario al array de usuarios vinculados
        });

        return true; // Vinculación exitosa
    } catch (error) {
        console.error("Error al vincular al hogar:", error.message);
        throw new Error("No se pudo vincular al hogar. Verifica el código e intenta nuevamente.");
    }
};