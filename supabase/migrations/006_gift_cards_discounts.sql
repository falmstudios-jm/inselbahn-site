CREATE TABLE IF NOT EXISTS gift_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  initial_value DECIMAL(10,2) NOT NULL,
  remaining_value DECIMAL(10,2) NOT NULL,
  purchaser_email TEXT,
  purchaser_name TEXT,
  recipient_name TEXT,
  recipient_message TEXT,
  is_active BOOLEAN DEFAULT true,
  expires_at DATE DEFAULT (CURRENT_DATE + INTERVAL '2 years'),
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS discount_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value DECIMAL(10,2) NOT NULL,
  max_uses INT,
  current_uses INT DEFAULT 0,
  valid_from DATE DEFAULT CURRENT_DATE,
  valid_until DATE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Gift cards insert" ON gift_cards FOR INSERT WITH CHECK (true);
CREATE POLICY "Gift cards readable" ON gift_cards FOR SELECT USING (true);
CREATE POLICY "Discount codes readable" ON discount_codes FOR SELECT USING (true);
