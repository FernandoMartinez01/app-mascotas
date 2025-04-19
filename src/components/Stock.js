import React, { useState, useEffect } from "react";
import { useHome } from "../HomeContext"; // Importar el contexto del hogar
import { createStockItem, getStockItems, updateStockItem, deleteStockItem } from "../authService"; // Funciones para manejar el stock

const Stock = () => {
  const { currentHome } = useHome(); // Obtener el hogar actual del contexto
  const [stockItems, setStockItems] = useState([]); // Estado para los elementos del stock
  const [showForm, setShowForm] = useState(false); // Controla si se muestra el formulario
  const [editingItem, setEditingItem] = useState(null); // Estado para el elemento que se está editando
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

  // Manejar el envío del formulario para agregar o editar un elemento
  const handleAddOrEditItem = async (e) => {
    e.preventDefault();
    setError("");

    if (!newItem.name.trim() || !newItem.quantity.trim()) {
      setError("El nombre y la cantidad son obligatorios.");
      return;
    }

    try {
      if (currentHome) {
        if (editingItem) {
          // Editar un elemento existente
          await updateStockItem(currentHome.id, editingItem.id, newItem); // Actualizar en Firestore
          setStockItems((prevItems) =>
            prevItems.map((item) =>
              item.id === editingItem.id ? { ...item, ...newItem } : item
            )
          );
          setEditingItem(null); // Limpiar el estado de edición
        } else {
          // Agregar un nuevo elemento
          const newStockItem = await createStockItem(currentHome.id, newItem); // Crear en Firestore
          setStockItems((prevItems) => [...prevItems, newStockItem]); // Actualizar el estado local
        }

        setNewItem({
          category: "comida",
          name: "",
          quantity: "",
          unit: "unidad",
          purchaseDate: new Date().toISOString().split("T")[0],
        }); // Limpiar el formulario
        setShowForm(false); // Cerrar el formulario
      }
    } catch (err) {
      console.error("Error al agregar o editar el elemento:", err.message);
      setError("No se pudo guardar el elemento. Intenta nuevamente.");
    }
  };

  // Manejar la eliminación de un elemento
  const handleDeleteItem = async (itemId) => {
    try {
      await deleteStockItem(currentHome.id, itemId); // Eliminar de Firestore
      setStockItems((prevItems) => prevItems.filter((item) => item.id !== itemId)); // Actualizar el estado local
    } catch (err) {
      console.error("Error al eliminar el elemento:", err.message);
      setError("No se pudo eliminar el elemento. Intenta nuevamente.");
    }
  };

  // Manejar la edición de un elemento
  const handleEditItem = (item) => {
    setEditingItem(item); // Establecer el elemento que se está editando
    setNewItem(item); // Cargar los datos del elemento en el formulario
    setShowForm(true); // Mostrar el formulario
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
    setEditingItem(null); // Limpiar el estado de edición
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

      {/* Formulario para agregar o editar un elemento */}
      {showForm && (
        <form onSubmit={handleAddOrEditItem} className="stock-form">
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
            <button type="submit">{editingItem ? "Guardar cambios" : "Aceptar"}</button>
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
            <button className="edit-button" onClick={() => handleEditItem(item)}>
              ✏️
            </button>
            <button className="delete-button" onClick={() => handleDeleteItem(item.id)}>
              🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Stock;