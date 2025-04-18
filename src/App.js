import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth"; // Importar getAuth
import { app } from "./firebaseConfig"; // Importar la configuración de Firebase
import { getLinkedPets } from "./authService";
import Login from './components/Login';
import Home from './components/Home';
import Register from './components/Register';
import Dashboard from './components/Dashboard';

const auth = getAuth(app); // Inicializar auth

function App() {
  const [initialRoute, setInitialRoute] = useState("/login");

  useEffect(() => {
    const checkLinkedPets = async () => {
      const user = auth.currentUser; // Obtener el usuario actual
      if (user) {
        const linkedPets = await getLinkedPets(user.uid);
        if (linkedPets.length > 0) {
          setInitialRoute("/dashboard");
        } else {
          setInitialRoute("/");
        }
      }
    };

    checkLinkedPets();
  }, []);

  return (
    <Router>
      <div>
        <header style={{ backgroundColor: "#007bff", color: "#fff", padding: "10px 20px", textAlign: "center" }}>
          <h1>App Mascotas</h1>
        </header>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/register" element={<Register />} /> 
        <Route path="/dashboard" element={<Dashboard />} /> 
      </Routes>
      </div>
    </Router>
  );
}

export default App;
