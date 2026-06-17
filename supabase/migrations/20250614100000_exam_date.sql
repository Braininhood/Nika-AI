-- Phase 1 stretch: optional OET exam date for countdown UI

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS exam_date DATE;
