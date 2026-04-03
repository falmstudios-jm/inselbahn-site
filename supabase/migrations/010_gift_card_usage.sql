CREATE TABLE IF NOT EXISTS gift_card_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gift_card_id UUID REFERENCES gift_cards(id),
  booking_id UUID REFERENCES bookings(id),
  amount_used DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE gift_card_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Gift card usage insertable" ON gift_card_usage FOR INSERT WITH CHECK (true);
CREATE POLICY "Gift card usage readable" ON gift_card_usage FOR SELECT USING (true);
