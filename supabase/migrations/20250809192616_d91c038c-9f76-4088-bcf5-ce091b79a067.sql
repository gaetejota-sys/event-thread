-- Create tabla canchas with latitude and longitude for map display
CREATE TABLE public.canchas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  comuna TEXT NOT NULL,
  descripcion TEXT,
  latitud DECIMAL(10, 8) NOT NULL,
  longitud DECIMAL(11, 8) NOT NULL,
  tipo_superficie TEXT,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.canchas ENABLE ROW LEVEL SECURITY;

-- Create policies for canchas
CREATE POLICY "Canchas are viewable by everyone" 
ON public.canchas 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create canchas" 
ON public.canchas 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own canchas" 
ON public.canchas 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own canchas" 
ON public.canchas 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for timestamps
CREATE TRIGGER update_canchas_updated_at
BEFORE UPDATE ON public.canchas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert example canchas from different regions of Chile
INSERT INTO public.canchas (nombre, comuna, descripcion, latitud, longitud, tipo_superficie) VALUES
('Cancha Municipal de Providencia', 'Providencia', 'Cancha de pasto sintético en el centro de Providencia', -33.4372, -70.6506, 'Pasto Sintético'),
('Estadio Municipal de Ñuñoa', 'Ñuñoa', 'Cancha de pasto natural con graderías', -33.4569, -70.5974, 'Pasto Natural'),
('Cancha Las Condes Norte', 'Las Condes', 'Cancha de tierra en sector cordillera', -33.3936, -70.5642, 'Tierra'),
('Campo Deportivo Maipú', 'Maipú', 'Amplio campo para carreras de resistencia', -33.5110, -70.7682, 'Pasto Natural'),
('Cancha Rural Melipilla', 'Melipilla', 'Cancha en zona rural de Melipilla', -33.6844, -71.2159, 'Tierra'),
('Estadio de Valparaíso', 'Valparaíso', 'Cancha con vista al puerto', -33.0458, -71.6197, 'Pasto Sintético'),
('Cancha Viña del Mar Centro', 'Viña del Mar', 'Cancha cercana a la playa', -33.0153, -71.5500, 'Pasto Natural'),
('Campo La Serena', 'La Serena', 'Cancha en zona norte de Chile', -29.9027, -71.2519, 'Tierra'),
('Estadio Temuco Sur', 'Temuco', 'Cancha en la región de La Araucanía', -38.7369, -72.5904, 'Pasto Natural'),
('Cancha Puerto Montt', 'Puerto Montt', 'Campo deportivo en la región de Los Lagos', -41.4693, -72.9424, 'Pasto Sintético');

-- Update races table to include cancha_id and comuna
ALTER TABLE public.races 
ADD COLUMN cancha_id UUID REFERENCES public.canchas(id),
ADD COLUMN comuna TEXT;