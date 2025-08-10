import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Clock, MessageSquare, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { RaceMap } from './RaceMap';
import { Race } from '@/types/race';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useRaces } from '@/hooks/useRaces';
import { postAppEvent } from '@/lib/events';
import { useComments } from '@/hooks/useComments';
import { CommentForm } from '@/components/forum/CommentForm';
import { CommentCard } from '@/components/forum/CommentCard';
import { Seo } from '@/components/seo/Seo';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface RaceEventModalProps {
  race: Race | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleted?: (raceId: string) => void;
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

export const RaceEventModal = ({ race, isOpen, onClose, onDeleted }: RaceEventModalProps) => {
  const [cancha, setCancha] = useState<CanchaDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [racePostId, setRacePostId] = useState<string | null>(null);
  const [going, setGoing] = useState(false);
  const [goingCount, setGoingCount] = useState<number | null>(null);
  const [showComments, setShowComments] = useState(false);
  const { user } = useAuth();
  const isOwner = !!user && !!race && user.id === race.user_id;
  const { deleteRace } = useRaces();

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
      // buscar el post del foro asociado a la carrera
      (async () => {
        const { data } = await supabase
          .from('posts')
          .select('id')
          .eq('race_id', race.id)
          .maybeSingle();
        const postId = data?.id || null;
        setRacePostId(postId);
      })();
    }
  }, [race, isOpen]);

  // cargar conteo de asistentes y estado del usuario cuando conozcamos el postId
  useEffect(() => {
    if (!racePostId) return;
    (async () => {
      const { count } = await supabase
        .from('post_attendees')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', racePostId);
      setGoingCount(count ?? 0);
      if (user) {
        const { data } = await supabase
          .from('post_attendees')
          .select('id')
          .eq('post_id', racePostId)
          .eq('user_id', user.id)
          .maybeSingle();
        setGoing(!!data);
      }
    })();
  }, [racePostId, user?.id]);

  if (!race) return null;

  const eventDate = new Date(race.event_date);
  const formattedDate = eventDate.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleConfirmDelete = async () => {
    if (!race) return;
    setDeleting(true);
    const ok = await deleteRace(race.id);
    setDeleting(false);
    if (ok) {
      postAppEvent({ type: 'race-deleted', payload: { raceId: race.id } });
      onDeleted?.(race.id);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="sr-only">Detalles del evento</DialogTitle>
        </DialogHeader>
        <Seo
          title={`${race.title} - Próxima carrera`}
          description={race.description}
          url={typeof window !== 'undefined' ? window.location.href : undefined}
          jsonLd={{
            '@context': 'https://schema.org',
            '@type': 'SportsEvent',
            name: race.title,
            startDate: race.event_date,
            eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
            location: {
              '@type': 'Place',
              name: cancha?.nombre || race.location,
              address: race.comuna,
            },
            image: (race.image_urls || [])[0],
            description: race.description,
            organizer: {
              '@type': 'Organization',
              name: 'Chileneros'
            }
          }}
        />

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
              {goingCount !== null ? `${goingCount} asistirán` : 'Organizado por la comunidad'}
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => setShowComments((v) => !v)} disabled={!racePostId}>
                <MessageSquare className="h-4 w-4 mr-2" />
                {showComments ? 'Ocultar comentarios' : 'Ver comentarios'}
              </Button>
              {isOwner && (
                <Button variant="destructive" size="sm" onClick={() => setOpenDelete(true)} disabled={deleting}>
                  {deleting ? 'Eliminando...' : 'Eliminar carrera'}
                </Button>
              )}
              <Button
                size="sm"
                className="bg-gradient-button"
                disabled={!racePostId}
                onClick={async () => {
                  if (!user || !race) return;
                  if (!going && racePostId) {
                    const { error } = await supabase
                      .from('post_attendees')
                      .insert({ post_id: racePostId, user_id: user.id });
                    if (!error) {
                      setGoing(true);
                      setGoingCount((c) => (c ?? 0) + 1);
                    }
                  } else {
                    const { error } = await supabase
                      .from('post_attendees')
                      .delete()
                      .eq('post_id', racePostId as string)
                      .eq('user_id', user.id);
                    if (!error) {
                      setGoing(false);
                      setGoingCount((c) => Math.max(0, (c ?? 0) - 1));
                    }
                  }
                }}
              >
                {going ? <><CheckCircle2 className="h-4 w-4 mr-2" /> Asisto</> : 'Participar'}
              </Button>
            </div>
          </div>

          {showComments && racePostId && (
            <CommentsBlock postId={racePostId} />
          )}
        </div>
        <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar carrera?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción eliminará la carrera del calendario y el post asociado en el foro. No se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">
                Confirmar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
};

// Bloque reutilizable de comentarios del foro para un post específico
const CommentsBlock: React.FC<{ postId: string }> = ({ postId }) => {
  const { comments, createComment, deleteComment, updateComment, loading } = useComments(postId);
  return (
    <div className="pt-4 border-t border-border">
      <h3 className="text-lg font-semibold mb-3">Comentarios</h3>
      <CommentForm onSubmit={createComment} onCreatePoll={async () => false} loading={loading} />
      <div className="mt-3 space-y-2 max-h-[36vh] overflow-y-auto pr-1">
        {comments.length === 0 ? (
          <div className="text-sm text-muted-foreground">Sé el primero en comentar.</div>
        ) : (
          comments.map((c) => (
            <CommentCard key={c.id} comment={c} onDelete={deleteComment} onUpdate={updateComment} />
          ))
        )}
      </div>
    </div>
  );
};