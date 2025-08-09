import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Race, CreateRaceData } from '@/types/race';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const useRaces = (onRaceCreated?: (raceId: string, title: string, description: string, location: string, date: string) => Promise<boolean>) => {
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

    const uploadPromises = images.map(async (file, index) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${index}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from('race-images')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('race-images')
        .getPublicUrl(fileName);

      return publicUrl;
    });

    return Promise.all(uploadPromises);
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

      // Create race record
      const { data, error } = await supabase
        .from('races')
        .insert({
          user_id: user.id,
          title: raceData.title,
          description: raceData.description,
          location: raceData.location,
          event_date: raceData.date.toISOString().split('T')[0],
          image_urls: imageUrls,
        })
        .select('*')
        .single();

      if (error) throw error;

      // Add the new race to the local state
      setRaces(prev => [data, ...prev]);
      
      // Create forum post for the race if callback provided
      if (onRaceCreated) {
        await onRaceCreated(data.id, data.title, data.description, data.location, data.event_date);
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

  useEffect(() => {
    fetchRaces();
  }, []);

  return {
    races,
    loading,
    createRace,
    refetch: fetchRaces,
  };
};