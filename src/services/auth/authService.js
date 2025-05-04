import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import app from "../../firebaseConfig"; // Import the initialized Firebase app
import { browserLocalPersistence, setPersistence } from "firebase/auth";


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
    await setPersistence(auth, browserLocalPersistence);
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
    await setPersistence(auth, browserLocalPersistence);
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    if (!user) {
      throw new Error("No se pudo autenticar al usuario con Google.");
    }

    // console.log("Usuario autenticado con Google:", user); // Verificar el usuario autenticado
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