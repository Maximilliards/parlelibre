/*
# Add SELECT policy for admin on feedbacks table

1. Security
- Add a SELECT policy on `feedbacks` allowing authenticated users to read feedback entries.
- This enables the admin dashboard to list and read feedbacks submitted by visitors.
- INSERT remains open to anon + authenticated (already in place); UPDATE/DELETE remain admin-only via dashboard.
*/

DROP POLICY IF EXISTS "Permettre la lecture des feedbacks pour les admins" ON public.feedbacks;

CREATE POLICY "Permettre la lecture des feedbacks pour les admins"
  ON public.feedbacks
  FOR SELECT
  TO authenticated
  USING (true);