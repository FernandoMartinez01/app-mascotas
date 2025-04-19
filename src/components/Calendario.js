import React, { useState, useEffect } from "react";
import { Calendar, Views, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useHome } from "../HomeContext";
import { getCalendarEvents, createCalendarEvent, getStockItems, updateStockItem, updateCalendarEvent, deleteCalendarEvent } from "../authService";

const localizer = momentLocalizer(moment);

const CustomToolbar = ({ onView, view }) => {
  return (
    <div className="custom-toolbar">
      <button
        className={view === Views.DAY ? "active" : ""}
        onClick={() => onView(Views.DAY)}
      >
        Día
      </button>
      <button
        className={view === Views.WEEK ? "active" : ""}
        onClick={() => onView(Views.WEEK)}
      >
        Semana
      </button>
      <button
        className={view === Views.MONTH ? "active" : ""}
        onClick={() => onView(Views.MONTH)}
      >
        Mes
      </button>
      <button
        className={view === Views.AGENDA ? "active" : ""}
        onClick={() => onView(Views.AGENDA)}
      >
        Agenda
      </button>
    </div>
  );
};

const Calendario = ({ selectedPet }) => {
  const { currentHome } = useHome(); // Obtener el hogar actual del contexto
  const [events, setEvents] = useState([]); // Eventos del calendario
  const [error, setError] = useState(""); // Estado para manejar errores
  const [showPopup, setShowPopup] = useState(false); // Controla si se muestra el popup inicial
  const [popupType, setPopupType] = useState(""); // Controla el tipo de popup (comida, baño, medicamentos)
  const [stockItems, setStockItems] = useState([]); // Elementos del stock
  const [selectedItems, setSelectedItems] = useState([]); // Elementos seleccionados para el evento
  const [eventDate, setEventDate] = useState(new Date().toISOString().slice(0, 16)); // Fecha y hora del evento
  const [selectedEvent, setSelectedEvent] = useState(null); // Evento seleccionado

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        if (currentHome) {
          console.log("Cargando eventos para el hogar:", currentHome.id); // Log para depurar
          const calendarEvents = await getCalendarEvents(currentHome.id); // Obtener los eventos del calendario
          if (selectedPet === "Todas") {
            setEvents(calendarEvents); // Mostrar todos los eventos
          } else {
            // Filtrar eventos por mascota seleccionada
            const filteredEvents = calendarEvents.filter(
              (event) => event.petId === selectedPet
            );
            setEvents(filteredEvents);
          }
          console.log("Eventos cargados en el estado:", calendarEvents); // Log para verificar el estado
        }
      } catch (err) {
        console.error("Error al cargar los eventos del calendario:", err.message);
        setError("No se pudieron cargar los eventos del calendario. Intenta nuevamente.");
      }
    };
  
    fetchEvents();
  }, [currentHome, selectedPet]);

  // Cargar los elementos del stock con categoría específica
  const fetchStockItems = async (category) => {
    try {
      if (currentHome) {
        const items = await getStockItems(currentHome.id);
        const filteredItems = items.filter((item) => item.category === category);
        setStockItems(filteredItems);
      }
    } catch (err) {
      console.error("Error al cargar los elementos del stock:", err.message);
    }
  };

  // Manejar la creación del evento
  const handleCreateEvent = async (title) => {
    try {
      const newEvent = {
        title,
        start: new Date(eventDate),
        end: new Date(eventDate),
        petId: selectedPet,
        items: selectedItems,
      };
      await createCalendarEvent(currentHome.id, newEvent);
      setEvents((prev) => [...prev, newEvent]);

      // Actualizar el stock si se ingresaron cantidades
      for (const selectedItem of selectedItems) {
        if (selectedItem.quantity) {
          const stockItem = stockItems.find((item) => item.id === selectedItem.id);
          const updatedQuantity = stockItem.quantity - selectedItem.quantity;
          await updateStockItem(currentHome.id, selectedItem.id, {
            quantity: updatedQuantity,
          });
        }
      }

      // Limpiar el estado y cerrar el popup
      setSelectedItems([]);
      setEventDate(new Date().toISOString().slice(0, 16));
      setShowPopup(false);
      setPopupType("");
    } catch (err) {
      console.error("Error al crear el evento:", err.message);
      setError("No se pudo crear el evento. Intenta nuevamente.");
    }
  };

  // Función para manejar la selección de elementos del stock
  const handleSelectItem = (itemId, quantity) => {
    setSelectedItems((prev) => {
      const existingItem = prev.find((item) => item.id === itemId);
      if (existingItem) {
        // Actualizar la cantidad si el elemento ya está seleccionado
        return prev.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        );
      } else {
        // Agregar un nuevo elemento al estado
        return [...prev, { id: itemId, quantity }];
      }
    });
  };

  return (
    <div className="calendar-container">
      <h2>Calendario</h2>

      {/* Botón para abrir el popup */}
      <button className="add-event-button" onClick={() => setShowPopup(true)}>
        +
      </button>

      {/* Mostrar errores */}
      {error && <p className="error">{error}</p>}

      {/* Popup inicial */}
      {showPopup && !popupType && (
        <div className="popup popup-calendario">
          <div className="popup-content">
            <h3>Selecciona el tipo de evento</h3>
            <button onClick={() => { setPopupType("comida"); fetchStockItems("comida"); }}>
              Comida
            </button>
            <button onClick={() => setPopupType("baño")}>Baño</button>
            <button onClick={() => { setPopupType("medicamentos"); fetchStockItems("medicamentos"); }}>
              Medicamentos
            </button>
            <button className="popup-close" onClick={() => setShowPopup(false)}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Popup para comida */}
      {popupType === "comida" && (
        <div className="popup popup-calendario">
          <div className="popup-content">
            <h3>Agregar Evento de Comida</h3>
            {stockItems.map((item) => (
              <div key={item.id}>
                <label>
                  {item.name} (Disponible: {item.quantity})
                  <input
                    type="number"
                    min="0"
                    placeholder="Cantidad"
                    onChange={(e) =>
                      handleSelectItem(item.id, parseInt(e.target.value, 10) || 0)
                    }
                  />
                </label>
              </div>
            ))}
            <label>
              Fecha y Hora:
              <input
                type="datetime-local"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </label>
            <button onClick={() => handleCreateEvent("Comida")}>Aceptar</button>
            <button className="popup-close" onClick={() => setPopupType("")}>
              Volver
            </button>
          </div>
        </div>
      )}

      {/* Popup para baño */}
      {popupType === "baño" && (
        <div className="popup popup-calendario">
          <div className="popup-content">
            <h3>Agregar Evento de Baño</h3>
            <div className="bath-options">
              <button onClick={() => handleCreateEvent("Pis")} style={{ backgroundColor: "yellow" }}>
                Pis
              </button>
              <button onClick={() => handleCreateEvent("Caca")} style={{ backgroundColor: "brown", color: "white" }}>
                Caca
              </button>
            </div>
            <label>
              Fecha y Hora:
              <input
                type="datetime-local"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </label>
            <button className="popup-close" onClick={() => setPopupType("")}>
              Volver
            </button>
          </div>
        </div>
      )}

      {/* Popup para medicamentos */}
      {popupType === "medicamentos" && (
        <div className="popup popup-calendario">
          <div className="popup-content">
            <h3>Agregar Evento de Medicamentos</h3>
            {stockItems.map((item) => (
              <div key={item.id}>
                <label>
                  {item.name} (Disponible: {item.quantity})
                  <input
                    type="number"
                    min="0"
                    placeholder="Cantidad"
                    onChange={(e) =>
                      handleSelectItem(item.id, parseInt(e.target.value, 10) || 0)
                    }
                  />
                </label>
              </div>
            ))}
            <label>
              Fecha y Hora:
              <input
                type="datetime-local"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </label>
            <button onClick={() => handleCreateEvent("Medicamentos")}>Aceptar</button>
            <button className="popup-close" onClick={() => setPopupType("")}>
              Volver
            </button>
          </div>
        </div>
      )}

      {/* Popup OnSelect */}
      {popupType === "editar" && selectedEvent && (
        <div className="popup popup-calendario">
          <div className="popup-content">
            <h3>Editar Evento</h3>
            <label>
              Título:
              <input
                type="text"
                value={selectedEvent.title}
                onChange={(e) =>
                  setSelectedEvent({ ...selectedEvent, title: e.target.value })
                }
              />
            </label>
            {selectedEvent.items?.map((item, index) => (
              <div key={index}>
                <label>
                  {item.name} (Cantidad actual: {item.quantity})
                  <input
                    type="number"
                    min="0"
                    value={item.quantity}
                    onChange={(e) => {
                      const newQuantity = parseInt(e.target.value, 10) || 0;
                      const difference = newQuantity - item.quantity;

                      // Actualizar el stock según la diferencia
                      updateStockItem(currentHome.id, item.id, {
                        quantity: stockItems.find((stock) => stock.id === item.id)
                          .quantity - difference,
                      });

                      // Actualizar la cantidad en el evento seleccionado
                      const updatedItems = [...selectedEvent.items];
                      updatedItems[index].quantity = newQuantity;
                      setSelectedEvent({ ...selectedEvent, items: updatedItems });
                    }}
                  />
                </label>
              </div>
            ))}
            <label>
              Fecha y Hora:
              <input
                type="datetime-local"
                value={new Date(selectedEvent.start).toISOString().slice(0, 16)}
                onChange={(e) =>
                  setSelectedEvent({
                    ...selectedEvent,
                    start: new Date(e.target.value),
                    end: new Date(e.target.value),
                  })
                }
              />
            </label>
            <button
              onClick={async () => {
                // Guardar los cambios en Firestore
                await updateCalendarEvent(currentHome.id, selectedEvent.id, selectedEvent);
                setEvents((prev) =>
                  prev.map((event) =>
                    event.id === selectedEvent.id ? selectedEvent : event
                  )
                );
                setShowPopup(false);
                setPopupType("");
              }}
            >
              Guardar Cambios
            </button>
            <button
              onClick={async () => {
                // Eliminar el evento de Firestore
                await deleteCalendarEvent(currentHome.id, selectedEvent.id);
                setEvents((prev) =>
                  prev.filter((event) => event.id !== selectedEvent.id)
                );
                setShowPopup(false);
                setPopupType("");
              }}
            >
              Eliminar Evento
            </button>
            <button
              className="popup-close"
              onClick={() => {
                setShowPopup(false); // Ocultar el popup
                setPopupType(""); // Restablecer el tipo de popup
                setSelectedEvent(null); // Limpiar el evento seleccionado
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Calendario */}
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "70vh", width: "100%" }}
        views={[Views.DAY, Views.WEEK, Views.MONTH, Views.AGENDA]}
        defaultView={Views.MONTH}
        components={{
          toolbar: CustomToolbar,
        }}
        messages={{
          month: "Mes",
          week: "Semana",
          day: "Día",
          agenda: "Agenda",
        }}
        onSelectEvent={(event) => {
          setSelectedEvent(event); // Guardar el evento seleccionado
          setPopupType("editar"); // Abrir el popup de edición
          setShowPopup(true);
        }}
      />
    </div>
  );
};

export default Calendario;