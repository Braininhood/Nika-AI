-- Phase 1: onboarding profile fields + diagnostic sessions

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS target_regulator TEXT,
  ADD COLUMN IF NOT EXISTS target_grades JSONB DEFAULT '{"listening":"B","reading":"B","writing":"B","speaking":"B","single_sitting":false}',
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- Diagnostic placement sessions (Phase 1.2)
CREATE TABLE IF NOT EXISTS diagnostic_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  profession oet_profession,
  target_regulator TEXT,
  target_grades JSONB DEFAULT '{}',
  answers JSONB DEFAULT '[]',
  skill_map JSONB,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_diagnostic_user ON diagnostic_sessions(user_id, started_at DESC);

ALTER TABLE diagnostic_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own diagnostic sessions" ON diagnostic_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own diagnostic sessions" ON diagnostic_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own diagnostic sessions" ON diagnostic_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users insert own skill snapshots" ON user_skill_snapshots
  FOR INSERT WITH CHECK (auth.uid() = user_id);
