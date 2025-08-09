-- Create post_votes table for user voting on posts
CREATE TABLE public.post_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL,
  user_id UUID NOT NULL,
  vote_type INTEGER NOT NULL CHECK (vote_type IN (-1, 1)), -- -1 for dislike, 1 for like
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id) -- One vote per user per post
);

-- Enable RLS
ALTER TABLE public.post_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Post votes are viewable by everyone" 
ON public.post_votes 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own votes" 
ON public.post_votes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes" 
ON public.post_votes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes" 
ON public.post_votes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Function to update post votes count
CREATE OR REPLACE FUNCTION public.update_post_votes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts 
    SET votes = (
      SELECT COALESCE(SUM(vote_type), 0) 
      FROM public.post_votes 
      WHERE post_id = NEW.post_id
    )
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.posts 
    SET votes = (
      SELECT COALESCE(SUM(vote_type), 0) 
      FROM public.post_votes 
      WHERE post_id = NEW.post_id
    )
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts 
    SET votes = (
      SELECT COALESCE(SUM(vote_type), 0) 
      FROM public.post_votes 
      WHERE post_id = OLD.post_id
    )
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_post_votes_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.post_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_post_votes_count();

-- Add trigger for updated_at
CREATE TRIGGER update_post_votes_updated_at
  BEFORE UPDATE ON public.post_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();