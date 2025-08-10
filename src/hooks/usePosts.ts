import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Post, CreatePostData } from '@/types/post';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
// Contabo removido: todas las subidas van por Supabase Storage

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

      // Enriquecer posts con perfiles (display_name, avatar_url)
      const userIds = [...new Set((data || []).map(post => post.user_id))];
      let profiles: { id: string; display_name: string | null; avatar_url: string | null }[] | null = [];
      if (userIds.length > 0) {
        const { data: profData } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url')
          .in('id', userIds);
        profiles = profData as any;
      }

      const sanitizeUrls = (arr: any): string[] => {
        if (!Array.isArray(arr)) return [];
        return arr.filter((u) => typeof u === 'string' && u.trim().length > 0);
      };

      const postsWithProfiles = (data || []).map(post => ({
        ...post,
        image_urls: sanitizeUrls((post as any).image_urls),
        video_urls: sanitizeUrls((post as any).video_urls),
        profiles: (profiles || [])?.find(p => p.id === post.user_id) || null,
      }));

      setPosts(postsWithProfiles);
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

      // Fetch user profile and attach to the post
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .eq('id', user.id)
        .single();

      const postWithProfile = { ...data, profiles: profile || null };

      // Add the new post to the local state
      setPosts(prev => [postWithProfile, ...prev]);
      
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

  const createGeneralPost = async (postData: CreatePostData) => {
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
          image_urls: postData.image_urls || [],
          video_urls: postData.video_urls || [],
        })
        .select('*')
        .single();

      if (error) throw error;

      // Fetch user profile and attach to the post
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .eq('id', user.id)
        .single();

      const postWithProfile = { ...data, profiles: profile || null };

      // Add the new post to the local state
      setPosts(prev => [postWithProfile, ...prev]);
      
      toast({
        title: "¡Éxito!",
        description: "Tu tema ha sido publicado correctamente",
      });

      return true;
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "No se pudo publicar el tema. Inténtalo de nuevo.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const createRacePost = async (raceId: string, raceTitle: string, raceDescription: string, raceLocation: string, raceDate: string, imageUrls: string[] = [], videoUrl?: string | null) => {
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

    // Importante: usar createGeneralPost para que respete image_urls/video_urls
    return await createGeneralPost({
      title: `🏃‍♂️ ${raceTitle}`,
      content: postContent,
      category: 'Próximas carreras',
      race_id: raceId,
      image_urls: imageUrls,
      video_urls: videoUrl ? [videoUrl] : [],
    });
  };

  // Sincroniza imágenes de carreras hacia posts de "Próximas carreras" que no las tengan
  const syncRacePostImages = async () => {
    try {
      // Traer posts de próximas carreras con race_id
      const { data: racePosts, error: postsErr } = await supabase
        .from('posts')
        .select('id, race_id, image_urls, category')
        .eq('category', 'Próximas carreras')
        .not('race_id', 'is', null);

      if (postsErr) throw postsErr;

      const needing = (racePosts || []).filter(p => !p.image_urls || (p.image_urls as string[]).length === 0);
      if (needing.length === 0) return { updated: 0 };

      const raceIds = [...new Set(needing.map(p => p.race_id as string))];
      const { data: races, error: racesErr } = await supabase
        .from('races')
        .select('id, image_urls')
        .in('id', raceIds);
      if (racesErr) throw racesErr;

      let updated = 0;
      for (const post of needing) {
        const race = races?.find(r => r.id === post.race_id);
        const imgs = ((race?.image_urls || []) as string[]).filter(
          (u) => typeof u === 'string' && u.trim().length > 0
        );
        if (imgs.length > 0) {
          const { error: upErr, data: updatedPost } = await supabase
            .from('posts')
            .update({ image_urls: imgs })
            .eq('id', post.id)
            .select('*')
            .single();
          if (!upErr && updatedPost) {
            updated += 1;
            // Actualizar estado local
            setPosts(prev => prev.map(p => p.id === post.id ? { ...p, image_urls: imgs } as any : p));
          }
        }
      }
      return { updated };
    } catch (err) {
      console.error('Error syncing race post images:', err);
      return { updated: 0 };
    }
  };

  const deletePost = async (postId: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para eliminar un post",
        variant: "destructive",
      });
      return false;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id); // Solo el propietario puede eliminar

      if (error) throw error;

      // Remove from local state
      setPosts(prev => prev.filter(post => post.id !== postId));
      
      toast({
        title: "¡Éxito!",
        description: "El aviso ha sido eliminado correctamente",
      });

      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el aviso. Inténtalo de nuevo.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updatePost = async (postId: string, postData: CreatePostData) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para editar un post",
        variant: "destructive",
      });
      return false;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('posts')
        .update({
          title: postData.title,
          content: postData.content,
          category: postData.category,
          image_urls: postData.image_urls || [],
          video_urls: postData.video_urls || [],
          updated_at: new Date().toISOString(),
        })
        .eq('id', postId)
        .eq('user_id', user.id) // Solo el propietario puede editar
        .select('*')
        .single();

      if (error) throw error;

      // Update local state, preservando profiles existente
      setPosts(prev => prev.map(post => 
        post.id === postId ? { ...post, ...data } : post
      ));
      
      toast({
        title: "¡Éxito!",
        description: "El aviso ha sido actualizado correctamente",
      });

      return true;
    } catch (error) {
      console.error('Error updating post:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el aviso. Inténtalo de nuevo.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return {
    posts,
    loading,
    createPost: createGeneralPost,
    createRacePost,
    deletePost,
    updatePost,
    refetch: fetchPosts,
    syncRacePostImages,
  };
};