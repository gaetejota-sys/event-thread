import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Header } from '@/components/layout/Header';
import { HeroCarousel } from '@/components/layout/HeroCarousel';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RaceEventModal } from '@/components/calendar/RaceEventModal';
import { useRaces } from '@/hooks/useRaces';
import { Race } from '@/types/race';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCanchas } from '@/hooks/useCanchas';
import { subscribeAppEvents } from '@/lib/events';
import { Footer } from '@/components/layout/Footer';
import { Seo } from '@/components/seo/Seo';

// Configure moment to use Spanish locale
moment.locale('es');
moment.updateLocale('es', { week: { dow: 1, doy: 4 } });
const localizer = momentLocalizer(moment);

// Custom styles for the calendar
const calendarStyle = {
  height: 'calc(100vh - 200px)',
  margin: '20px',
};

// CSS personalizado para ocultar horarios
const customCSS = `
  .rbc-time-header-content .rbc-time-gutter,
  .rbc-time-content .rbc-time-gutter,
  .rbc-time-header-content .rbc-time-header-gutter,
  .rbc-time-content .rbc-time-header-gutter {
    display: none !important;
  }
  
  .rbc-time-header-content .rbc-time-header-cell,
  .rbc-time-content .rbc-time-slot {
    border-left: none !important;
  }
  
  .rbc-time-view .rbc-header {
    border-left: none !important;
  }
  
  .rbc-time-view .rbc-time-gutter {
    display: none !important;
  }
  
  .rbc-time-view .rbc-time-content {
    border-left: none !important;
  }
`;

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
  allDay: boolean;
  resource: Race;
}

