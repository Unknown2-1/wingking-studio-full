# Security checklist

- This repository is currently **PUBLIC**. Never upload .env files, service_role JWTs, project secret keys, database URLs containing passwords, private SSH credentials, personal emails used to provision admin, or raw customer data.
- Only public/publishable API keys may be embedded into frontend bundles. Supabase RLS and server-side moderator checks must guard all sensitive operations.
- Generate staging databases, buckets, email identities, and admin accounts independently.
- Rotate any secret accidentally exposed before trying to remove it from GitHub history: deleting a file doesn't erase prior commits.
- Frontend snapshot is wired to the existing live backend. Avoid destructive admin actions when testing it locally.
- Moderator deletion should check ownership/foreign references and media cleanup; keep audit logs and require confirmation.
- Domain and hosting access remain outside this repository. Do not share production secrets as screenshots or chat messages.
