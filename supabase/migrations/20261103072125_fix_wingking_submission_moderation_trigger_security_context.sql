-- Schema migration imported from user's Wingking Supabase project.
-- Version: 20261103072125
-- Apply using Supabase CLI on a fresh project; do not rerun on live database.

-- The trigger previously ran as the authenticated browser role and failed
-- to resolve private.wk_is_moderator() (schema private has no USAGE grant).
-- Execute only the trigger body with the already-owned postgres context;
-- its moderator check still uses auth.uid() from the caller's JWT.
ALTER FUNCTION private.wk_submission_review_gate() SECURITY DEFINER;
-- Retain its existing empty search_path and prevent direct invocation.
REVOKE ALL ON FUNCTION private.wk_submission_review_gate() FROM PUBLIC, anon, authenticated;
COMMENT ON FUNCTION private.wk_submission_review_gate() IS 'Wingking review trigger; executes with definer privileges to call private moderator check while preserving private schema isolation.';
