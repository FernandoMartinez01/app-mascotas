// src/firebaseService.js
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import app from "./firebaseConfig";

const db = getFirestore(app);

// Obtener los datos de inventario del gato
export const getInventario = async () => {
  const ref = doc(db, "mascotas", "gato");
  const snapshot = await getDoc(ref);
  return snapshot.exists() ? snapshot.data() : null;
};

// Guardar datos (por ejemplo: actualizar cantidades)
export const setInventario = async (datos) => {
  const ref = doc(db, "mascotas", "gato");
  await setDoc(ref, datos);
};