export const CalendarPage = () => {
  const [selectedEvent, setSelectedEvent] = useState<Race | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { races, loading } = useRaces();
  const { canchas } = useCanchas();
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState<'fecha' | 'comuna' | 'cancha'>('fecha');
  const [selectedComuna, setSelectedComuna] = useState<string>('');
  const [selectedCanchaId, setSelectedCanchaId] = useState<string>('');

  // Aplicar CSS personalizado para ocultar horarios
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = customCSS;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const futureRaces = useMemo(() => (
    races.filter(r => {
      const d = new Date(r.event_date);
      d.setHours(0,0,0,0);
      return d >= today;
    })
  ), [races, today]);

  const comunas = useMemo(() => {
    return Array.from(new Set(races.map(r => r.comuna).filter(Boolean))).sort((a, b) => a.localeCompare(b));
  }, [races]);

  const canchasOptions = useMemo(() => {
    const byId = new Map(canchas.map(c => [c.id, c] as const));
    const map = new Map<string, { id: string, label: string }>();
    for (const r of futureRaces) {
      if (!r.cancha_id) continue;
      const cancha = byId.get(r.cancha_id);
      if (!cancha) continue; // si no tenemos nombre, no mostramos el id
      const label = `${cancha.nombre}${cancha.comuna ? ` - ${cancha.comuna}` : ''}`;
      if (!map.has(r.cancha_id)) map.set(r.cancha_id, { id: r.cancha_id, label });
    }
    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [futureRaces, canchas]);

  const filteredRaces = useMemo(() => {
    if (filterType === 'comuna') {
      if (!selectedComuna) return races;
      return races.filter(r => r.comuna === selectedComuna);
    }
    if (filterType === 'cancha') {
      const base = futureRaces; // solo futuras para este filtro
      if (!selectedCanchaId) return base;
      return base.filter(r => r.cancha_id === selectedCanchaId);
    }
    // fecha: retornar todas
    return races;
  }, [filterType, races, futureRaces, selectedComuna, selectedCanchaId]);

  // Transform races into calendar events
  const events: CalendarEvent[] = useMemo(() => {
    return filteredRaces.map((race) => {
      const eventDate = new Date(race.event_date);
      
      return {
        id: race.id,
        title: race.title,
        start: eventDate,
        end: eventDate,
        allDay: true, // Marcar como evento de todo el día
        resource: race,
      };
    });
  }, [filteredRaces]);

  // Escucha eventos cross-tab para refrescar al borrar carreras
  useEffect(() => {
    const unsubscribe = subscribeAppEvents((e) => {
      if (e.type === 'race-deleted') {
        // recargar o idealmente refetch de races; usamos reload por simplicidad
        window.location.reload();
      }
    });
    return unsubscribe;
  }, []);

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
        backgroundColor: '#2563eb',
        borderRadius: '8px',
        opacity: 0.9,
        color: 'white',
        border: 'none',
        display: 'block',
        fontWeight: '600',
        fontSize: '12px',
        padding: '2px 6px',
      },
    };
  };

  // Resaltar fines de semana y feriados
  const isWeekend = (date: Date) => {
    const d = date.getDay();
    return d === 0 || d === 6; // dom(0), sáb(6)
  };

  // Lista básica de feriados (placeholder); ideal integrar API/tabla
  const HOLIDAYS_CL = new Set<string>([
    // formato YYYY-MM-DD
  ]);
  const isHoliday = (date: Date) => HOLIDAYS_CL.has(moment(date).format('YYYY-MM-DD'));

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

  // Formatos en español: usamos Intl para forzar ES en todas las vistas
  const fmt = {
    monthLong: new Intl.DateTimeFormat('es-CL', { month: 'long', year: 'numeric' }),
    dayLong: new Intl.DateTimeFormat('es-CL', { weekday: 'long', day: '2-digit', month: 'long' }),
    dayShort: new Intl.DateTimeFormat('es-CL', { weekday: 'short', day: '2-digit', month: 'short' }),
    dayOnly: new Intl.DateTimeFormat('es-CL', { day: '2-digit' }),
    rangeDayShort: new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: 'short' }),
    timeHM: new Intl.DateTimeFormat('es-CL', { hour: '2-digit', minute: '2-digit' }),
  } as const;

  const formats = {
    monthHeaderFormat: (date: Date) => fmt.monthLong.format(date),
    dayHeaderFormat: (date: Date) => fmt.dayLong.format(date),
    dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) =>
      `${fmt.rangeDayShort.format(start)} - ${fmt.rangeDayShort.format(end)} ${end.getFullYear()}`,
    agendaHeaderFormat: ({ start, end }: { start: Date; end: Date }) =>
      `${fmt.rangeDayShort.format(start)} ${start.getFullYear()} - ${fmt.rangeDayShort.format(end)} ${end.getFullYear()}`,
    agendaDateFormat: (date: Date) => fmt.dayShort.format(date),
    agendaTimeFormat: (date: Date) => fmt.timeHM.format(date),
    agendaTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) =>
      `${fmt.timeHM.format(start)} - ${fmt.timeHM.format(end)}`,
    // Cabeceras de columnas en Semana/Día
    weekdayFormat: (date: Date) => fmt.dayShort.format(date).split(' ').slice(0,1).join(''),
    dayFormat: (date: Date) => fmt.dayShort.format(date),
  } as const;

  // Toolbar personalizado para asegurar encabezado en español
  const CustomToolbar = ({ date, onNavigate, onView, view }: any) => {
    const dtf = new Intl.DateTimeFormat('es-CL', {
      month: 'long',
      year: 'numeric',
    });
    const label = view === Views.MONTH
      ? dtf.format(date)
      : view === Views.WEEK
        ? `Semana del ${new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: 'short' }).format(date)}`
        : new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
    return (
      <div className="rbc-toolbar">
        <span className="rbc-btn-group">
          <button type="button" onClick={() => onNavigate('TODAY')}>Hoy</button>
          <button type="button" onClick={() => onNavigate('PREV')}>Anterior</button>
          <button type="button" onClick={() => onNavigate('NEXT')}>Siguiente</button>
        </span>
        <span className="rbc-toolbar-label capitalize">{label}</span>
        <span className="rbc-btn-group">
          <button type="button" className={view===Views.MONTH? 'rbc-active':''} onClick={() => onView(Views.MONTH)}>Mes</button>
          <button type="button" className={view===Views.WEEK? 'rbc-active':''} onClick={() => onView(Views.WEEK)}>Semana</button>
          <button type="button" className={view===Views.DAY? 'rbc-active':''} onClick={() => onView(Views.DAY)}>Día</button>
          <button type="button" className={view===Views.AGENDA? 'rbc-active':''} onClick={() => onView(Views.AGENDA)}>Agenda</button>
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Calendario de Carreras - Chileneros"
        description="Consulta fechas, comunas y canchas de próximas carreras. Filtra por comuna o cancha."
        url={typeof window !== 'undefined' ? window.location.href : undefined}
      />
      <Header />
      <HeroCarousel />
      
      <div className="container mx-auto p-6">
        {/* Header with back button */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-4 mb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Volver al inicio</span>
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Calendario de Carreras</h1>
            <p className="text-muted-foreground mt-2">
              Encuentra todas las carreras programadas. Haz clic en cualquier evento para ver detalles y ubicación.
            </p>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-sm border border-border p-4">
          <div className="mb-3">
            <Tabs defaultValue="full" className="w-full">
              <TabsList>
                <TabsTrigger value="full" onClick={() => { /* vista completa */ }}>Mes</TabsTrigger>
                <TabsTrigger value="weekend" onClick={() => { /* vista finde */ }}>Solo fin de semana</TabsTrigger>
                <TabsTrigger value="agenda" onClick={() => { /* vista agenda */ }}>Agenda</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Filtros */}
          <div className="mb-4 flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex items-center gap-2">
              <Button variant={filterType==='fecha' ? 'default' : 'outline'} size="sm" onClick={() => { setFilterType('fecha'); setSelectedComuna(''); setSelectedCanchaId(''); }}>
                Fecha
              </Button>
              <Button variant={filterType==='comuna' ? 'default' : 'outline'} size="sm" onClick={() => { setFilterType('comuna'); setSelectedCanchaId(''); }}>
                Comuna
              </Button>
              <Button variant={filterType==='cancha' ? 'default' : 'outline'} size="sm" onClick={() => { setFilterType('cancha'); setSelectedComuna(''); }}>
                Cancha
              </Button>
            </div>

            {filterType === 'comuna' && (
              <div className="md:ml-4 w-full md:w-64">
                <Select value={selectedComuna || '__all__'} onValueChange={(v) => setSelectedComuna(v === '__all__' ? '' : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las comunas" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    <SelectItem value="__all__">Todas las comunas</SelectItem>
                    {comunas.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {filterType === 'cancha' && (
              <div className="md:ml-4 w-full md:w-80">
                <Select value={selectedCanchaId || '__all__'} onValueChange={(v) => setSelectedCanchaId(v === '__all__' ? '' : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las canchas (futuras)" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    <SelectItem value="__all__">Todas las canchas (futuras)</SelectItem>
                    {canchasOptions.map(opt => (
                      <SelectItem key={opt.id} value={opt.id}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <Calendar
            localizer={localizer}
            culture="es"
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={calendarStyle}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventStyleGetter}
            messages={messages}
            components={{ toolbar: CustomToolbar }}
            views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
            defaultView={Views.MONTH}
            popup
            showMultiDayTimes={false}
            step={60}
            timeslots={1}
            showAllEvents
            doShowMoreDrillDown
            formats={formats as any}
            dayPropGetter={(date) => {
              const props: any = {};
              if (isWeekend(date)) {
                props.className = 'bg-blue-50';
              }
              if (isHoliday(date)) {
                props.className = (props.className ? props.className + ' ' : '') + 'bg-rose-50';
              }
              return props;
            }}
          />
        </div>
      </div>

      <RaceEventModal
        race={selectedEvent}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onDeleted={() => {
          // refrescar lista para remover del calendario tras borrar
          window.location.reload();
        }}
      />
      <Footer />
    </div>
  );
};