-- Add file attachments support to comments
ALTER TABLE public.comments 
ADD COLUMN image_urls TEXT[] DEFAULT '{}',
ADD COLUMN video_urls TEXT[] DEFAULT '{}';

-- Create polls table
CREATE TABLE public.polls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  user_id UUID NOT NULL
);

-- Create poll options table
CREATE TABLE public.poll_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
  option_text TEXT NOT NULL,
  votes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create poll votes table
CREATE TABLE public.poll_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
  option_id UUID REFERENCES public.poll_options(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(poll_id, user_id)
);

-- Enable RLS on new tables
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for polls
CREATE POLICY "Polls are viewable by everyone" 
ON public.polls 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create polls" 
ON public.polls 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own polls" 
ON public.polls 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own polls" 
ON public.polls 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for poll options
CREATE POLICY "Poll options are viewable by everyone" 
ON public.poll_options 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create options for any poll" 
ON public.poll_options 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update poll options" 
ON public.poll_options 
FOR UPDATE 
USING (true);

CREATE POLICY "Users can delete poll options" 
ON public.poll_options 
FOR DELETE 
USING (true);

-- RLS Policies for poll votes
CREATE POLICY "Poll votes are viewable by everyone" 
ON public.poll_votes 
FOR SELECT 
USING (true);

CREATE POLICY "Users can vote on polls" 
ON public.poll_votes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes" 
ON public.poll_votes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes" 
ON public.poll_votes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create storage bucket for comment attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('comment-attachments', 'comment-attachments', true);

-- Storage policies for comment attachments
CREATE POLICY "Anyone can view comment attachments" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'comment-attachments');

CREATE POLICY "Users can upload comment attachments" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'comment-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own comment attachments" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'comment-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own comment attachments" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'comment-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add triggers for updated_at
CREATE TRIGGER update_polls_updated_at
BEFORE UPDATE ON public.polls
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update poll option votes count
CREATE OR REPLACE FUNCTION public.update_poll_votes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.poll_options 
    SET votes_count = votes_count + 1 
    WHERE id = NEW.option_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.poll_options 
    SET votes_count = votes_count - 1 
    WHERE id = OLD.option_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update votes count
CREATE TRIGGER update_poll_option_votes_count
AFTER INSERT OR DELETE ON public.poll_votes
FOR EACH ROW
EXECUTE FUNCTION public.update_poll_votes_count();