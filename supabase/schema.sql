-- ============================================================
-- Kita-Ani — full Supabase schema (single source of truth)
--
-- Consolidates .opencode/plans/supabase-schema.sql plus
-- supabase/migration-crops.sql, migration-listings.sql and
-- migration-signup-trigger.sql. Safe to re-run: every statement is
-- idempotent. Run in the Supabase SQL Editor on a new project, or on
-- an existing one to bring it up to date. The older migration files
-- are kept only as history.
--
-- Tables: profiles, plantings, planting_crops, activities, expenses,
--         harvests, weather_logs, listings
-- Storage: crop-photos, listing-photos
-- ============================================================

-- ------------------------------------------------------------
-- 1. PROFILES (one row per auth user)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('farmer', 'buyer', 'admin')),
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- Allow the 'admin' role on databases created before it existed.
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('farmer', 'buyer', 'admin'));

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Signed-in users can read other profiles. Listings join to the seller's
-- name + phone; without this, buyers see "Farmer / No Contact Number".
-- Note: this also exposes emails to signed-in users (the app never shows them).
DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
CREATE POLICY "profiles_select_all" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Users can edit their own row but never change their own role
-- (admins are promoted from the SQL Editor, which bypasses RLS).
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
  );

-- True when the signed-in user is an admin. SECURITY DEFINER so policies on
-- other tables can call it without recursing into profiles' own RLS.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- Auto-create a profile on signup, taking role/name/phone from signup metadata.
-- Only 'buyer' or 'farmer' can be self-selected; 'admin' is never accepted here.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, phone)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    CASE WHEN new.raw_user_meta_data->>'role' = 'buyer' THEN 'buyer' ELSE 'farmer' END,
    new.raw_user_meta_data->>'phone'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
  END IF;
END $$;

-- ------------------------------------------------------------
-- 2. CROP TRACKING (plantings, crops, activities, expenses, harvests, weather)
-- ------------------------------------------------------------
-- 1. PLANTINGS (a "planting" = a field planted in a given season)
CREATE TABLE IF NOT EXISTS plantings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  municipality TEXT NOT NULL,
  area_ha NUMERIC(8,2) NOT NULL CHECK (area_ha > 0),
  season TEXT NOT NULL CHECK (season IN ('wet', 'dry')),
  season_year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  planting_date DATE NOT NULL,
  budget_amount NUMERIC(12,2) DEFAULT 0,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. CROPS WITHIN A PLANTING (supports intercropping)
