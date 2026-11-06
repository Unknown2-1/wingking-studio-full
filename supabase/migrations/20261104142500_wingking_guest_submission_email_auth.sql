-- Tie authenticated guest-upload drafts to the verified Supabase account that created them.
alter table public.wk_guest_requests
  add column if not exists submitted_by uuid references auth.users(id) on delete set null;

create index if not exists wk_guest_requests_submitted_by_idx
  on public.wk_guest_requests(submitted_by, created_at desc);
