import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface Cancha {
  id: string;
  nombre: string;
  comuna: string;
  descripcion?: string;
  latitud: number;
  longitud: number;
  tipo_superficie?: string;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCanchaData {
  nombre: string;
  comuna: string;
  descripcion?: string;
  latitud: number;
  longitud: number;
  tipo_superficie?: string;
}

export const useCanchas = () => {
  const [canchas, setCanchas] = useState<Cancha[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchCanchas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('canchas')
        .select('*')
        .order('nombre');

      if (error) throw error;
      setCanchas(data || []);
    } catch (error) {
      console.error('Error fetching canchas:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las canchas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createCancha = async (canchaData: CreateCanchaData): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "Debes estar autenticado para crear una cancha",
          variant: "destructive",
        });
        return false;
      }

      const { data, error } = await supabase
        .from('canchas')
        .insert([{
          ...canchaData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      setCanchas(prev => [data, ...prev]);
      toast({
        title: "Éxito",
        description: "Cancha creada correctamente",
      });
      return true;
    } catch (error) {
      console.error('Error creating cancha:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la cancha",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchCanchas();
  }, []);

  return {
    canchas,
    loading,
    createCancha,
    refetch: fetchCanchas
  };
};