import React, { createContext, useState, useContext } from "react";

// Crear el contexto
const LoadingContext = createContext();

// Proveedor del contexto
export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false); // Estado de carga global

  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

// Hook para usar el contexto
export const useLoading = () => {
  return useContext(LoadingContext);
};