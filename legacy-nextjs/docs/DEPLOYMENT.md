# Deployment checklist: Wingking Studio

Do not use as a customer booking site until the complete end-to-end flow passes.

1. Hosting: a Next.js Node.js runtime, not a static export. Select the `dev/unknown2-1` branch only for preview, not `main`.
2. Database: provision a durable PostgreSQL database and securely configure `DATABASE_URL`; `DIRECT_URL` is required by the current Prisma datasource. Never commit connection strings.
3. Run `npx prisma db push` **only on a newly provisioned empty database**, or review/generate a controlled migration first if existing customer records are present. Run `npx prisma db seed` only after reviewing records. This seed is idempotent and does not delete booked services.
4. Admin: supply `ADMIN_PASSWORD_SCRYPT` and `ADMIN_SESSION_SECRET` through hosting environment variables. Generate a random session secret (`node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`), and generate password hash with scripts/hash-admin-password.mjs privately. Never paste a password into chat.
5. Before accepting customers: test two simultaneous bookings for the same slot, confirm only one saves; test sequential adjacent slots; verify admin status transitions; verify HTTPS and that customers cannot access `/admin` data.
6. Protect admin login with platform-level rate limits or WAF. Included per-process limiter alone is not sufficient across multiple serverless instances. Add backup/restore monitoring and retention policies for customer phone numbers.
7. WhatsApp is not sent automatically. A booking begins with `PENDING`; staff should confirm manually. Do not promise automatic confirmation until implemented and tested.
8. Verify photos, prices and opening hours with the client before publication. Mixing/mastering is not exposed as an hourly slot reservation.

The default free hosting tiers may have credit caps, inactivity suspension or commercial-use restrictions. Confirm provider terms before public launch.
