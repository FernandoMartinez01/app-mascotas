import React, { useState, useEffect } from "react";
import "./styles/Stock.css";
import { useHome } from "../HomeContext"; // Importar el contexto del hogar
import { createStockItem, getStockItems, updateStockItem, deleteStockItem } from "../authService"; // Funciones para manejar el stock
import { useLoading } from "../context/LoadingContext";

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
  const { setLoading } = useLoading();

  // Cargar los elementos del stock al montar el componente
  useEffect(() => {
    setLoading(true); // Activar el indicador de carga
    const fetchStockItems = async () => {
      if (!currentHome) {
        // console.log("currentHome es null o no está definido."); // Log para depurar
        return;
      }

      try {
        // console.log("Cargando elementos del stock para el hogar:", currentHome.id); // Log para verificar el ID del hogar
        const items = await getStockItems(currentHome.id); // Obtener los elementos del stock vinculados al hogar
        // console.log("Elementos cargados:", items); // Log para verificar los datos obtenidos
        setStockItems(items); // Actualizar el estado local con los elementos cargados
      } catch (err) {
        console.error("Error al cargar los elementos del stock:", err.message);
        setError("No se pudieron cargar los elementos del stock. Intenta nuevamente.");
      } finally {
        setLoading(false); // Desactivar el indicador de carga
      }
    };

    fetchStockItems();
  }, [currentHome]); // Ejecutar cada vez que currentHome cambie

  // Mostrar mensaje si no hay un hogar seleccionado
  if (!currentHome) {
    return <p>No se ha seleccionado un hogar. Por favor, selecciona o crea un hogar para continuar.</p>;
  }

  // Manejar el envío del formulario para agregar o editar un elemento
  const handleAddOrEditItem = async (e) => {
    e.preventDefault();
    setError("");
  
    if (!newItem.name.trim() || !newItem.quantity.trim()) {
      setError("El nombre y la cantidad son obligatorios.");
      // console.log("Error: Campos obligatorios faltantes"); // Log para depurar
      return;
    }
  
    try {
      if (currentHome) {
        if (editingItem) {
          // Editar un elemento existente
          // console.log("Editando elemento:", editingItem); // Log para depurar
          await updateStockItem(currentHome.id, editingItem.id, newItem); // Actualizar en Firestore
          setStockItems((prevItems) =>
            prevItems.map((item) =>
              item.id === editingItem.id ? { ...item, ...newItem } : item
            )
          );
          setEditingItem(null); // Limpiar el estado de edición
        } else {
          // Agregar un nuevo elemento
          // console.log("Agregando nuevo elemento:", newItem); // Log para depurar
          const newStockItem = await createStockItem(currentHome.id, newItem); // Crear en Firestore
          // console.log("Nuevo elemento creado:", newStockItem); // Log para verificar el nuevo elemento
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
      } else {
        // console.log("Error: currentHome es null o no está definido"); // Log para depurar
      }
    } catch (err) {
      console.error("Error al agregar o editar el elemento:", err.message);
      setError("No se pudo guardar el elemento. Intenta nuevamente.");
    }
  };

  // Manejar la eliminación de un elemento
  const handleDeleteItem = async (itemId) => {
    setLoading(true); // Activar el indicador de carga
    try {
      await deleteStockItem(currentHome.id, itemId); // Eliminar de Firestore
      setStockItems((prevItems) => prevItems.filter((item) => item.id !== itemId)); // Actualizar el estado local
    } catch (err) {
      console.error("Error al eliminar el elemento:", err.message);
      setError("No se pudo eliminar el elemento. Intenta nuevamente.");
    } finally {
      setLoading(false); // Desactivar el indicador de carga
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
        return "#FFC78E"; // Naranja más vivo
      case "arena":
        return "#A8D5A3"; // Verde más vivo
      case "medicamentos":
        return "#91C9E8"; // Azul más vivo
      case "otros":
        return "#C4C4C4"; // Gris claro
      default:
        return "#FFFFFF"; // Blanco
    }
  };

  return (
    <div className="stock-container">
  
      {/* Mostrar errores */}
      {error && <p className="stock-error">{error}</p>}
  
      {/* Botón para abrir el formulario */}
      {!showForm && (
        <button onClick={() => setShowForm(true)} className="stock-add-button">
          + Agregar elemento
        </button>
      )}
  
      {/* Formulario para agregar o editar un elemento */}
      {showForm && (
        <form onSubmit={handleAddOrEditItem} className="stock-form">
          <select
            value={newItem.category}
            onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
            className="stock-select"
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
            className="stock-input"
            required
          />
          <input
            type="number"
            placeholder="Cantidad"
            value={newItem.quantity}
            onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
            className="stock-input"
            required
          />
          <select
            value={newItem.unit}
            onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
            className="stock-select"
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
            className="stock-input"
            required
          />
          <div className="stock-form-buttons">
            <button type="submit" className="stock-submit-button">
              {editingItem ? "Guardar cambios" : "Aceptar"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="stock-cancel-button"
            >
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
            <h3 className="stock-card-title">{item.name}</h3>
            <p className="stock-card-detail">
              Cantidad: {item.quantity} {item.unit}
            </p>
            <p className="stock-card-detail date">Fecha de compra: {item.purchaseDate}</p>
            <button
              className="stock-edit-button"
              onClick={() => handleEditItem(item)}
            >
              ✏️
            </button>
            <button
              className="stock-delete-button"
              onClick={() => handleDeleteItem(item.id)}
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Stock;