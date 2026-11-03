-- Schema migration imported from user's Wingking Supabase project.
-- Version: 20261102232548
-- Apply using Supabase CLI on a fresh project; do not rerun on live database.

create schema if not exists private;
create table if not exists public.wk_moderators(user_id uuid primary key references auth.users(id) on delete cascade, added_at timestamptz not null default now());
alter table public.wk_moderators enable row level security;
revoke all on public.wk_moderators from public,anon,authenticated;
grant select on public.wk_moderators to authenticated;
drop policy if exists wk_moderator_self on public.wk_moderators;
create policy wk_moderator_self on public.wk_moderators for select to authenticated using(user_id=(select auth.uid()));
create or replace function private.wk_is_moderator() returns boolean language sql stable security definer set search_path='' as $$ select exists(select 1 from public.wk_moderators where user_id=(select auth.uid())) $$;
revoke all on function private.wk_is_moderator() from public,anon;
grant execute on function private.wk_is_moderator() to authenticated;
create or replace function private.wk_enforce_review() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if TG_OP='INSERT' then
   new.review_status:='pending';new.is_published:=false;new.review_note:='';new.reviewed_by:=null;new.reviewed_at:=null;
 elsif TG_OP='UPDATE' then
   if (select private.wk_is_moderator()) and (new.review_status is distinct from old.review_status) then
     new.is_published:=(new.review_status='approved');new.reviewed_at:=now();new.reviewed_by:=(select auth.uid());
   else
     new.review_status:='pending';new.is_published:=false;new.review_note:='';new.reviewed_at:=null;new.reviewed_by:=null;
   end if;
 end if;
 return new;
end $$;
revoke all on function private.wk_enforce_review() from public,anon,authenticated;
do $$ declare t text; pub_policy text; owner_policy text; public_pred text; begin
 foreach t in array array['wk_bands','wk_releases','wk_clips'] loop
   execute format('alter table public.%I add column if not exists review_status text not null default ''pending''',t);
   execute format('alter table public.%I add column if not exists review_note text not null default ''''',t);
   execute format('alter table public.%I add column if not exists reviewed_at timestamptz',t);
   execute format('alter table public.%I add column if not exists reviewed_by uuid',t);
   execute format('update public.%I set review_status=''pending'',is_published=false',t);
   execute format('alter table public.%I add constraint %I check(review_status in (''pending'',''approved'',''rejected'') and char_length(review_note)<=500)',t,t||'_review_valid');
   execute format('create trigger %I before insert or update on public.%I for each row execute function private.wk_enforce_review()',t||'_review_gate',t);
   if t='wk_bands' then pub_policy:='wk_band_public_read';owner_policy:='wk_band_owner_read';
      public_pred:='(is_published and review_status=''approved'')';
   elsif t='wk_releases' then pub_policy:='wk_release_public_read';owner_policy:='wk_release_owner_read';
      public_pred:='(is_published and review_status=''approved'' and exists(select 1 from public.wk_bands b where b.id=band_id and b.is_published and b.review_status=''approved''))';
   else pub_policy:='wk_clips_read_public';owner_policy:='wk_clips_read_owner';
      public_pred:='(is_published and review_status=''approved'' and exists(select 1 from public.wk_bands b where b.id=band_id and b.is_published and b.review_status=''approved''))';
   end if;
   execute format('drop policy if exists %I on public.%I',pub_policy,t);
   execute format('create policy %I on public.%I for select to anon using %s',pub_policy,t,public_pred);
   execute format('drop policy if exists %I on public.%I',owner_policy,t);
   execute format('create policy %I on public.%I for select to authenticated using (owner_id=(select auth.uid()) or (select private.wk_is_moderator()) or %s)',owner_policy,t,public_pred);
   execute format('create policy %I on public.%I for update to authenticated using((select private.wk_is_moderator())) with check((select private.wk_is_moderator()))',t||'_moderator_update',t);
   execute format('revoke all on public.%I from anon,authenticated',t);
   execute format('grant select on public.%I to anon',t);
   execute format('grant select,insert,update,delete on public.%I to authenticated',t);
   execute format('create index %I on public.%I(review_status,created_at desc)',t||'_review_status_idx',t);
 end loop;
end $$;
