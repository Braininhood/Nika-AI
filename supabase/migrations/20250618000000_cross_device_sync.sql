-- Cross-device study data sync (vocabulary, local study state, attempt upserts)
-- Idempotent: safe to re-run if a prior attempt partially applied.

CREATE TABLE IF NOT EXISTS vocabulary_entries (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  phrase TEXT,
  context TEXT,
  english_explanation TEXT NOT NULL,
  native_translation TEXT,
  native_language TEXT NOT NULL DEFAULT 'PL',
  phonetic_hint TEXT,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  source TEXT NOT NULL DEFAULT 'manual',
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_reviewed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vocabulary_user_added
  ON vocabulary_entries(user_id, added_at DESC);

CREATE TABLE IF NOT EXISTS user_study_blobs (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP POLICY IF EXISTS "Users update own attempts" ON attempts;
CREATE POLICY "Users update own attempts" ON attempts
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own writing attempts" ON writing_attempts;
CREATE POLICY "Users insert own writing attempts" ON writing_attempts
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM attempts a WHERE a.id = attempt_id AND a.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users insert own speaking attempts" ON speaking_attempts;
CREATE POLICY "Users insert own speaking attempts" ON speaking_attempts
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM attempts a WHERE a.id = attempt_id AND a.user_id = auth.uid())
  );

ALTER TABLE vocabulary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_study_blobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own vocabulary" ON vocabulary_entries;
CREATE POLICY "Users read own vocabulary" ON vocabulary_entries
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own vocabulary" ON vocabulary_entries;
CREATE POLICY "Users insert own vocabulary" ON vocabulary_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own vocabulary" ON vocabulary_entries;
CREATE POLICY "Users update own vocabulary" ON vocabulary_entries
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own vocabulary" ON vocabulary_entries;
CREATE POLICY "Users delete own vocabulary" ON vocabulary_entries
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users read own study blob" ON user_study_blobs;
CREATE POLICY "Users read own study blob" ON user_study_blobs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own study blob" ON user_study_blobs;
CREATE POLICY "Users insert own study blob" ON user_study_blobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own study blob" ON user_study_blobs;
CREATE POLICY "Users update own study blob" ON user_study_blobs
  FOR UPDATE USING (auth.uid() = user_id);