CREATE TABLE IF NOT EXISTS planting_crops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  planting_id UUID NOT NULL REFERENCES plantings(id) ON DELETE CASCADE,
  crop_type TEXT NOT NULL,
  variety TEXT,
  area_ha NUMERIC(8,2),
  expected_harvest_date DATE,
  status TEXT NOT NULL DEFAULT 'planted' CHECK (status IN ('planted', 'growing', 'harvest-ready', 'harvested')),
  current_stage TEXT,
  is_main BOOLEAN NOT NULL DEFAULT true,
  planted_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. ACTIVITY JOURNAL (the core tracking mechanism)
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  planting_id UUID NOT NULL REFERENCES plantings(id) ON DELETE CASCADE,
  crop_id UUID REFERENCES planting_crops(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN (
    'land-preparation', 'planting', 'fertilizer', 'pesticide',
    'herbicide', 'irrigation', 'weeding', 'observation',
    'pest-spotted', 'weather', 'harvest', 'post-harvest',
    'expense-only', 'other'
  )),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  photos JSONB DEFAULT '[]'::jsonb,
  product_name TEXT,
  quantity NUMERIC(10,2),
  unit TEXT,
  expense_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. EXPENSES (per-planting, can link to an activity)
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  planting_id UUID NOT NULL REFERENCES plantings(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN (
    'seeds', 'fertilizer', 'pesticide', 'herbicide',
    'labor', 'irrigation', 'transport', 'rental',
    'post-harvest', 'other'
  )),
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  receipt_photo TEXT,
  activity_id UUID REFERENCES activities(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. HARVEST RECORDS
CREATE TABLE IF NOT EXISTS harvests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  planting_crop_id UUID NOT NULL REFERENCES planting_crops(id) ON DELETE CASCADE,
  harvest_date DATE NOT NULL DEFAULT CURRENT_DATE,
  yield_amount NUMERIC(12,2) NOT NULL CHECK (yield_amount > 0),
  yield_unit TEXT NOT NULL DEFAULT 'kg',
  grade TEXT CHECK (grade IN ('premium', 'standard', 'reject')),
  moisture_content NUMERIC(5,2),
  sold_to TEXT,
  price_per_unit NUMERIC(12,2),
  total_revenue NUMERIC(14,2),
  notes TEXT,
  photos JSONB DEFAULT '[]'::jsonb,
  listing_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. WEATHER LOGS
CREATE TABLE IF NOT EXISTS weather_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  planting_id UUID NOT NULL REFERENCES plantings(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  condition TEXT NOT NULL,
  notes TEXT,
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'api')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ------------------------------------------------------------
-- TABLE DRIFT REPAIR
-- CREATE TABLE IF NOT EXISTS skips a table that already exists, even if
-- it is missing columns. Add any missing columns (type + default only;
-- constraints are not retrofitted onto existing data).
-- ------------------------------------------------------------
ALTER TABLE plantings
  ADD COLUMN IF NOT EXISTS farmer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS field_name TEXT,
  ADD COLUMN IF NOT EXISTS municipality TEXT,
  ADD COLUMN IF NOT EXISTS area_ha NUMERIC(8,2),
  ADD COLUMN IF NOT EXISTS season TEXT,
  ADD COLUMN IF NOT EXISTS season_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  ADD COLUMN IF NOT EXISTS planting_date DATE,
  ADD COLUMN IF NOT EXISTS budget_amount NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE planting_crops
  ADD COLUMN IF NOT EXISTS planting_id UUID REFERENCES plantings(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS crop_type TEXT,
  ADD COLUMN IF NOT EXISTS variety TEXT,
  ADD COLUMN IF NOT EXISTS area_ha NUMERIC(8,2),
  ADD COLUMN IF NOT EXISTS expected_harvest_date DATE,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'planted',
  ADD COLUMN IF NOT EXISTS current_stage TEXT,
  ADD COLUMN IF NOT EXISTS is_main BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS planted_date DATE,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE activities
  ADD COLUMN IF NOT EXISTS planting_id UUID REFERENCES plantings(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS crop_id UUID REFERENCES planting_crops(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS type TEXT,
  ADD COLUMN IF NOT EXISTS date DATE DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS product_name TEXT,
  ADD COLUMN IF NOT EXISTS quantity NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS unit TEXT,
  ADD COLUMN IF NOT EXISTS expense_id UUID,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE expenses
  ADD COLUMN IF NOT EXISTS planting_id UUID REFERENCES plantings(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS amount NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS date DATE DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS receipt_photo TEXT,
  ADD COLUMN IF NOT EXISTS activity_id UUID REFERENCES activities(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE harvests
  ADD COLUMN IF NOT EXISTS planting_crop_id UUID REFERENCES planting_crops(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS harvest_date DATE DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS yield_amount NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS yield_unit TEXT DEFAULT 'kg',
  ADD COLUMN IF NOT EXISTS grade TEXT,
  ADD COLUMN IF NOT EXISTS moisture_content NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS sold_to TEXT,
  ADD COLUMN IF NOT EXISTS price_per_unit NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS total_revenue NUMERIC(14,2),
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS listing_id UUID,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE weather_logs
  ADD COLUMN IF NOT EXISTS planting_id UUID REFERENCES plantings(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS date DATE DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS condition TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- Link activities → expenses (circular ref, resolved after insert)
ALTER TABLE activities
  DROP CONSTRAINT IF EXISTS activities_expense_id_fkey;
ALTER TABLE activities
  ADD CONSTRAINT activities_expense_id_fkey
  FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE SET NULL;

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_plantings_farmer_id ON plantings(farmer_id);
CREATE INDEX IF NOT EXISTS idx_plantings_season ON plantings(season, season_year);
CREATE INDEX IF NOT EXISTS idx_plantings_status ON plantings(status);

CREATE INDEX IF NOT EXISTS idx_planting_crops_planting_id ON planting_crops(planting_id);
CREATE INDEX IF NOT EXISTS idx_planting_crops_status ON planting_crops(status);

CREATE INDEX IF NOT EXISTS idx_activities_planting_id ON activities(planting_id);
CREATE INDEX IF NOT EXISTS idx_activities_crop_id ON activities(crop_id);
CREATE INDEX IF NOT EXISTS idx_activities_date ON activities(date);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);

CREATE INDEX IF NOT EXISTS idx_expenses_planting_id ON expenses(planting_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);

CREATE INDEX IF NOT EXISTS idx_harvests_planting_crop_id ON harvests(planting_crop_id);
CREATE INDEX IF NOT EXISTS idx_harvests_date ON harvests(harvest_date);

CREATE INDEX IF NOT EXISTS idx_weather_logs_planting_id ON weather_logs(planting_id);


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE plantings ENABLE ROW LEVEL SECURITY;
ALTER TABLE planting_crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE harvests ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_logs ENABLE ROW LEVEL SECURITY;

-- Plantings
DROP POLICY IF EXISTS "plantings_select_own" ON plantings;
CREATE POLICY "plantings_select_own" ON plantings
  FOR SELECT USING (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "plantings_insert" ON plantings;
CREATE POLICY "plantings_insert" ON plantings
  FOR INSERT WITH CHECK (
    auth.uid() = farmer_id
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'farmer')
  );

DROP POLICY IF EXISTS "plantings_update" ON plantings;
CREATE POLICY "plantings_update" ON plantings
  FOR UPDATE USING (auth.uid() = farmer_id)
  WITH CHECK (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "plantings_delete" ON plantings;
CREATE POLICY "plantings_delete" ON plantings
  FOR DELETE USING (auth.uid() = farmer_id);

-- Planting crops (inherits access via planting)
DROP POLICY IF EXISTS "planting_crops_select" ON planting_crops;
CREATE POLICY "planting_crops_select" ON planting_crops
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM plantings WHERE id = planting_id AND farmer_id = auth.uid())
  );

DROP POLICY IF EXISTS "planting_crops_insert" ON planting_crops;
CREATE POLICY "planting_crops_insert" ON planting_crops
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM plantings WHERE id = planting_id AND farmer_id = auth.uid())
  );

DROP POLICY IF EXISTS "planting_crops_update" ON planting_crops;
CREATE POLICY "planting_crops_update" ON planting_crops
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM plantings WHERE id = planting_id AND farmer_id = auth.uid())
  );

DROP POLICY IF EXISTS "planting_crops_delete" ON planting_crops;
CREATE POLICY "planting_crops_delete" ON planting_crops
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM plantings WHERE id = planting_id AND farmer_id = auth.uid())
  );

