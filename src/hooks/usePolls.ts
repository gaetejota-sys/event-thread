import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Poll, PollOption, CreatePollData } from '@/types/poll';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const usePolls = (postId: string) => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchPolls = async () => {
    try {
      const { data: pollsData, error } = await supabase
        .from('polls')
        .select(`
          *,
          poll_options (*)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const pollsWithOptions = pollsData?.map(poll => ({
        ...poll,
        options: poll.poll_options || []
      })) || [];
      
      setPolls(pollsWithOptions);
    } catch (error) {
      console.error('Error fetching polls:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las encuestas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createPoll = async (pollData: CreatePollData) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para crear encuestas",
        variant: "destructive",
      });
      return false;
    }

    try {
      // Create the poll
      const { data: poll, error: pollError } = await supabase
        .from('polls')
        .insert({
          post_id: postId,
          user_id: user.id,
          question: pollData.question,
          expires_at: pollData.expires_at,
        })
        .select()
        .single();

      if (pollError) throw pollError;

      // Create the poll options
      const optionsToInsert = pollData.options.map(option => ({
        poll_id: poll.id,
        option_text: option,
      }));

      const { data: options, error: optionsError } = await supabase
        .from('poll_options')
        .insert(optionsToInsert)
        .select();

      if (optionsError) throw optionsError;

      // Add to local state
      const newPoll = {
        ...poll,
        options: options || []
      };
      
      setPolls(prev => [newPoll, ...prev]);
      
      toast({
        title: "¡Encuesta creada!",
        description: "Tu encuesta ha sido publicada correctamente",
      });

      return true;
    } catch (error) {
      console.error('Error creating poll:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la encuesta",
        variant: "destructive",
      });
      return false;
    }
  };

  const vote = async (pollId: string, optionId: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para votar",
        variant: "destructive",
      });
      return false;
    }

    try {
      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('poll_votes')
        .select('*')
        .eq('poll_id', pollId)
        .eq('user_id', user.id)
        .single();

      if (existingVote) {
        // Update existing vote
        const { error } = await supabase
          .from('poll_votes')
          .update({ option_id: optionId })
          .eq('id', existingVote.id);

        if (error) throw error;
      } else {
        // Create new vote
        const { error } = await supabase
          .from('poll_votes')
          .insert({
            poll_id: pollId,
            option_id: optionId,
            user_id: user.id,
          });

        if (error) throw error;
      }

      // Refresh polls to get updated counts
      await fetchPolls();
      
      toast({
        title: "¡Voto registrado!",
        description: "Tu voto ha sido contabilizado",
      });

      return true;
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: "Error",
        description: "No se pudo registrar el voto",
        variant: "destructive",
      });
      return false;
    }
  };

  const addOption = async (pollId: string, optionText: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para agregar opciones",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('poll_options')
        .insert({
          poll_id: pollId,
          option_text: optionText,
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setPolls(prev => prev.map(poll => 
        poll.id === pollId 
          ? { ...poll, options: [...poll.options, data] }
          : poll
      ));

      toast({
        title: "¡Opción agregada!",
        description: "La nueva opción ha sido añadida a la encuesta",
      });

      return true;
    } catch (error) {
      console.error('Error adding option:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar la opción",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    if (postId) {
      fetchPolls();
    }
  }, [postId]);

  return {
    polls,
    loading,
    createPoll,
    vote,
    addOption,
    refetch: fetchPolls,
  };
};