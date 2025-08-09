import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Comment } from '@/types/post';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const useComments = (postId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los comentarios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadFiles = async (files: File[]): Promise<string[]> => {
    if (!user) return [];

    const uploadPromises = files.map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('comment-attachments')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('comment-attachments')
        .getPublicUrl(fileName);

      return publicUrl;
    });

    return Promise.all(uploadPromises);
  };

  const createComment = async (content: string, imageFiles?: File[], videoFiles?: File[]) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para comentar",
        variant: "destructive",
      });
      return false;
    }

    try {
      let imageUrls: string[] = [];
      let videoUrls: string[] = [];

      // Upload files if provided
      if (imageFiles && imageFiles.length > 0) {
        imageUrls = await uploadFiles(imageFiles);
      }
      if (videoFiles && videoFiles.length > 0) {
        videoUrls = await uploadFiles(videoFiles);
      }

      const { data, error } = await supabase
        .from('comments')
        .insert({
          user_id: user.id,
          post_id: postId,
          content: content.trim(),
          image_urls: imageUrls,
          video_urls: videoUrls,
        })
        .select()
        .single();

      if (error) throw error;

      // Add the new comment to the local state
      setComments(prev => [data, ...prev]);
      
      toast({
        title: "¡Comentario publicado!",
        description: "Tu comentario ha sido agregado correctamente",
      });

      return true;
    } catch (error) {
      console.error('Error creating comment:', error);
      toast({
        title: "Error",
        description: "No se pudo publicar el comentario",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId]);

  return {
    comments,
    loading,
    createComment,
    refetch: fetchComments,
  };
};