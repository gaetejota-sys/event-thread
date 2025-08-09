export interface Post {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  race_id?: string;
  created_at: string;
  updated_at: string;
  votes: number;
  comments_count: number;
  profiles?: {
    display_name: string | null;
  } | null;
}

export interface Comment {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePostData {
  title: string;
  content: string;
  category: string;
  race_id?: string;
}