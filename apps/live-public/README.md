# Live public website

`dist/` is the recovered **actual Vite production build** including CSS, JS and illustrated assets. It is runnable with `npm run dev:public` at repository root. `source/` has original Vite helpers/configuration only, because the large `src/main.jsx` was truncated by the available source API. The editable earlier Next.js source lives in `legacy-nextjs/`.

The frontend bundle points to the real Wingking Supabase project. Never test destructive changes in production.
