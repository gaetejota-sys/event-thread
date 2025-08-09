export interface Race {
  id: string;
  user_id: string;
  title: string;
  description: string;
  location: string;
  event_date: string;
  image_urls: string[];
  created_at: string;
  updated_at: string;
  profiles?: {
    display_name: string | null;
  } | null;
}

export interface CreateRaceData {
  title: string;
  description: string;
  location: string;
  date: Date | null;
  images: File[];
}