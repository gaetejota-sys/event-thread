import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from './use-toast';

export interface PostVote {
  id: string;
  post_id: string;
  user_id: string;
  vote_type: number; // -1 for dislike, 1 for like
}

export const usePostVotes = (postId: string) => {
  const [userVote, setUserVote] = useState<PostVote | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchUserVote = async () => {
    if (!user || !postId) return;

    try {
      const { data, error } = await supabase
        .from('post_votes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setUserVote(data);
    } catch (error) {
      console.error('Error fetching user vote:', error);
    }
  };

  const vote = async (voteType: number) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para votar",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (userVote) {
        if (userVote.vote_type === voteType) {
          // Remove vote if clicking same vote
          const { error } = await supabase
            .from('post_votes')
            .delete()
            .eq('id', userVote.id);

          if (error) throw error;
          setUserVote(null);
        } else {
          // Update vote type
          const { data, error } = await supabase
            .from('post_votes')
            .update({ vote_type: voteType })
            .eq('id', userVote.id)
            .select()
            .single();

          if (error) throw error;
          setUserVote(data);
        }
      } else {
        // Create new vote
        const { data, error } = await supabase
          .from('post_votes')
          .insert({
            post_id: postId,
            user_id: user.id,
            vote_type: voteType,
          })
          .select()
          .single();

        if (error) throw error;
        setUserVote(data);
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: "Error",
        description: "Error al votar. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserVote();
  }, [postId, user]);

  return {
    userVote,
    loading,
    vote,
    refetch: fetchUserVote,
  };
};