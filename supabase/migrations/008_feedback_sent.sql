-- Add feedback_sent column for post-tour feedback emails
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS feedback_sent BOOLEAN DEFAULT false;
