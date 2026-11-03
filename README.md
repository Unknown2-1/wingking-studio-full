# WINGKING STUDIO — Full Team Repository

Monorepo snapshot for collaboration on the Wingking Studio Indonesian indie music website.

## Projects
- `legacy-nextjs/`: original editable Next.js/Prisma source from `Epan0310/wingking-studio`, branch `dev/unknown2-1`.
- `apps/public-web/`: production-facing public website, upload forms and assets.
- `apps/private-review/`: separate moderator review dashboard.
- `apps/content-manager/`: Content Manager preview for moderation, edit, archive, trash and activity history.
- `supabase/functions/`: Edge Function backend code where available.
- `docs/`: deployment instructions, source provenance and security checklist.

**Security:** Never commit `.env`, auth tokens, Supabase service-role/secret keys, Vercel credentials or exported user records. Public/publishable keys are not a substitute for row-level security (RLS).

**Status:** This repository is a source + deployment snapshot under consolidation. Not all historical Vercel files are available as editable source; see `docs/STATUS.md` for verified gaps. Production databases and real uploaded user media are intentionally not included.

Live website: https://wingking-studio.vercel.app/

Original collaborator source: https://github.com/Epan0310/wingking-studio/tree/dev/unknown2-1

> Do not deploy this repo to production until credentials are configured in hosting environment and login/upload flows have been tested.