-- Activities
DROP POLICY IF EXISTS "activities_select" ON activities;
CREATE POLICY "activities_select" ON activities
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM plantings WHERE id = planting_id AND farmer_id = auth.uid())
  );

DROP POLICY IF EXISTS "activities_insert" ON activities;
CREATE POLICY "activities_insert" ON activities
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM plantings WHERE id = planting_id AND farmer_id = auth.uid())
  );

DROP POLICY IF EXISTS "activities_update" ON activities;
CREATE POLICY "activities_update" ON activities
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM plantings WHERE id = planting_id AND farmer_id = auth.uid())
  );

DROP POLICY IF EXISTS "activities_delete" ON activities;
CREATE POLICY "activities_delete" ON activities
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM plantings WHERE id = planting_id AND farmer_id = auth.uid())
  );

-- Expenses
DROP POLICY IF EXISTS "expenses_select" ON expenses;
CREATE POLICY "expenses_select" ON expenses
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM plantings WHERE id = planting_id AND farmer_id = auth.uid())
  );

DROP POLICY IF EXISTS "expenses_insert" ON expenses;
CREATE POLICY "expenses_insert" ON expenses
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM plantings WHERE id = planting_id AND farmer_id = auth.uid())
  );

DROP POLICY IF EXISTS "expenses_update" ON expenses;
CREATE POLICY "expenses_update" ON expenses
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM plantings WHERE id = planting_id AND farmer_id = auth.uid())
  );

