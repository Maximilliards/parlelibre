/*
# ParleLibre — Initial schema

## Overview
Creates the core data model for the ParleLibre listening platform MVP:
- Free expression messages (anonymous submissions)
- Testimonials (moderated anonymous stories)
- Listening session slots and bookings
- Payments for bookings
- Audit log for sensitive admin actions

## Tables
1. `expressions` — anonymous free-expression submissions. A user deposits a personal situation with a category, title, message, and an authorization flag for anonymous publication. If authorized, the message becomes a candidate testimonial for moderation.
2. `testimonials` — moderated anonymous testimonials shown on the public site. Each has a status (draft, pending, published, rejected) and an optional link to the source expression.
3. `slots` — listening session availability windows (45-minute sessions). Each slot has a day-of-week, start time, end time, and is_active flag. Initial slots: Wednesday 15:30–18:30, Friday 15:30–18:30.
4. `bookings` — a reserved session: slot reference, date, client contact info, status, and a generated WhatsApp link. Status: pending, confirmed, cancelled, completed.
5. `payments` — payment record for a booking: amount, reference, status (pending, paid, failed, cancelled), and date.
6. `audit_log` — journal of sensitive admin actions (testimonial moderation, booking status changes, sensitive situation flagging).

## Security (RLS)
- `expressions`: anyone (anon) can INSERT (public submission form). Only authenticated admins can SELECT/UPDATE/DELETE.
- `testimonials`: anyone can SELECT published rows. Only authenticated admins can INSERT/UPDATE/DELETE and read non-published rows.
- `slots`: anyone can SELECT active slots. Only authenticated admins can INSERT/UPDATE/DELETE.
- `bookings`: anyone can INSERT (public booking form). Only authenticated admins can SELECT/UPDATE/DELETE.
- `payments`: only authenticated admins can SELECT/INSERT/UPDATE/DELETE.
- `audit_log`: only authenticated admins can SELECT/INSERT.

## Notes
- No `user_id` columns: the MVP has no end-user accounts. Admin access is via Supabase auth (authenticated role).
- All tables use gen_random_uuid() for primary keys.
- Timestamps default to now().
*/

-- Expressions (anonymous free-expression submissions)
CREATE TABLE IF NOT EXISTS expressions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL,
  message text NOT NULL,
  allow_publication boolean NOT NULL DEFAULT false,
  is_sensitive boolean NOT NULL DEFAULT false,
  sensitive_reason text,
  status text NOT NULL DEFAULT 'received',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE expressions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_expressions" ON expressions;
CREATE POLICY "anon_insert_expressions" ON expressions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_select_expressions" ON expressions;
CREATE POLICY "auth_select_expressions" ON expressions FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_update_expressions" ON expressions;
CREATE POLICY "auth_update_expressions" ON expressions FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_expressions" ON expressions;
CREATE POLICY "auth_delete_expressions" ON expressions FOR DELETE
  TO authenticated USING (true);

-- Testimonials (moderated anonymous stories)
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL,
  message text NOT NULL,
  author_label text NOT NULL DEFAULT 'Anonyme',
  status text NOT NULL DEFAULT 'pending',
  reaction_count integer NOT NULL DEFAULT 0,
  expression_id uuid REFERENCES expressions(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_published_testimonials" ON testimonials;
CREATE POLICY "anon_select_published_testimonials" ON testimonials FOR SELECT
  TO anon, authenticated USING (status = 'published');

DROP POLICY IF EXISTS "auth_insert_testimonials" ON testimonials;
CREATE POLICY "auth_insert_testimonials" ON testimonials FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_testimonials" ON testimonials;
CREATE POLICY "auth_update_testimonials" ON testimonials FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_testimonials" ON testimonials;
CREATE POLICY "auth_delete_testimonials" ON testimonials FOR DELETE
  TO authenticated USING (true);

-- Slots (listening session availability windows)
CREATE TABLE IF NOT EXISTS slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE slots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_active_slots" ON slots;
CREATE POLICY "anon_select_active_slots" ON slots FOR SELECT
  TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "auth_select_slots" ON slots;
CREATE POLICY "auth_select_slots" ON slots FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_slots" ON slots;
CREATE POLICY "auth_insert_slots" ON slots FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_slots" ON slots;
CREATE POLICY "auth_update_slots" ON slots FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_slots" ON slots;
CREATE POLICY "auth_delete_slots" ON slots FOR DELETE
  TO authenticated USING (true);

-- Bookings (reserved listening sessions)
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id uuid REFERENCES slots(id) ON DELETE SET NULL,
  session_date date NOT NULL,
  session_start time NOT NULL,
  session_end time NOT NULL,
  client_name text NOT NULL,
  client_email text NOT NULL,
  client_phone text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  whatsapp_link text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_bookings" ON bookings;
CREATE POLICY "anon_insert_bookings" ON bookings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_select_bookings" ON bookings;
CREATE POLICY "auth_select_bookings" ON bookings FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_update_bookings" ON bookings;
CREATE POLICY "auth_update_bookings" ON bookings FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_bookings" ON bookings;
CREATE POLICY "auth_delete_bookings" ON bookings FOR DELETE
  TO authenticated USING (true);

-- Payments (payment records for bookings)
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  currency text NOT NULL DEFAULT 'XOF',
  reference text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  method text,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_select_payments" ON payments;
CREATE POLICY "auth_select_payments" ON payments FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_payments" ON payments;
CREATE POLICY "auth_insert_payments" ON payments FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_payments" ON payments;
CREATE POLICY "auth_update_payments" ON payments FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_payments" ON payments;
CREATE POLICY "auth_delete_payments" ON payments FOR DELETE
  TO authenticated USING (true);

-- Audit log (journal of sensitive admin actions)
CREATE TABLE IF NOT EXISTS audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_email text,
  action text NOT NULL,
  target_type text,
  target_id uuid,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_select_audit_log" ON audit_log;
CREATE POLICY "auth_select_audit_log" ON audit_log FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_audit_log" ON audit_log;
CREATE POLICY "auth_insert_audit_log" ON audit_log FOR INSERT
  TO authenticated WITH CHECK (true);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_expressions_status ON expressions(status);
CREATE INDEX IF NOT EXISTS idx_expressions_created_at ON expressions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_testimonials_status ON testimonials(status);
CREATE INDEX IF NOT EXISTS idx_testimonials_created_at ON testimonials(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_slots_active ON slots(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_bookings_session_date ON bookings(session_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);
