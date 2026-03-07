-- ============================================================
-- SABINAS Admin Panel — DB Migration
-- Run this in Supabase SQL Editor before launching the admin panel
-- ============================================================

-- 1. CRM leads table
CREATE TABLE IF NOT EXISTS public.colaboradores_leads (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre     TEXT NOT NULL,
  email      TEXT NOT NULL,
  mensaje    TEXT,
  status     TEXT NOT NULL DEFAULT 'nuevo',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Click counter on sponsors
ALTER TABLE public.sponsors ADD COLUMN IF NOT EXISTS clicks INT NOT NULL DEFAULT 0;

-- 3. RLS on new table
ALTER TABLE public.colaboradores_leads ENABLE ROW LEVEL SECURITY;

-- 4. Public can INSERT leads (contact form on main SPA)
CREATE POLICY "public_insert_leads"
  ON public.colaboradores_leads FOR INSERT
  WITH CHECK (true);

-- 5. Admin writes — authenticated users can write to all tables
CREATE POLICY "admin_write_services"
  ON public.services FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "admin_write_locale_strings"
  ON public.locale_strings FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "admin_write_sponsors"
  ON public.sponsors FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "admin_write_settings"
  ON public.settings FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "admin_read_leads"
  ON public.colaboradores_leads FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "admin_write_leads"
  ON public.colaboradores_leads FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

-- 6. RPC to increment sponsor clicks (called from public SPA, no auth needed)
CREATE OR REPLACE FUNCTION public.increment_sponsor_clicks(sponsor_id UUID)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE public.sponsors SET clicks = clicks + 1 WHERE id = sponsor_id;
$$;

-- Verify all tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' ORDER BY table_name;
