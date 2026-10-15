/*
# Add anon SELECT policy on app_settings

## Context
The app_settings table stores configurable values (session price, duration, conversion rate, etc.).
The public frontend needs to read these values to display prices and settings without requiring admin authentication.

## Security
- Add SELECT policy for anon + authenticated so the frontend can read settings
- INSERT/UPDATE/DELETE remain authenticated-only (already in place)
*/

DROP POLICY IF EXISTS "anon_select_app_settings" ON app_settings;
CREATE POLICY "anon_select_app_settings" ON app_settings FOR SELECT
  TO anon, authenticated USING (true);