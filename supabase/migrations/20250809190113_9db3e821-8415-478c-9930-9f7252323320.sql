-- Create races table
CREATE TABLE public.races (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  event_date DATE NOT NULL,
  image_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.races ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Races are viewable by everyone" 
ON public.races 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own races" 
ON public.races 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own races" 
ON public.races 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own races" 
ON public.races 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_races_updated_at
BEFORE UPDATE ON public.races
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for race images
INSERT INTO storage.buckets (id, name, public) VALUES ('race-images', 'race-images', true);

-- Create policies for race image uploads
CREATE POLICY "Race images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'race-images');

CREATE POLICY "Users can upload race images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'race-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own race images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'race-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own race images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'race-images' AND auth.uid()::text = (storage.foldername(name))[1]);