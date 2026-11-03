# Required environment variables

- `DATABASE_URL`: PostgreSQL pooled connection string (server-side only)
- `DIRECT_URL`: PostgreSQL direct connection string for migrations (server-side only)
- `ADMIN_PASSWORD_SCRYPT`: randomly salted `saltHex:hashHex` produced by `node scripts/hash-admin-password.mjs`
- `ADMIN_SESSION_SECRET`: high-entropy random secret, >= 32 characters; rotate to invalidate existing admin sessions
- `NODE_ENV`: set to `production` on hosting (normally managed by Next.js)

NEVER prefix admin or database secrets with `NEXT_PUBLIC_`. Keep production credentials inside hosting secret/environment manager.
