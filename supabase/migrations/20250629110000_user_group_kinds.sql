-- Group kinds: manual (curated list) or dynamic (profession / country filter)

ALTER TABLE user_groups
  ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'manual'
    CHECK (kind IN ('manual', 'profession', 'country'));

ALTER TABLE user_groups
  ADD COLUMN IF NOT EXISTS filter_value TEXT;
