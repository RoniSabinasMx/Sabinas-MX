-- ml_products_migration.sql
-- SABINAS E-commerce Architecture
-- Prepares the Supabase database for the future Mercado Libre integration

-- 1. Create the products table
CREATE TABLE public.products (
    id UUID DEFAULT auth.uid() PRIMARY KEY,
    title_es TEXT NOT NULL,
    title_en TEXT,
    description_es TEXT,
    description_en TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    stock INTEGER NOT NULL DEFAULT 0,
    category TEXT,
    image_url TEXT,
    ml_item_id TEXT UNIQUE, -- Nullable, will be populated on sync with Mercado Libre
    ml_sync_status TEXT DEFAULT 'pending', -- 'synced', 'error', 'pending'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Fix UUID generation default (should be uuid_generate_v4 instead of auth.uid)
ALTER TABLE public.products ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 2. Add full text search functionality if desired later...
-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies

-- Allow public read access (anyone can see products)
CREATE POLICY "Allow public read access to products"
ON public.products FOR SELECT
USING (is_active = true);

-- Allow authenticated admins to do everything
CREATE POLICY "Allow authenticated users to manage products"
ON public.products FOR ALL
USING (auth.role() = 'authenticated' AND auth.jwt()->>'email' LIKE '%@sabinas.mx')
WITH CHECK (auth.role() = 'authenticated' AND auth.jwt()->>'email' LIKE '%@sabinas.mx');

-- 5. Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = timezone('utc'::text, now());
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- End of migration
