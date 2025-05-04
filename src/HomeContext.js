import React, { createContext, useContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getUserHome } from "./services/auth/homeService";
import { app } from "./firebaseConfig";

const HomeContext = createContext();

export const HomeProvider = ({ children }) => {
  const [currentHome, setCurrentHome] = useState(null);
  const [loadingHome, setLoadingHome] = useState(true); // Estado para manejar la carga del hogar
  const auth = getAuth(app);

  useEffect(() => {
    const fetchHome = async (user) => {
      try {
        const home = await getUserHome(user.uid);
        if (home) {
          setCurrentHome(home);
          console.log("Hogar cargado desde Firebase:", home);
        } else {
          console.log("No se encontró un hogar vinculado para el usuario.");
        }
      } catch (error) {
        console.error("Error al cargar el hogar desde Firebase:", error.message);
      } finally {
        setLoadingHome(false); // Finalizar la carga del hogar
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchHome(user);
      } else {
        setCurrentHome(null);
        setLoadingHome(false); // Finalizar la carga si no hay usuario
      }
    });

    return () => unsubscribe(); // Limpiar el listener al desmontar
  }, [auth]);

  return (
    <HomeContext.Provider value={{ currentHome, setCurrentHome, loadingHome }}>
      {children}
    </HomeContext.Provider>
  );
};

export const useHome = () => {
  const context = useContext(HomeContext);
  if (!context) {
    throw new Error("useHome debe ser usado dentro de un HomeProvider");
  }
  return context;
};

/*
import React, { createContext, useContext, useState } from "react";

// Crear el contexto
const HomeContext = createContext();

// Proveedor del contexto
export const HomeProvider = ({ children }) => {
  const [currentHome, setCurrentHome] = useState(null); // Estado para el hogar actual

  return (
    <HomeContext.Provider value={{ currentHome, setCurrentHome }}>
      {children}
    </HomeContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useHome = () => {
  const context = useContext(HomeContext);
  if (!context) {
    throw new Error("useHome debe ser usado dentro de un HomeProvider");
  }
  return context;
};
*/