DROP POLICY IF EXISTS "expenses_delete" ON expenses;
CREATE POLICY "expenses_delete" ON expenses
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM plantings WHERE id = planting_id AND farmer_id = auth.uid())
  );

-- Harvests
DROP POLICY IF EXISTS "harvests_select" ON harvests;
CREATE POLICY "harvests_select" ON harvests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM planting_crops pc
      JOIN plantings p ON p.id = pc.planting_id
      WHERE pc.id = planting_crop_id AND p.farmer_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "harvests_insert" ON harvests;
CREATE POLICY "harvests_insert" ON harvests
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM planting_crops pc
      JOIN plantings p ON p.id = pc.planting_id
      WHERE pc.id = planting_crop_id AND p.farmer_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "harvests_update" ON harvests;
CREATE POLICY "harvests_update" ON harvests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM planting_crops pc
      JOIN plantings p ON p.id = pc.planting_id
      WHERE pc.id = planting_crop_id AND p.farmer_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "harvests_delete" ON harvests;
CREATE POLICY "harvests_delete" ON harvests
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM planting_crops pc
      JOIN plantings p ON p.id = pc.planting_id
      WHERE pc.id = planting_crop_id AND p.farmer_id = auth.uid()
    )
  );

-- Weather logs
DROP POLICY IF EXISTS "weather_logs_select" ON weather_logs;
CREATE POLICY "weather_logs_select" ON weather_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM plantings WHERE id = planting_id AND farmer_id = auth.uid())
  );

DROP POLICY IF EXISTS "weather_logs_insert" ON weather_logs;
CREATE POLICY "weather_logs_insert" ON weather_logs
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM plantings WHERE id = planting_id AND farmer_id = auth.uid())
  );

-- ============================================================
-- STORAGE BUCKET
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('crop-photos', 'crop-photos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "crop_photos_select" ON storage.objects;
CREATE POLICY "crop_photos_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'crop-photos');

DROP POLICY IF EXISTS "crop_photos_insert" ON storage.objects;
CREATE POLICY "crop_photos_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'crop-photos' AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "crop_photos_delete" ON storage.objects;
CREATE POLICY "crop_photos_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'crop-photos' AND auth.uid() = owner
  );

-- ============================================================
-- 3. MARKETPLACE LISTINGS
-- ============================================================
-- Create listings table
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  crop TEXT NOT NULL,
  quantity TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  grade TEXT NOT NULL,
  municipality TEXT NOT NULL,
  description TEXT,
  harvest_date DATE,
  photos JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS farmer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS crop TEXT,
  ADD COLUMN IF NOT EXISTS quantity TEXT,
  ADD COLUMN IF NOT EXISTS price NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS grade TEXT,
  ADD COLUMN IF NOT EXISTS municipality TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS harvest_date DATE,
  ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_farmer_id ON listings(farmer_id);
CREATE INDEX IF NOT EXISTS idx_listings_crop ON listings(crop);
CREATE INDEX IF NOT EXISTS idx_listings_municipality ON listings(municipality);

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "listings_select_active" ON listings;
CREATE POLICY "listings_select_active" ON listings
  FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "listings_select_own" ON listings;
CREATE POLICY "listings_select_own" ON listings
  FOR SELECT USING (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "listings_insert" ON listings;
CREATE POLICY "listings_insert" ON listings
  FOR INSERT WITH CHECK (
    auth.uid() = farmer_id
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'farmer')
  );

