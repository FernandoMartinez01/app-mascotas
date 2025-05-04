import {
    collection,
    addDoc,
    getDocs,
    updateDoc,
    doc,
    deleteDoc,
    Timestamp
} from "firebase/firestore";
import { db } from '../../firebaseConfig';

// **Crear un producto en el stock**
export const createStockItem = async (homeId, item) => {
    try {
        const stockRef = collection(db, "homes", homeId, "stock"); // Subcolección 'stock' dentro del hogar
        const docRef = await addDoc(stockRef, {
            id: "", // Inicialmente vacío, se actualizará después
            name: item.name,
            category: item.category,
            quantity: item.quantity,
            unit: item.unit,
            purchaseDate: item.purchaseDate,
            createdAt: Timestamp.now(),
        });

        // Actualizar el campo `id` con el ID del documento generado
        await updateDoc(docRef, { id: docRef.id });

        return { id: docRef.id, ...item }; // Retornar el ID junto con los datos
    } catch (error) {
        console.error("Error al agregar el elemento al stock:", error.message);
        throw new Error("No se pudo agregar el elemento al stock.");
    }
};

// **Obtener los productos del stock asociados a un hogar**
export const getStockItems = async (homeId) => {
    try {
        const stockRef = collection(db, "homes", homeId, "stock");
        const querySnapshot = await getDocs(stockRef);

        // Verificar si la subcolección está vacía
        if (querySnapshot.empty) {
            // console.log("La subcolección 'stock' está vacía o no existe.");
            return []; // Retornar un arreglo vacío
        }

        // Mapea los documentos obtenidos y verifica que los datos sean válidos
        const stockItems = querySnapshot.docs.map((doc) => {
            const data = doc.data();

            // Validar que los datos tengan el formato esperado
            if (typeof data.name !== "string") {
                console.error(`El campo 'name' no es una cadena en el documento ${doc.id}`);
                throw new Error("Formato de datos incorrecto en el stock.");
            }

            return { id: doc.id, ...data };
        });

        // console.log("Productos del stock obtenidos:", stockItems);
        return stockItems;
    } catch (error) {
        console.error("Error al obtener los productos del stock:", error.message);
        throw new Error("No se pudieron obtener los productos del stock.");
    }
};

// **Actualizar un producto en el stock**
export const updateStockItem = async (homeId, productId, updates) => {
    try {
        console.log("Actualizando producto:", productId, "con datos:", updates); // Log para depurar
        const productRef = doc(db, "homes", homeId, "stock", productId);
        await updateDoc(productRef, updates); // Actualizar el documento con los nuevos datos
    } catch (error) {
        console.error("Error al actualizar el producto en el stock:", error.message);
        throw new Error("No se pudo actualizar el producto en el stock.");
    }
};

// **Eliminar un producto del stock**
export const deleteStockItem = async (homeId, productId) => {
    try {
        const productRef = doc(db, "homes", homeId, "stock", productId); // Referencia al documento en la subcolección
        await deleteDoc(productRef); // Eliminar el documento
        // console.log(`Producto con ID ${productId} eliminado correctamente.`);
    } catch (error) {
        console.error("Error al eliminar el producto del stock:", error.message);
        throw new Error("No se pudo eliminar el producto del stock.");
    }
};