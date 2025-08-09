export interface Poll {
  id: string;
  post_id: string;
  question: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  user_id: string;
  options: PollOption[];
}

export interface PollOption {
  id: string;
  poll_id: string;
  option_text: string;
  votes_count: number;
  created_at: string;
}

export interface PollVote {
  id: string;
  poll_id: string;
  option_id: string;
  user_id: string;
  created_at: string;
}

export interface CreatePollData {
  question: string;
  options: string[];
  expires_at?: string;
}