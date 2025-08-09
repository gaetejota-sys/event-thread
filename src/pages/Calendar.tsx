import React, { useState, useMemo } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Header } from '@/components/layout/Header';
import { RaceEventModal } from '@/components/calendar/RaceEventModal';
import { useRaces } from '@/hooks/useRaces';
import { Race } from '@/types/race';

// Configure moment to use Spanish locale
moment.locale('es');
const localizer = momentLocalizer(moment);

// Custom styles for the calendar
const calendarStyle = {
  height: 'calc(100vh - 200px)',
  margin: '20px',
};

// Messages in Spanish
const messages = {
  allDay: 'Todo el día',
  previous: 'Anterior',
  next: 'Siguiente',
  today: 'Hoy',
  month: 'Mes',
  week: 'Semana',
  day: 'Día',
  agenda: 'Agenda',
  date: 'Fecha',
  time: 'Hora',
  event: 'Evento',
  noEventsInRange: 'No hay eventos en este rango',
  showMore: (total: number) => `+ Ver más (${total})`,
};

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Race;
}

export const CalendarPage = () => {
  const [selectedEvent, setSelectedEvent] = useState<Race | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { races, loading } = useRaces();

  // Transform races into calendar events
  const events: CalendarEvent[] = useMemo(() => {
    return races.map((race) => {
      const eventDate = new Date(race.event_date);
      
      return {
        id: race.id,
        title: race.title,
        start: eventDate,
        end: eventDate,
        resource: race,
      };
    });
  }, [races]);

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event.resource);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
    setIsModalOpen(false);
  };

  // Event style getter for custom colors
  const eventStyleGetter = (event: CalendarEvent) => {
    return {
      style: {
        backgroundColor: '#3b82f6',
        borderRadius: '8px',
        opacity: 0.8,
        color: 'white',
        border: 'none',
        display: 'block',
        fontWeight: '500',
        fontSize: '12px',
        padding: '2px 6px',
      },
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Cargando calendario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Calendario de Carreras</h1>
          <p className="text-muted-foreground mt-2">
            Encuentra todas las carreras programadas. Haz clic en cualquier evento para ver detalles y ubicación.
          </p>
        </div>

        <div className="bg-card rounded-lg shadow-sm border border-border p-4">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={calendarStyle}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventStyleGetter}
            messages={messages}
            views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
            defaultView={Views.MONTH}
            popup
            showMultiDayTimes
            step={60}
            showAllEvents
            doShowMoreDrillDown
            formats={{
              monthHeaderFormat: 'MMMM YYYY',
              dayHeaderFormat: 'dddd DD MMMM',
              dayRangeHeaderFormat: ({ start, end }) => 
                `${moment(start).format('DD MMM')} - ${moment(end).format('DD MMM YYYY')}`,
              agendaHeaderFormat: ({ start, end }) =>
                `${moment(start).format('DD MMM YYYY')} - ${moment(end).format('DD MMM YYYY')}`,
              agendaDateFormat: 'ddd DD MMM',
              agendaTimeFormat: 'HH:mm',
              agendaTimeRangeFormat: ({ start, end }) =>
                `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`,
            }}
          />
        </div>
      </div>

      <RaceEventModal
        race={selectedEvent}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};