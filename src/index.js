// filepath: c:\Users\ferna\OneDrive\Documents\app-mascotas\app-mascotas\src\index.js
import React from "react";
import ReactDOM from "react-dom/client"; // Importa createRoot desde react-dom/client
import App from "./App";
import { LoadingProvider } from "./context/LoadingContext"; // Importa el LoadingProvider

const root = ReactDOM.createRoot(document.getElementById("root")); // Usa createRoot
root.render(
  <React.StrictMode>
    <LoadingProvider>
      <App />
    </LoadingProvider>
  </React.StrictMode>
);