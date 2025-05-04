import {
    collection, 
    addDoc, 
    query, 
    getDocs, 
    updateDoc, 
    doc, 
    deleteDoc, 
    Timestamp
} from "firebase/firestore";
import { db } from '../../firebaseConfig';

// **Obtener eventos del calendario**
export const getCalendarEvents = async (homeId) => {
    try {
        // console.log("Obteniendo eventos para el hogar:", homeId); // Log para depurar
        const eventsQuery = query(collection(db, "homes", homeId, "calendar")); // Subcolección 'calendar'
        const querySnapshot = await getDocs(eventsQuery);
        const events = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                start: data.start.toDate(), // Convertir el Timestamp a Date
                end: data.end.toDate(), // Convertir el Timestamp a Date
            };
        });
        // console.log("Eventos obtenidos:", events); // Log para verificar los datos obtenidos
        return events;
    } catch (error) {
        console.error("Error al obtener los eventos del calendario:", error.message);
        throw new Error("No se pudieron obtener los eventos del calendario.");
    }
};

// **Guardar un evento en el calendario**
export const createCalendarEvent = async (homeId, event) => {
    try {
        const calendarRef = collection(db, "homes", homeId, "calendar"); // Subcolección 'calendar' dentro del hogar
        const docRef = await addDoc(calendarRef, {
            ...event,
            start: Timestamp.fromDate(event.start), // Guardar como Timestamp
            end: Timestamp.fromDate(event.end), // Guardar como Timestamp
            createdAt: Timestamp.now(), // Fecha de creación
        });

        // console.log("Evento creado con ID:", docRef.id); // Log para depurar
        return { id: docRef.id, ...event }; // Retornar el ID junto con los datos del evento
    } catch (error) {
        console.error("Error al crear el evento en el calendario:", error.message);
        throw new Error("No se pudo crear el evento en el calendario.");
    }
};

export const updateCalendarEvent = async (homeId, eventId, updatedEvent) => {
    try {
        const eventRef = doc(db, "homes", homeId, "calendar", eventId);
        await updateDoc(eventRef, {
            ...updatedEvent,
            start: Timestamp.fromDate(updatedEvent.start),
            end: Timestamp.fromDate(updatedEvent.end),
        });
        // console.log("Evento actualizado correctamente.");
    } catch (error) {
        console.error("Error al actualizar el evento:", error.message);
        throw new Error("No se pudo actualizar el evento.");
    }
};

export const deleteCalendarEvent = async (homeId, eventId) => {
    try {
        const eventRef = doc(db, "homes", homeId, "calendar", eventId);
        await deleteDoc(eventRef);
        // console.log("Evento eliminado correctamente.");
    } catch (error) {
        console.error("Error al eliminar el evento:", error.message);
        throw new Error("No se pudo eliminar el evento.");
    }
};