-- Tours table
CREATE TABLE IF NOT EXISTS tours (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INT NOT NULL,
  max_capacity INT NOT NULL,
  price_adult DECIMAL(10,2) NOT NULL,
  price_child DECIMAL(10,2) NOT NULL,
  child_age_limit INT DEFAULT 15,
  wheelchair_accessible BOOLEAN DEFAULT false,
  dogs_allowed BOOLEAN DEFAULT false,
  highlights TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Departures (schedule template)
CREATE TABLE IF NOT EXISTS departures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
  departure_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  departure_id UUID REFERENCES departures(id),
  booking_date DATE NOT NULL,
  adults INT NOT NULL DEFAULT 1,
  children INT NOT NULL DEFAULT 0,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'nopayment', 'cancelled', 'refunded', 'partial_refund', 'our_cancellation')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  cancelled_at TIMESTAMPTZ
);

-- Announcements (for banner updates)
CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'cancellation')),
  active_from TIMESTAMPTZ DEFAULT now(),
  active_until TIMESTAMPTZ,
  affected_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Chat logs (anonymous summaries for service improvement)
CREATE TABLE IF NOT EXISTS chat_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  summary TEXT NOT NULL,
  topics TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'unknown' CHECK (status IN ('success', 'partial', 'failed', 'abuse', 'unknown')),
  message_count INT NOT NULL DEFAULT 0,
  ip_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE departures ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Public read policies for tours, departures, announcements
CREATE POLICY "Tours are publicly readable" ON tours FOR SELECT USING (true);
CREATE POLICY "Departures are publicly readable" ON departures FOR SELECT USING (true);
CREATE POLICY "Announcements are publicly readable" ON announcements FOR SELECT USING (true);
-- Bookings: insert only (for creating bookings), no public read
CREATE POLICY "Anyone can create bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Chat logs are insert-only" ON chat_logs FOR INSERT WITH CHECK (true);
