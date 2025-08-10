import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Race, CreateRaceData } from '@/types/race';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

// Buckets en Supabase Storage
const RACE_IMAGES_BUCKET = 'race-images';
const MEDIA_BUCKET = 'comment-attachments';

async function uploadToBucket(file: File, bucket: string, userId: string): Promise<string> {
  const extension = file.name.split('.').pop();
  const objectKey = `${userId}/${Date.now()}.${extension}`;
  const { error } = await supabase.storage.from(bucket).upload(objectKey, file);
  if (error) throw error;
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(objectKey);
  return publicUrl;
}

export const useRaces = (
  onRaceCreated?: (
    raceId: string,
    title: string,
    description: string,
    comuna: string,
    date: string,
    imageUrls: string[],
    videoUrl?: string | null
  ) => Promise<boolean>
) => {
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchRaces = async () => {
    try {
      const { data, error } = await supabase
        .from('races')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRaces(data || []);
    } catch (error) {
      console.error('Error fetching races:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las carreras",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadImages = async (images: File[]): Promise<string[]> => {
    if (!user || images.length === 0) return [];
    return Promise.all(images.map((img) => uploadToBucket(img, RACE_IMAGES_BUCKET, user.id)));
  };

  const uploadVideo = async (video: File | null): Promise<string | null> => {
    if (!user || !video) return null;
    return uploadToBucket(video, MEDIA_BUCKET, user.id);
  };

  const createRace = async (raceData: CreateRaceData) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para crear una carrera",
        variant: "destructive",
      });
      return false;
    }

    if (!raceData.date) {
      toast({
        title: "Error",
        description: "Debes seleccionar una fecha para la carrera",
        variant: "destructive",
      });
      return false;
    }

    try {
      setLoading(true);
      
      // Upload images first
      const imageUrls = await uploadImages(raceData.images);
      // Upload video (opcional)
      const videoUrl = await uploadVideo(raceData.video || null);
      console.log('Race upload results (Supabase):', { imageUrls, videoUrl });

      // Create race record (no guardamos video_url en la tabla para compatibilidad)
      const { data, error } = await supabase
        .from('races')
        .insert({
          user_id: user.id,
          title: raceData.title,
          description: raceData.description,
          location: raceData.comuna, // Mantener location por compatibilidad
          comuna: raceData.comuna,
          cancha_id: raceData.cancha_id || null,
          event_date: raceData.date.toISOString().split('T')[0],
          image_urls: imageUrls,
        })
        .select(`
          *,
          canchas(nombre, latitud, longitud)
        `)
        .single();

      if (error) throw error;

      // Add the new race to the local state
      setRaces(prev => [data, ...prev]);
      
      // Create forum post for the race if callback provided
      if (onRaceCreated) {
        console.log('Calling onRaceCreated with media URLs', { imageUrls, videoUrl });
        await onRaceCreated(
          data.id,
          data.title,
          data.description,
          data.comuna,
          data.event_date,
          imageUrls,
          videoUrl
        );
      }
      
      toast({
        title: "¡Éxito!",
        description: "Tu carrera ha sido publicada correctamente",
      });

      return true;
    } catch (error) {
      console.error('Error creating race:', error);
      toast({
        title: "Error",
        description: "No se pudo publicar la carrera. Inténtalo de nuevo.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteRace = async (raceId: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para eliminar una carrera",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('races')
        .delete()
        .eq('id', raceId)
        .eq('user_id', user.id);

      if (error) throw error;

      setRaces(prev => prev.filter(r => r.id !== raceId));

      // posts con race_id referencian races con ON DELETE CASCADE, así que se eliminan automáticamente
      toast({ title: "Carrera eliminada", description: "La carrera y su post asociado han sido eliminados." });
      return true;
    } catch (err) {
      console.error('Error deleting race:', err);
      toast({ title: "Error", description: "No se pudo eliminar la carrera", variant: "destructive" });
      return false;
    }
  };

  useEffect(() => {
    fetchRaces();
  }, []);

  return {
    races,
    loading,
    createRace,
    deleteRace,
    refetch: fetchRaces,
  };
};