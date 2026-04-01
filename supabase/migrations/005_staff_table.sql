CREATE TABLE IF NOT EXISTS staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  pin_hash TEXT NOT NULL,
  role TEXT DEFAULT 'seller' CHECK (role IN ('driver', 'seller', 'admin')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff readable by authenticated" ON staff FOR SELECT USING (true);

-- Seed initial staff (PINs will need to be set properly later)
-- Using bcrypt hash of '12345678' as placeholder
INSERT INTO staff (name, role) VALUES
  ('Tomek', 'seller'),
  ('Klaus R', 'driver'),
  ('Klaus A', 'driver'),
  ('Michael W', 'admin');
