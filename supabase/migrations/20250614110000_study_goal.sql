-- Study goal: training-only (default) vs exam preparation with optional date

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS study_goal TEXT DEFAULT 'training'
  CHECK (study_goal IN ('training', 'exam_prep'));

UPDATE profiles
SET study_goal = 'exam_prep'
WHERE exam_date IS NOT NULL AND (study_goal IS NULL OR study_goal = 'training');
