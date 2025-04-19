import React, { useState, useEffect } from "react";
import { Calendar, Views, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useHome } from "../HomeContext";
import { getCalendarEvents } from "../authService";

const localizer = momentLocalizer(moment);

// Barra de herramientas personalizada
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

  // Cargar los eventos del calendario
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        if (currentHome) {
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
        }
      } catch (err) {
        console.error("Error al cargar los eventos del calendario:", err.message);
        setError("No se pudieron cargar los eventos del calendario. Intenta nuevamente.");
      }
    };

    fetchEvents();
  }, [currentHome, selectedPet]);

  return (
    <div className="calendar-container">
      <h2>Calendario</h2>

      {/* Mostrar errores */}
      {error && <p className="error">{error}</p>}

      {/* Calendario */}
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "70vh", width: "100%" }} // Ajustar el tamaño dinámicamente
        views={[Views.DAY, Views.WEEK, Views.MONTH, Views.AGENDA]}
        defaultView={Views.MONTH}
        components={{
          toolbar: CustomToolbar, // Usar la barra de herramientas personalizada
        }}
        messages={{
          month: "Mes",
          week: "Semana",
          day: "Día",
          agenda: "Agenda",
        }}
      />
    </div>
  );
};

export default Calendario;