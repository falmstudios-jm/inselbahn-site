CREATE TABLE IF NOT EXISTS operations_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  command TEXT NOT NULL,
  result TEXT,
  executed_by TEXT,
  actions_taken TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE operations_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ops log insert" ON operations_log FOR INSERT WITH CHECK (true);
CREATE POLICY "Ops log readable" ON operations_log FOR SELECT USING (true);
