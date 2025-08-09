import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Post, CreatePostData } from '@/types/post';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchPosts = async () => {
    try {
      console.log('Fetching posts from database...');
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Posts data:', data);
      console.log('Posts error:', error);
      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (postData: CreatePostData) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para crear un post",
        variant: "destructive",
      });
      return false;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          title: postData.title,
          content: postData.content,
          category: postData.category,
          race_id: postData.race_id,
        })
        .select('*')
        .single();

      if (error) throw error;

      // Add the new post to the local state
      setPosts(prev => [data, ...prev]);
      
      toast({
        title: "¡Éxito!",
        description: "Tu post ha sido publicado correctamente",
      });

      return true;
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "No se pudo publicar el post. Inténtalo de nuevo.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const createRacePost = async (raceId: string, raceTitle: string, raceDescription: string, raceLocation: string, raceDate: string) => {
    if (!user) return false;

    const postContent = `📍 **Ubicación:** ${raceLocation}
📅 **Fecha:** ${new Date(raceDate).toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}

${raceDescription}

¡Comparte tu opinión y únete a la conversación sobre esta carrera!`;

    return await createPost({
      title: `🏃‍♂️ ${raceTitle}`,
      content: postContent,
      category: 'Próximas carreras',
      race_id: raceId,
    });
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return {
    posts,
    loading,
    createPost,
    createRacePost,
    refetch: fetchPosts,
  };
};