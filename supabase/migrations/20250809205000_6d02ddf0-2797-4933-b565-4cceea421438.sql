-- Create carousel_slides table for managing carousel content
CREATE TABLE public.carousel_slides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  button_text TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.carousel_slides ENABLE ROW LEVEL SECURITY;

-- Create policies for carousel slides (readable by everyone, manageable by admins)
CREATE POLICY "Carousel slides are viewable by everyone" 
ON public.carousel_slides 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Authenticated users can manage slides" 
ON public.carousel_slides 
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_carousel_slides_updated_at
BEFORE UPDATE ON public.carousel_slides
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert example data
INSERT INTO public.carousel_slides (title, description, image_url, button_text, link_url, order_index) VALUES
('Próximas Carreras 2024', 'Únete a las carreras más emocionantes del año. Encuentra tu próximo desafío aquí.', '/placeholder-slide-1.jpg', 'Ver Carreras', '/calendar', 1),
('Compra y Venta', 'Encuentra los mejores equipos de running. Compra y vende con la comunidad.', '/placeholder-slide-2.jpg', 'Explorar', '/buy-and-sell', 2),
('Comunidad Runner', 'Conecta con otros corredores, comparte experiencias y mejora tu rendimiento.', '/placeholder-slide-3.jpg', 'Únete al Foro', '/forum', 3),
('Encuentra Canchas', 'Descubre las mejores pistas y lugares para entrenar en tu ciudad.', '/placeholder-slide-4.jpg', 'Ver Canchas', '/forum', 4),
('Tips de Entrenamiento', 'Mejora tu técnica con consejos de expertos y entrenamientos especializados.', '/placeholder-slide-5.jpg', 'Leer Más', '/forum', 5);