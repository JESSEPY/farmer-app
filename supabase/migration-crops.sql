-- ============================================================
-- CROP TRACKING SYSTEM
-- Tables for planting registration, intercropping, activity
-- journal, expenses, harvests, and weather logging.
-- ============================================================

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

-- Link activities → expenses (circular ref, resolved after insert)
ALTER TABLE activities
  DROP CONSTRAINT IF EXISTS activities_expense_id_fkey;
ALTER TABLE activities
  ADD CONSTRAINT activities_expense_id_fkey
  FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE SET NULL;

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
CREATE POLICY "plantings_select_own" ON plantings
  FOR SELECT USING (auth.uid() = farmer_id);

CREATE POLICY "plantings_insert" ON plantings
  FOR INSERT WITH CHECK (
    auth.uid() = farmer_id
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'farmer')
  );

CREATE POLICY "plantings_update" ON plantings
  FOR UPDATE USING (auth.uid() = farmer_id)
  WITH CHECK (auth.uid() = farmer_id);

CREATE POLICY "plantings_delete" ON plantings
  FOR DELETE USING (auth.uid() = farmer_id);

-- Planting crops (inherits access via planting)
CREATE POLICY "planting_crops_select" ON planting_crops
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM plantings WHERE id = planting_id AND farmer_id = auth.uid())
  );

CREATE POLICY "planting_crops_insert" ON planting_crops
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM plantings WHERE id = planting_id AND farmer_id = auth.uid())
  );

CREATE POLICY "planting_crops_update" ON planting_crops
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM plantings WHERE id = planting_id AND farmer_id = auth.uid())
  );

CREATE POLICY "planting_crops_delete" ON planting_crops
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM plantings WHERE id = planting_id AND farmer_id = auth.uid())
  );

-- Activities
CREATE POLICY "activities_select" ON activities
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM plantings WHERE id = planting_id AND farmer_id = auth.uid())
  );

CREATE POLICY "activities_insert" ON activities
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM plantings WHERE id = planting_id AND farmer_id = auth.uid())
  );

CREATE POLICY "activities_update" ON activities
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM plantings WHERE id = planting_id AND farmer_id = auth.uid())
  );

CREATE POLICY "activities_delete" ON activities
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM plantings WHERE id = planting_id AND farmer_id = auth.uid())
  );

-- Expenses
CREATE POLICY "expenses_select" ON expenses
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM plantings WHERE id = planting_id AND farmer_id = auth.uid())
  );

CREATE POLICY "expenses_insert" ON expenses
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM plantings WHERE id = planting_id AND farmer_id = auth.uid())
  );

CREATE POLICY "expenses_update" ON expenses
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM plantings WHERE id = planting_id AND farmer_id = auth.uid())
  );

CREATE POLICY "expenses_delete" ON expenses
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM plantings WHERE id = planting_id AND farmer_id = auth.uid())
  );

-- Harvests
CREATE POLICY "harvests_select" ON harvests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM planting_crops pc
      JOIN plantings p ON p.id = pc.planting_id
      WHERE pc.id = planting_crop_id AND p.farmer_id = auth.uid()
    )
  );

CREATE POLICY "harvests_insert" ON harvests
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM planting_crops pc
      JOIN plantings p ON p.id = pc.planting_id
      WHERE pc.id = planting_crop_id AND p.farmer_id = auth.uid()
    )
  );

CREATE POLICY "harvests_update" ON harvests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM planting_crops pc
      JOIN plantings p ON p.id = pc.planting_id
      WHERE pc.id = planting_crop_id AND p.farmer_id = auth.uid()
    )
  );

CREATE POLICY "harvests_delete" ON harvests
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM planting_crops pc
      JOIN plantings p ON p.id = pc.planting_id
      WHERE pc.id = planting_crop_id AND p.farmer_id = auth.uid()
    )
  );

-- Weather logs
CREATE POLICY "weather_logs_select" ON weather_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM plantings WHERE id = planting_id AND farmer_id = auth.uid())
  );

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

CREATE POLICY "crop_photos_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'crop-photos');

CREATE POLICY "crop_photos_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'crop-photos' AND auth.role() = 'authenticated'
  );

CREATE POLICY "crop_photos_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'crop-photos' AND auth.uid() = owner
  );


