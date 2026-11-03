# Supabase backend

`functions/` contains the four principal current Edge Functions. `migrations/` contains safe migration-history SQL from the existing Supabase project; account-provisioning and one-time pg_net helper migrations have intentionally been omitted. `types/` contains generated schema types. The live DB, service keys, user login data and uploaded media are not committed.

To set up staging, review `../docs/TEAM_SETUP.md` and `../docs/STATUS.md` before running migrations. Never reapply these migrations to the existing production project.
