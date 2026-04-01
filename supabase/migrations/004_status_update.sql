-- Update booking status constraint to include new granular statuses
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check
  CHECK (status IN ('pending', 'confirmed', 'nopayment', 'cancelled', 'refunded', 'partial_refund', 'our_cancellation'));

-- Update existing cancelled bookings that were actually nopayment
UPDATE bookings SET status = 'nopayment' WHERE status = 'cancelled' AND stripe_payment_intent_id IS NULL;

-- Add invoice_data column for optional invoice information
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS invoice_data JSONB;
