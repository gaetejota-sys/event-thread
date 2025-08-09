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
    console.log('createComment called with:', { content, user, postId });
    
    if (!user) {
      console.log('No user found, showing toast');
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

      console.log('Uploading files...');
      // Upload files if provided
      if (imageFiles && imageFiles.length > 0) {
        imageUrls = await uploadFiles(imageFiles);
      }
      if (videoFiles && videoFiles.length > 0) {
        videoUrls = await uploadFiles(videoFiles);
      }

      console.log('Inserting comment to database...', {
        user_id: user.id,
        post_id: postId,
        content: content.trim(),
        image_urls: imageUrls,
        video_urls: videoUrls,
      });

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

      console.log('Insert result:', { data, error });

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }

      // Add the new comment to the local state
      setComments(prev => [data, ...prev]);
      
      toast({
        title: "¡Comentario publicado!",
        description: "Tu comentario ha sido agregado correctamente",
      });

      console.log('Comment created successfully');
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

  const deleteComment = async (commentId: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para eliminar comentarios",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Remove from local state
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      
      toast({
        title: "Comentario eliminado",
        description: "El comentario ha sido eliminado correctamente",
      });

      return true;
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el comentario",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateComment = async (commentId: string, content: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para editar comentarios",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('comments')
        .update({ 
          content: content.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setComments(prev => prev.map(comment => 
        comment.id === commentId ? { ...comment, content: data.content, updated_at: data.updated_at } : comment
      ));
      
      toast({
        title: "Comentario actualizado",
        description: "El comentario ha sido editado correctamente",
      });

      return true;
    } catch (error) {
      console.error('Error updating comment:', error);
      toast({
        title: "Error",
        description: "No se pudo editar el comentario",
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
    deleteComment,
    updateComment,
    refetch: fetchComments,
  };
};