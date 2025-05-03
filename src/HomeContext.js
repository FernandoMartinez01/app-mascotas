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
