-- OET Coach initial schema (Phase 0)
-- Run via Supabase CLI: supabase db push
-- Or paste into Supabase SQL editor

CREATE EXTENSION IF NOT EXISTS vector;

-- Healthcare profession enum (12 OET professions)
CREATE TYPE oet_profession AS ENUM (
  'medicine',
  'nursing',
  'pharmacy',
  'dentistry',
  'physiotherapy',
  'radiography',
  'occupational_therapy',
  'optometry',
  'podiatry',
  'veterinary_science',
  'speech_pathology',
  'dietetics'
);

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  profession oet_profession,
  target_country TEXT,
  target_grade TEXT DEFAULT 'B',
  explanation_locale TEXT DEFAULT 'en',
  role TEXT DEFAULT 'learner',
  guest_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attempts (all skills)
CREATE TABLE IF NOT EXISTS attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  skill TEXT NOT NULL,
  part TEXT,
  scenario_id TEXT,
  score_raw JSONB DEFAULT '{}',
  grade_estimate TEXT,
  duration_seconds INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attempts_user_created ON attempts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_attempts_user_skill ON attempts(user_id, skill);

-- Writing attempts detail
CREATE TABLE IF NOT EXISTS writing_attempts (
  attempt_id UUID PRIMARY KEY REFERENCES attempts(id) ON DELETE CASCADE,
  case_notes_id TEXT,
  letter_text TEXT,
  ai_feedback JSONB,
  criterion_scores JSONB
);

-- Speaking attempts detail
CREATE TABLE IF NOT EXISTS speaking_attempts (
  attempt_id UUID PRIMARY KEY REFERENCES attempts(id) ON DELETE CASCADE,
  role_card_id TEXT,
  transcript TEXT,
  checklist_scores JSONB,
  recording_url TEXT
);

-- Skill snapshots (adaptive engine)
CREATE TABLE IF NOT EXISTS user_skill_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  snapshot JSONB NOT NULL DEFAULT '{}',
  computed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_skill_snapshots_user ON user_skill_snapshots(user_id, computed_at DESC);

-- Content scenarios (CMS)
CREATE TABLE IF NOT EXISTS content_scenarios (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('writing', 'speaking', 'reading', 'listening')),
  profession oet_profession,
  payload JSONB NOT NULL DEFAULT '{}',
  version INT DEFAULT 1,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scenarios_profession_type ON content_scenarios(profession, type);

-- RAG chunks (Phase 6)
CREATE TABLE IF NOT EXISTS rag_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  embedding vector(768),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE writing_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE speaking_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skill_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users read own attempts" ON attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own attempts" ON attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users read own writing attempts" ON writing_attempts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM attempts a WHERE a.id = attempt_id AND a.user_id = auth.uid())
  );

CREATE POLICY "Users read own skill snapshots" ON user_skill_snapshots
  FOR SELECT USING (auth.uid() = user_id);

-- Public read for published content
ALTER TABLE content_scenarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone reads published scenarios" ON content_scenarios
  FOR SELECT USING (published = TRUE);
