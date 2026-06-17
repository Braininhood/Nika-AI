-- Supabase Security Advisor remediation
-- Resolves: function search_path, extension in public, public bucket listing,
-- and SECURITY DEFINER functions callable by anon/authenticated.

-- ---------------------------------------------------------------------------
-- 1. handle_new_user — set search_path, revoke API execute
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. rls_auto_enable — revoke API execute (event trigger only)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF to_regprocedure('public.rls_auto_enable()') IS NOT NULL THEN
    REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC;
    REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon, authenticated;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 3. vector extension — move out of public schema
-- ---------------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS extensions;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_extension e
    JOIN pg_namespace n ON n.oid = e.extnamespace
    WHERE e.extname = 'vector' AND n.nspname = 'public'
  ) THEN
    ALTER EXTENSION vector SET SCHEMA extensions;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 4. content-packs — drop SELECT policies that allow bucket listing
--    Public object URLs (/storage/v1/object/public/...) do not need them.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "content_packs_public_read" ON storage.objects;
DROP POLICY IF EXISTS "content_packs_authenticated_read" ON storage.objects;
