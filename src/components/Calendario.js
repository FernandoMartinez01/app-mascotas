import React, { useState, useEffect } from "react";
import "./styles/Calendario.css";
import { Calendar, Views, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useHome } from "../HomeContext";
import { getCalendarEvents, createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from "../services/auth/calendarService";
import { getStockItems, updateStockItem } from "../services/auth/stockService";
import { useLoading } from "../context/LoadingContext";

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
  const { setLoading } = useLoading();

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        if (currentHome) {
          // console.log("Cargando eventos para el hogar:", currentHome.id); // Log para depurar
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
          // console.log("Eventos cargados en el estado:", calendarEvents); // Log para verificar el estado
        }
      } catch (err) {
        console.error("Error al cargar los eventos del calendario:", err.message);
        setError("No se pudieron cargar los eventos del calendario. Intenta nuevamente.");
      } finally {
        setLoading(false); // Desactivar el indicador de carga
      }
    };
  
    fetchEvents();
  }, [currentHome, selectedPet]);

  // Cargar los elementos del stock con categoría específica
  const fetchStockItems = async (category) => {
    setLoading(true);
    try {
      if (currentHome) {
        const items = await getStockItems(currentHome.id);
        const filteredItems = items.filter((item) => item.category === category);
        setStockItems(filteredItems);
      }
    } catch (err) {
      console.error("Error al cargar los elementos del stock:", err.message);
    } finally {
      setLoading(false); // Desactivar el indicador de carga
    }
  };

  // Manejar la creación del evento
  const handleCreateEvent = async (title) => {
    setLoading(true);
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
      
          // Asegúrate de que el valor actualizado sea válido
          if (updatedQuantity >= 0) {
            await updateStockItem(currentHome.id, selectedItem.id, {
              quantity: updatedQuantity,
            });
          } else {
            console.error("La cantidad ingresada excede el stock disponible.");
          }
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
    } finally {
      setLoading(false); // Desactivar el indicador de carga
    }
  };

  // Función para manejar la selección de elementos del stock
  const handleSelectItem = (itemId, quantity) => {
    setSelectedItems((prev) => {
      const existingItem = prev.find((item) => item.id === itemId);
      if (existingItem) {
        // Actualizar la cantidad si el elemento ya está seleccionado
        return prev.map((item) =>
          item.id === itemId ? { ...item, quantity: parseFloat(quantity) || 0 } : item
        );
      } else {
        // Agregar un nuevo elemento al estado
        return [...prev, { id: itemId, quantity: parseFloat(quantity) || 0 }];
      }
    });
  };

  return (
    <div className="calendar-container">
      <h2 className="calendar-title">Calendario</h2>
  
      {/* Botón para abrir el popup */}
      <button className="add-event-button" onClick={() => setShowPopup(true)}>
        +
      </button>
  
      {/* Mostrar errores */}
      {error && <p className="calendar-error">{error}</p>}
  
      {/* Popup inicial */}
      {showPopup && !popupType && (
        <div className="popup popup-calendario">
          <div className="calendar-popup-content">
            <h3 className="calendar-popup-title">Selecciona el tipo de evento</h3>
            <button
              className="calendar-popup-button"
              onClick={() => {
                setPopupType("comida");
                fetchStockItems("comida");
              }}
            >
              Comida
            </button>
            <button className="calendar-popup-button" onClick={() => setPopupType("baño")}>
              Baño
            </button>
            <button
              className="calendar-popup-button"
              onClick={() => {
                setPopupType("medicamentos");
                fetchStockItems("medicamentos");
              }}
            >
              Medicamentos
            </button>
            <button className="calendar-popup-close" onClick={() => setShowPopup(false)}>
              Cerrar
            </button>
          </div>
        </div>
      )}
  
      {/* Popup para comida */}
      {popupType === "comida" && (
        <div className="popup popup-calendario">
          <div className="calendar-popup-content">
            <h3 className="calendar-popup-title">Agregar Evento de Comida</h3>
            {stockItems.map((item) => (
              <div key={item.id} className="calendar-popup-item">
                <label>
                  {item.name} (Disponible: {item.quantity})
                  <input
                    type="number"
                    min="0"
                    placeholder="Cantidad"
                    className="calendar-popup-input"
                    onChange={(e) =>
                      handleSelectItem(item.id, parseInt(e.target.value, 10) || 0)
                    }
                  />
                </label>
              </div>
            ))}
            <label className="calendar-popup-label">
              Fecha y Hora:
              <input
                type="datetime-local"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="calendar-popup-input"
              />
            </label>
            <button
              className="calendar-popup-button"
              onClick={() => handleCreateEvent("Comida")}
            >
              Aceptar
            </button>
            <button className="calendar-popup-close" onClick={() => setPopupType("")}>
              Volver
            </button>
          </div>
        </div>
      )}
  
      {/* Popup para baño */}
      {popupType === "baño" && (
        <div className="popup popup-calendario">
          <div className="calendar-popup-content">
            <h3 className="calendar-popup-title">Agregar Evento de Baño</h3>
            <div className="bath-options">
              <button
                className="calendar-popup-button bath-button"
                onClick={() => handleCreateEvent("Pis")}
              >
                Pis
              </button>
              <button
                className="calendar-popup-button bath-button"
                onClick={() => handleCreateEvent("Caca")}
              >
                Caca
              </button>
            </div>
            <label className="calendar-popup-label">
              Fecha y Hora:
              <input
                type="datetime-local"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="popup-input"
              />
            </label>
            <button className="calendar-popup-close" onClick={() => setPopupType("")}>
              Volver
            </button>
          </div>
        </div>
      )}
  
      {/* Popup para medicamentos */}
      {popupType === "medicamentos" && (
        <div className="popup popup-calendario">
          <div className="calendar-popup-content">
            <h3 className="calendar-popup-title">Agregar Evento de Medicamentos</h3>
            {stockItems.map((item) => (
              <div key={item.id} className="calendar-popup-item">
                <label>
                  {item.name} (Disponible: {item.quantity})
                  <input
                    type="number"
                    min="0"
                    placeholder="Cantidad"
                    className="calendar-popup-input"
                    onChange={(e) =>
                      handleSelectItem(item.id, parseInt(e.target.value, 10) || 0)
                    }
                  />
                </label>
              </div>
            ))}
            <label className="calendar-popup-label">
              Fecha y Hora:
              <input
                type="datetime-local"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="calendar-popup-input"
              />
            </label>
            <button
              className="calendar-popup-button"
              onClick={() => handleCreateEvent("Medicamentos")}
            >
              Aceptar
            </button>
            <button className="calendar-popup-close" onClick={() => setPopupType("")}>
              Volver
            </button>
          </div>
        </div>
      )}
  
      {/* Popup OnSelect */}
      {popupType === "editar" && selectedEvent && (
        <div className="popup popup-calendario">
          <div className="calendar-popup-content">
            <h3 className="calendar-popup-title">Editar Evento</h3>
            <label className="calendar-popup-label">
              Título:
              <input
                type="text"
                value={selectedEvent.title}
                onChange={(e) =>
                  setSelectedEvent({ ...selectedEvent, title: e.target.value })
                }
                className="calendar-popup-input"
              />
            </label>
            <label className="calendar-popup-label">
              Fecha y Hora:
              <input
                type="datetime-local"
                value={new Date(selectedEvent.start)
                  .toISOString()
                  .slice(0, 16)}
                onChange={(e) =>
                  setSelectedEvent({
                    ...selectedEvent,
                    start: new Date(e.target.value),
                    end: new Date(e.target.value),
                  })
                }
                className="calendar-popup-input"
              />
            </label>
            <button
              className="calendar-popup-button"
              onClick={async () => {
                await updateCalendarEvent(
                  currentHome.id,
                  selectedEvent.id,
                  selectedEvent
                );
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
              className="calendar-popup-button"
              onClick={async () => {
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
              className="calendar-popup-close"
              onClick={() => {
                setShowPopup(false);
                setPopupType("");
                setSelectedEvent(null);
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
          setSelectedEvent(event);
          setPopupType("editar");
          setShowPopup(true);
        }}
      />
    </div>
  );
};

export default Calendario;