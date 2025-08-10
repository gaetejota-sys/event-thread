-- Direct messages between users
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- Policies
-- A user can view messages where he/she is sender or receiver
CREATE POLICY "Users can view their messages"
ON public.direct_messages
FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- A user can insert messages only as sender
CREATE POLICY "Users can send messages as themselves"
ON public.direct_messages
FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- A user can mark as read only messages received by themselves
CREATE POLICY "Users can mark their received messages as read"
ON public.direct_messages
FOR UPDATE
USING (auth.uid() = receiver_id)
WITH CHECK (auth.uid() = receiver_id);