DROP POLICY IF EXISTS "listings_update" ON listings;
CREATE POLICY "listings_update" ON listings
  FOR UPDATE USING (auth.uid() = farmer_id)
  WITH CHECK (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "listings_delete" ON listings;
CREATE POLICY "listings_delete" ON listings
  FOR DELETE USING (auth.uid() = farmer_id);

-- Create storage bucket for photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-photos', 'listing-photos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "listing_photos_select" ON storage.objects;
CREATE POLICY "listing_photos_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'listing-photos');

DROP POLICY IF EXISTS "listing_photos_insert" ON storage.objects;
CREATE POLICY "listing_photos_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'listing-photos' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "listing_photos_delete" ON storage.objects;
CREATE POLICY "listing_photos_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'listing-photos' AND auth.uid() = owner);

-- ============================================================
-- 4. ADMIN READ ACCESS (export)
-- Admins can read every row of the farmer data tables. Profiles are
-- already readable by all signed-in users (profiles_select_all).
-- Admins are promoted in section 5 at the bottom of this file.
-- ============================================================
DROP POLICY IF EXISTS "plantings_admin_select" ON plantings;
CREATE POLICY "plantings_admin_select" ON plantings FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "planting_crops_admin_select" ON planting_crops;
CREATE POLICY "planting_crops_admin_select" ON planting_crops FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "activities_admin_select" ON activities;
CREATE POLICY "activities_admin_select" ON activities FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "expenses_admin_select" ON expenses;
CREATE POLICY "expenses_admin_select" ON expenses FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "harvests_admin_select" ON harvests;
CREATE POLICY "harvests_admin_select" ON harvests FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "listings_admin_select" ON listings;
CREATE POLICY "listings_admin_select" ON listings FOR SELECT USING (public.is_admin());

-- ------------------------------------------------------------
-- 5. ADMIN ACCOUNTS
-- Seeds a default admin login: admin@gmail.com / admin123$
-- !! This password is committed to the repo. Change it (Supabase ->
-- Authentication -> Users) before real users or real farmer data are
-- on this project.
-- Re-running is safe: an existing account is never recreated or reset.
-- ------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

DO $seed$
DECLARE
  admin_email TEXT := 'admin@gmail.com';
  admin_password TEXT := 'admin123$';
  new_id UUID := gen_random_uuid();
BEGIN
  IF EXISTS (SELECT 1 FROM auth.users WHERE lower(email) = lower(admin_email)) THEN
    RAISE NOTICE 'Admin auth user already exists, skipped: %', admin_email;
  ELSE
    -- The on_auth_user_created trigger creates the matching profile row.
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change, email_change_token_new
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', new_id, 'authenticated', 'authenticated',
      admin_email, extensions.crypt(admin_password, extensions.gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Admin"}'::jsonb, now(), now(),
      '', '', '', ''
    );
    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), new_id,
      jsonb_build_object('sub', new_id::text, 'email', admin_email, 'email_verified', true),
      'email', new_id::text, now(), now(), now()
    );
    RAISE NOTICE 'Created admin auth user: %', admin_email;
  END IF;
END $seed$;

-- Promote accounts to admin. Add more emails to the list if needed.
-- Already-admin accounts are skipped; emails with no account only raise a notice.
DO $$
DECLARE
  admin_emails TEXT[] := ARRAY['admin@gmail.com'];
  e TEXT;
  n INTEGER;
BEGIN
  FOREACH e IN ARRAY admin_emails LOOP
    IF EXISTS (SELECT 1 FROM public.profiles WHERE lower(email) = lower(e) AND role = 'admin') THEN
      RAISE NOTICE 'Already admin, skipped: %', e;
    ELSE
      UPDATE public.profiles SET role = 'admin' WHERE lower(email) = lower(e);
      GET DIAGNOSTICS n = ROW_COUNT;
      IF n = 0 THEN
        RAISE NOTICE 'No account found for %, sign up first then re-run', e;
      ELSE
        RAISE NOTICE 'Promoted to admin: %', e;
      END IF;
    END IF;
  END LOOP;
END $$;
