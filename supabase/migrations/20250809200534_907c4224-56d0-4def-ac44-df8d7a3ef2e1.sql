-- Add multimedia support to posts table
ALTER TABLE public.posts 
ADD COLUMN image_urls TEXT[] DEFAULT '{}',
ADD COLUMN video_urls TEXT[] DEFAULT '{}';