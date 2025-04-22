import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth"; // Importar getAuth
import { app } from "./firebaseConfig"; // Importar la configuración de Firebase
import { getUserHome } from "./authService"; // Nueva función para obtener el hogar del usuario
import Login from "./components/Login";
import Home from "./components/Home";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import Mascota from "./components/Mascota";
import { HomeProvider } from "./HomeContext"; // Importar el contexto del hogar
import { LoadingProvider, useLoading } from "./context/LoadingContext";
import LoadingAnimation from "./components/LoadingAnimation";

const auth = getAuth(app); // Inicializar auth

function App() {
  const [initialRoute, setInitialRoute] = useState("/login"); // Ruta inicial para redirigir

  const { loading, setLoading } = useLoading(); // Obtén el estado global de carga

  useEffect(() => {
    const checkUserHome = async () => {
      setLoading(true); // Activar el indicador de carga
      const user = auth.currentUser; // Obtener el usuario actual
      if (user) {
        try {
          const home = await getUserHome(user.uid); // Verificar si el usuario ya tiene un hogar
          if (home) {
            setInitialRoute("/dashboard"); // Redirigir al Dashboard si tiene un hogar
          } else {
            setInitialRoute("/"); // Redirigir al Login si no tiene un hogar
          }
        } catch (error) {
          console.error("Error al verificar el hogar del usuario:", error.message);
          setInitialRoute("/"); // En caso de error, redirigir al Login
        } finally {
          setLoading(false); // Desactivar el indicador de carga
        }
      } else {
        setLoading(false); // Desactivar el indicador de carga si no hay usuario
      }
    };

    checkUserHome();
  }, []);

  return (
    <HomeProvider>
        {loading && <LoadingAnimation />} {/* Mostrar la animación si loading es true */}
        <Router>
          <div>
            {/* <header
              style={{
                backgroundColor: "#007bff",
                color: "#fff",
                padding: "10px 20px",
                textAlign: "center",
              }}
            >
              <h1>App Mascotas</h1>
            </header> */}
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/home" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/mascota" element={<Mascota />} />
            </Routes>
          </div>
        </Router>
    </HomeProvider>
  );
}

export default App;