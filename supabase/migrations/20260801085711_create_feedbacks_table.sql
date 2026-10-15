/*
# Create feedbacks table

1. New Tables
- `feedbacks`
  - `id` (uuid, primary key, auto-generated)
  - `user_id` (uuid, nullable, references auth.users, set null on user deletion)
  - `user_email` (text, nullable — allows identifying feedback from anonymous users)
  - `type` (text, one of: 'bug', 'feature', 'general', default 'general')
  - `rating` (integer, 1–5, nullable)
  - `message` (text, not null — the feedback content)
  - `created_at` (timestamptz, default now)

2. Security
- Enable RLS on `feedbacks`.
- INSERT policy allowing anyone (anon + authenticated) to submit feedback, since the app has no sign-in requirement for submitting feedback.
- No SELECT/UPDATE/DELETE policies: only the database admin can read/manage feedbacks (via the Supabase dashboard), which is intentional for a feedback collection table.
*/

CREATE TABLE IF NOT EXISTS public.feedbacks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email text,
  type text CHECK (type IN ('bug', 'feature', 'general')) DEFAULT 'general',
  rating integer CHECK (rating >= 1 AND rating <= 5),
  message text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permettre l'insertion de feedbacks pour tous" ON public.feedbacks;

CREATE POLICY "Permettre l'insertion de feedbacks pour tous"
  ON public.feedbacks
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);