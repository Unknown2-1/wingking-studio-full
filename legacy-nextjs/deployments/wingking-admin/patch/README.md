# Wingking Admin â€“ password visibility patch

Production admin URL: https://wingking-studio-admin.vercel.app/admin/security

This is an additive source snapshot of the password visibility script and the admin layout integration example. The live admin is a separately deployed Next.js application; its complete current source is NOT included in this branch bundle. Do not copy `admin-layout.patch.tsx` over the existing repository's app/admin/layout.tsx without reconciling its latest authentication code.

The eye icon toggles the client-side input type without reading, saving or transmitting credentials. Verify visually in the separate admin project after deploying from authoritative admin source. No credentials or environment secrets are contained here.