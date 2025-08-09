import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Clock, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { RaceMap } from './RaceMap';
import { Race } from '@/types/race';
import { supabase } from '@/integrations/supabase/client';

interface RaceEventModalProps {
  race: Race | null;
  isOpen: boolean;
  onClose: () => void;
}

interface CanchaDetails {
  id: string;
  nombre: string;
  descripcion: string | null;
  latitud: number;
  longitud: number;
  comuna: string;
  tipo_superficie: string | null;
}

export const RaceEventModal = ({ race, isOpen, onClose }: RaceEventModalProps) => {
  const [cancha, setCancha] = useState<CanchaDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCanchaDetails = async () => {
      if (!race?.cancha_id) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('canchas')
          .select('*')
          .eq('id', race.cancha_id)
          .single();

        if (error) throw error;
        setCancha(data);
      } catch (error) {
        console.error('Error fetching cancha details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && race) {
      fetchCanchaDetails();
    }
  }, [race, isOpen]);

  if (!race) return null;

  const eventDate = new Date(race.event_date);
  const formattedDate = eventDate.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="sr-only">Detalles del evento</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Event Header */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-foreground">{race.title}</h1>
                <div className="flex items-center space-x-4 mt-2 text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span className="capitalize">{formattedDate}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    hace {formatDistanceToNow(new Date(race.created_at), { locale: es })}
                  </div>
                </div>
              </div>
              <Badge variant="secondary" className="bg-gradient-button text-white">
                Próxima carrera
              </Badge>
            </div>

            {/* Description */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Descripción</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{race.description}</p>
            </div>
          </div>

          {/* Location Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Ubicación
              </h3>
              
              <div className="space-y-3">
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Ubicación:</span>
                      <p className="font-medium">{race.location}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Comuna:</span>
                      <p className="font-medium">{race.comuna || 'No especificada'}</p>
                    </div>
                    {cancha && (
                      <>
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Cancha:</span>
                          <p className="font-medium">{cancha.nombre}</p>
                        </div>
                        {cancha.tipo_superficie && (
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">Superficie:</span>
                            <p className="font-medium">{cancha.tipo_superficie}</p>
                          </div>
                        )}
                        {cancha.descripcion && (
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">Descripción de la cancha:</span>
                            <p className="text-sm text-muted-foreground">{cancha.descripcion}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Race Images */}
                {race.image_urls && race.image_urls.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Imágenes</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {race.image_urls.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`Imagen ${index + 1} de ${race.title}`}
                          className="w-full h-32 object-cover rounded-lg border border-border"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Map */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Mapa</h3>
              {loading ? (
                <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Cargando mapa...</p>
                </div>
              ) : cancha ? (
                <RaceMap
                  latitude={Number(cancha.latitud)}
                  longitude={Number(cancha.longitud)}
                  title={race.title}
                  location={race.location}
                  className="h-64"
                />
              ) : (
                <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">
                    No hay información de ubicación disponible
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t border-border">
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="h-4 w-4 mr-1" />
              Organizado por la comunidad
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Ver comentarios
              </Button>
              <Button size="sm" className="bg-gradient-button">
                Participar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};