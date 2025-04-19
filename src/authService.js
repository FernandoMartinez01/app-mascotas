import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc, 
  arrayRemove, 
  deleteDoc, 
  arrayUnion,
  Timestamp
} from "firebase/firestore"; 
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

    if (!user) {
      throw new Error("No se pudo autenticar al usuario con Google.");
    }

    console.log("Usuario autenticado con Google:", user); // Verificar el usuario autenticado
    return user; // Retornar el usuario autenticado
  } catch (error) {
    console.error("Error al iniciar sesión con Google:", error.message);
    throw new Error("No se pudo iniciar sesión con Google. Intenta nuevamente.");
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

// **Crear un hogar**
export const createHome = async (userId, homeName) => {
  try {
    const homeRef = collection(db, "homes");
    const homeDoc = await addDoc(homeRef, {
      name: homeName,
      sharedWith: [userId], // El usuario que crea el hogar se vincula automáticamente
      createdBy: userId,
      createdAt: Timestamp.now(), // Fecha de creación
    });

    // Agregar el ID del documento al propio documento
    await updateDoc(homeDoc, { id: homeDoc.id });

    console.log("Hogar creado con ID:", homeDoc.id); // Verificar el ID del hogar

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
    const homesQuery = query(collection(db, "homes"), where("sharedWith", "array-contains", userId));
    const querySnapshot = await getDocs(homesQuery);

    if (!querySnapshot.empty) {
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))[0]; // Retornar el primer hogar encontrado
    }
    return null; // Si no hay hogar, retornar null
  } catch (error) {
    console.error("Error al obtener el hogar del usuario:", error.message);
    throw new Error("No se pudo obtener el hogar del usuario.");
  }
};

// **Crear una mascota**
export const createPet = async (petData, homeId) => {
  try {
    const linkCode = uuidv4(); // Generar un código único para la mascota

    // Guardar los datos de la mascota en Firestore
    const petRef = await addDoc(collection(db, "pets"), {
      ...petData,
      linkCode, // Código de vinculación
      homeId, // Asociar la mascota al hogar
      createdAt: Timestamp.now(), // Fecha de creación
    });

    return { id: petRef.id, linkCode }; // Retornar el ID y el código de vinculación
  } catch (error) {
    throw new Error("Error al crear mascota: " + error.message);
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

// **Obtener las mascotas vinculadas a un hogar**
export const getLinkedPets = async (homeId) => {
  try {
    const petsQuery = query(collection(db, "pets"), where("homeId", "==", homeId));
    const querySnapshot = await getDocs(petsQuery);
    const pets = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return pets; // Retornar las mascotas vinculadas al hogar
  } catch (error) {
    throw new Error("Error al obtener mascotas vinculadas: " + error.message);
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

// **Crear un producto en el stock**
export const createStockItem = async (homeId, item) => {
  try {
    console.log("createStockItem ejecutado con:", homeId, item);
    const stockRef = collection(db, "homes", homeId, "stock");
    const docRef = await addDoc(stockRef, {
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      purchaseDate: item.purchaseDate,
      createdAt: Timestamp.now(),
    });
    console.log("Elemento agregado al stock con ID:", docRef.id); // Verificar el ID generado
    return { id: docRef.id, ...item }; // Retornar el ID junto con los datos
  } catch (error) {
    console.error("Error al agregar el elemento al stock:", error.message);
    throw new Error("No se pudo agregar el elemento al stock.");
  }
};

// **Obtener los productos del stock asociados a un hogar**
export const getStockItems = async (homeId) => {
  try {
    const stockQuery = query(collection(db, "stocks"), where("homeId", "==", homeId));
    const querySnapshot = await getDocs(stockQuery);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw new Error("Error al obtener los productos del stock: " + error.message);
  }
};

// **Actualizar un producto en el stock**
export const updateStockItem = async (productId, updates) => {
  try {
    const productRef = doc(db, "stocks", productId);
    await updateDoc(productRef, updates);
  } catch (error) {
    throw new Error("Error al actualizar el producto en el stock: " + error.message);
  }
};

// **Eliminar un producto del stock**
export const deleteStockItem = async (productId) => {
  try {
    const productRef = doc(db, "stocks", productId);
    await deleteDoc(productRef);
  } catch (error) {
    throw new Error("Error al eliminar el producto del stock: " + error.message);
  }
};