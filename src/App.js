import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth"; // Importar getAuth
import { app } from "./firebaseConfig"; // Importar la configuración de Firebase
import { getUserHome } from "./services/auth/homeService"; // Nueva función para obtener el hogar del usuario
import Login from "./components/Login";
import Home from "./components/Home";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import Mascota from "./components/Mascota";
import { HomeProvider } from "./HomeContext"; // Importar el contexto del hogar
import { useLoading } from "./context/LoadingContext";
import LoadingAnimation from "./components/LoadingAnimation";
import { onAuthStateChanged } from "firebase/auth";

const auth = getAuth(app); // Inicializar auth

function App() {
  const [initialRoute, setInitialRoute] = useState("/login"); // Ruta inicial para redirigir

  const { loading, setLoading } = useLoading(); // Obtén el estado global de carga

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true); // Activar el indicador de carga
      if (user) {
        try {
          const home = await getUserHome(user.uid); // Verificar si el usuario ya tiene un hogar
          if (home) {
            setInitialRoute("/dashboard"); // Redirigir al Dashboard si tiene un hogar
          } else {
            setInitialRoute("/home"); // Redirigir a Home si no tiene un hogar
          }
        } catch (error) {
          console.error("Error al verificar el hogar del usuario:", error.message);
          setInitialRoute("/"); // En caso de error, redirigir al Login
        } finally {
          setLoading(false); // Desactivar el indicador de carga
        }
      } else {
        setInitialRoute("/"); // Redirigir al Login si no hay usuario
        setLoading(false); // Desactivar el indicador de carga
      }
    });
  
    return () => unsubscribe(); // Limpiar el listener al desmontar
  }, []);

  return (
    <HomeProvider>
        {loading && <LoadingAnimation />} {/* Mostrar la animación si loading es true */}
        <Router>
          <div>
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