import React, { useState, useEffect } from "react";
import { useHome } from "../HomeContext"; // Importar el contexto del hogar
import { createStockItem, getStockItems } from "../authService"; // Funciones para manejar el stock

const Stock = () => {
  const { currentHome } = useHome(); // Obtener el hogar actual del contexto
  const [stockItems, setStockItems] = useState([]); // Estado para los elementos del stock
  const [showForm, setShowForm] = useState(false); // Controla si se muestra el formulario
  const [newItem, setNewItem] = useState({
    category: "comida",
    name: "",
    quantity: "",
    unit: "unidad",
    purchaseDate: new Date().toISOString().split("T")[0], // Fecha de hoy por defecto
  }); // Estado para el formulario
  const [error, setError] = useState(""); // Estado para manejar errores

  // Cargar los elementos del stock al montar el componente
  useEffect(() => {
    const fetchStockItems = async () => {
      try {
        if (currentHome) {
          const items = await getStockItems(currentHome.id); // Obtener los elementos del stock vinculados al hogar
          setStockItems(items);
        }
      } catch (err) {
        console.error("Error al cargar los elementos del stock:", err.message);
        setError("No se pudieron cargar los elementos del stock. Intenta nuevamente.");
      }
    };

    fetchStockItems();
  }, [currentHome]);

  // Manejar el envío del formulario para agregar un nuevo elemento
  const handleAddItem = async (e) => {
    e.preventDefault();
    console.log("handleAddItem ejecutado"); // Verificar si la función se llama
    setError("");
  
    if (!newItem.name.trim() || !newItem.quantity.trim()) {
      setError("El nombre y la cantidad son obligatorios.");
      console.log("Error: Campos obligatorios faltantes"); // Verificar validación
      return;
    }
  
    try {
      if (currentHome) {
        console.log("Agregando elemento al hogar:", currentHome.id); // Verificar el ID del hogar
        const newStockItem = await createStockItem(currentHome.id, newItem); // Llamar a createStockItem
        console.log("Elemento agregado:", newStockItem); // Verificar el nuevo elemento
        setStockItems((prevItems) => [...prevItems, newStockItem]); // Actualizar el estado local
        setNewItem({
          category: "comida",
          name: "",
          quantity: "",
          unit: "unidad",
          purchaseDate: new Date().toISOString().split("T")[0],
        }); // Limpiar el formulario
        setShowForm(false); // Cerrar el formulario
      } else {
        console.log("Error: currentHome es null o no está definido");
      }
    } catch (err) {
      console.error("Error al agregar el elemento al stock:", err.message);
      setError("No se pudo agregar el elemento al stock. Intenta nuevamente.");
    }
  };

  // Manejar la cancelación del formulario
  const handleCancel = () => {
    setNewItem({
      category: "comida",
      name: "",
      quantity: "",
      unit: "unidad",
      purchaseDate: new Date().toISOString().split("T")[0],
    }); // Limpiar el formulario
    setShowForm(false); // Cerrar el formulario
  };

  // Obtener el color de la tarjeta según la categoría
  const getCategoryColor = (category) => {
    switch (category) {
      case "comida":
        return "orange";
      case "arena":
        return "green";
      case "medicamentos":
        return "blue";
      case "otros":
        return "gray";
      default:
        return "white";
    }
  };

  return (
    <div className="stock-container">
      <h2>Stock del hogar</h2>

      {/* Mostrar errores */}
      {error && <p className="error">{error}</p>}

      {/* Botón para abrir el formulario */}
      {!showForm && (
        <button onClick={() => setShowForm(true)} className="add-button">
          + Agregar elemento
        </button>
      )}

      {/* Formulario para agregar un nuevo elemento */}
      {showForm && (
        <form onSubmit={handleAddItem} className="stock-form">
          <select
            value={newItem.category}
            onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
            required
          >
            <option value="comida">Comida</option>
            <option value="arena">Arena</option>
            <option value="medicamentos">Medicamentos</option>
            <option value="otros">Otros</option>
          </select>
          <input
            type="text"
            placeholder="Nombre del elemento"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Cantidad"
            value={newItem.quantity}
            onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
            required
          />
          <select
            value={newItem.unit}
            onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
            required
          >
            <option value="unidad">Unidad</option>
            <option value="kg">Kg</option>
            <option value="gramo">Gramo</option>
            <option value="mililitro">Mililitro</option>
          </select>
          <input
            type="date"
            value={newItem.purchaseDate}
            onChange={(e) => setNewItem({ ...newItem, purchaseDate: e.target.value })}
            required
          />
          <div className="form-buttons">
            <button type="submit">Aceptar</button>
            <button type="button" onClick={handleCancel}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Mostrar los elementos del stock */}
      <div className="stock-items">
        {stockItems.map((item) => (
          <div
            key={item.id}
            className="stock-card"
            style={{ backgroundColor: getCategoryColor(item.category) }}
          >
            <h3>{item.name}</h3>
            <p>Cantidad: {item.quantity} {item.unit}</p>
            <p>Fecha de compra: {item.purchaseDate}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Stock;