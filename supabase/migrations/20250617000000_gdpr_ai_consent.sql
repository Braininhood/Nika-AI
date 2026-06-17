-- GDPR: explicit AI processing consent timestamp on profiles

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS ai_consent_at TIMESTAMPTZ;

COMMENT ON COLUMN profiles.ai_consent_at IS 'When the user consented to AI processing (writing/speaking feedback, Nika chat).';
