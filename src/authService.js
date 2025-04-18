import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { collection, addDoc, query, where, getDocs, updateDoc, doc, arrayRemove } from "firebase/firestore"; 
import app from "./firebaseConfig"; // Import the initialized Firebase app
import { db } from './firebaseConfig';
import { v4 as uuidv4 } from "uuid";


const auth = getAuth(app); // Pass the initialized app to getAuth()

// Método para registro con correo
export const registerUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error registering user: ", error.message);
    throw error;
  }
};

// Método para login con correo
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error logging in: ", error.message);
    throw error;
  }
};

// Método para login con Google
export const loginWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    return user; // Aquí puedes manejar los datos del usuario
  } catch (error) {
    console.error("Error with Google login: ", error.message);
    throw error;
  }
};

// Método para logout
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error logging out: ", error.message);
  }
};

export const createPet = async (petData, userId) => {
  try {
    const linkCode = uuidv4(); // Generar un código único

    // Guardar los datos de la mascota en Firestore
    const petRef = await addDoc(collection(db, "pets"), {
      ...petData,
      linkCode, // Código de vinculación
      sharedWith: [userId], // Vincular al creador automáticamente
    });

    return { id: petRef.id, linkCode }; // Retornar el ID y el código de vinculación
  } catch (error) {
    throw new Error("Error al crear mascota: " + error.message);
  }
};

export const linkAccount = async (accountCode, userId) => {
  try {
    // Buscar la mascota asociada al código de vinculación
    const petsQuery = query(collection(db, "pets"), where("linkCode", "==", accountCode));
    const querySnapshot = await getDocs(petsQuery);

    if (querySnapshot.empty) {
      throw new Error("Código de vinculación no válido");
    }

    // Obtener el documento de la mascota
    const petDoc = querySnapshot.docs[0];
    const petData = petDoc.data();

    // Verificar si el usuario ya está vinculado
    if (petData.sharedWith && petData.sharedWith.includes(userId)) {
      throw new Error("El usuario ya está vinculado a esta mascota");
    }

    // Actualizar el documento para incluir al nuevo usuario
    const petRef = doc(db, "pets", petDoc.id);
    await updateDoc(petRef, {
      sharedWith: [...(petData.sharedWith || []), userId],
    });

    return true; // Vinculación exitosa
  } catch (error) {
    throw new Error("Error al vincular cuenta: " + error.message);
  }
};

// Verifica si el usuario ya tiene mascotas vinculadas
export const getLinkedPets = async (userId) => {
  try {
    const petsQuery = query(collection(db, "pets"), where("sharedWith", "array-contains", userId));
    const querySnapshot = await getDocs(petsQuery);
    const pets = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return pets; // Retorna las mascotas vinculadas
  } catch (error) {
    throw new Error("Error al obtener mascotas vinculadas: " + error.message);
  }
};

export const unlinkPet = async (petId, userId) => {
  try {
    const petRef = doc(db, "pets", petId); // Referencia al documento de la mascota
    await updateDoc(petRef, {
      sharedWith: arrayRemove(userId), // Eliminar el userId del array "sharedWith"
    });
    console.log(`Mascota ${petId} desvinculada del usuario ${userId}`);
  } catch (error) {
    throw new Error("Error al desvincular la mascota: " + error.message);
  }
};