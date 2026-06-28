-- Remove unused content_scenarios table (never wired in app code).
-- Admin CMS uses content_items (20250616200000_content_admin_ml.sql).
-- Bundled OET scenarios live in repo apps/web/src/content/ and merge at runtime.

DROP POLICY IF EXISTS "Anyone reads published scenarios" ON content_scenarios;
DROP TABLE IF EXISTS content_scenarios CASCADE;
