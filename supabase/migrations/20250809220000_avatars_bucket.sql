-- Create dedicated avatars bucket (public read)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for avatars bucket
-- Anyone can view avatars
CREATE POLICY "Anyone can view avatars"
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

-- Users can upload to their own folder (userId/*)
CREATE POLICY "Users can upload their avatars"
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own avatars
CREATE POLICY "Users can update their avatars"
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own avatars
CREATE POLICY "Users can delete their avatars"
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);


