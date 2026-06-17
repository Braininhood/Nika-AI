-- Admin-managed content, server diagnostics, ML training samples

CREATE TABLE IF NOT EXISTS content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT NOT NULL,
  skill TEXT NOT NULL CHECK (skill IN ('writing', 'reading', 'listening', 'speaking')),
  item_type TEXT NOT NULL,
  title TEXT,
  payload JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  source TEXT NOT NULL DEFAULT 'admin' CHECK (source IN ('admin', 'generated', 'static_override')),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (skill, external_id)
);

CREATE INDEX IF NOT EXISTS idx_content_items_skill_active
  ON content_items (skill, is_active);

-- diagnostic_sessions was created in 20250614000000_phase1_onboarding.sql (started_at, no updated_at).
-- Add updated_at for API diagnostic_store; do not recreate the table.
ALTER TABLE diagnostic_sessions
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

UPDATE diagnostic_sessions
SET updated_at = COALESCE(completed_at, started_at, NOW())
WHERE updated_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_diagnostic_sessions_user
  ON diagnostic_sessions (user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS ml_training_samples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  features JSONB NOT NULL,
  label INT NOT NULL CHECK (label IN (0, 1)),
  source TEXT NOT NULL DEFAULT 'outcome',
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ml_training_samples_recorded
  ON ml_training_samples (recorded_at DESC);

-- RLS: service role only (API uses service role key)
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_training_samples ENABLE ROW LEVEL SECURITY;
