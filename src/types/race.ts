export interface Race {
  id: string;
  user_id: string;
  title: string;
  description: string;
  location: string;
  comuna: string;
  cancha_id?: string;
  event_date: string;
  image_urls: string[];
  created_at: string;
  updated_at: string;
  profiles?: {
    display_name: string | null;
  } | null;
  canchas?: {
    nombre: string;
    latitud: number;
    longitud: number;
  } | null;
}

export interface CreateRaceData {
  title: string;
  description: string;
  comuna: string;
  cancha_id: string;
  date: Date | null;
  images: File[];
  video?: File | null;
}