-- Add phone column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;

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

CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_farmer_id ON listings(farmer_id);
CREATE INDEX IF NOT EXISTS idx_listings_crop ON listings(crop);
CREATE INDEX IF NOT EXISTS idx_listings_municipality ON listings(municipality);

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "listings_select_active" ON listings
  FOR SELECT USING (status = 'active');

CREATE POLICY "listings_select_own" ON listings
  FOR SELECT USING (auth.uid() = farmer_id);

CREATE POLICY "listings_insert" ON listings
  FOR INSERT WITH CHECK (
    auth.uid() = farmer_id
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'farmer')
  );

CREATE POLICY "listings_update" ON listings
  FOR UPDATE USING (auth.uid() = farmer_id)
  WITH CHECK (auth.uid() = farmer_id);

CREATE POLICY "listings_delete" ON listings
  FOR DELETE USING (auth.uid() = farmer_id);

-- Create storage bucket for photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-photos', 'listing-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "listing_photos_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'listing-photos');

CREATE POLICY "listing_photos_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'listing-photos' AND auth.role() = 'authenticated');

CREATE POLICY "listing_photos_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'listing-photos' AND auth.uid() = owner);
