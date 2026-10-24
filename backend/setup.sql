-- Ashish Kumar portfolio: run once in Supabase (SQL Editor > New query > paste > Run).
-- Uses its own tables and storage bucket (portfolio_*), so it will not touch any other site in this project.

-- 1) Who may edit. Add every email that should be allowed to sign in to the admin site.
create table if not exists public.portfolio_admins (email text primary key);
alter table public.portfolio_admins enable row level security;   -- no policies: only the function below can read it
insert into public.portfolio_admins (email) values ('thenameisashish11@gmail.com') on conflict do nothing;
-- insert into public.portfolio_admins (email) values ('another@example.com');

create or replace function public.is_portfolio_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.portfolio_admins where lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')))
$$;

-- 2) Site content (one row)
create table if not exists public.portfolio_content (
  id int primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.portfolio_content enable row level security;
drop policy if exists "public can read portfolio" on public.portfolio_content;
drop policy if exists "owner can add portfolio" on public.portfolio_content;
drop policy if exists "owner can edit portfolio" on public.portfolio_content;
create policy "public can read portfolio" on public.portfolio_content for select using (true);
create policy "owner can add portfolio" on public.portfolio_content for insert to authenticated with check (public.is_portfolio_admin());
create policy "owner can edit portfolio" on public.portfolio_content for update to authenticated using (public.is_portfolio_admin()) with check (public.is_portfolio_admin());

-- 3) Messages from the contact form (anyone may send, only you may read)
create table if not exists public.portfolio_messages (
  id bigint generated always as identity primary key,
  name text not null,
  email text not null,
  subject text,
  message text not null,
  created_at timestamptz not null default now()
);
alter table public.portfolio_messages enable row level security;
drop policy if exists "anyone can send portfolio message" on public.portfolio_messages;
drop policy if exists "owner can read portfolio messages" on public.portfolio_messages;
drop policy if exists "owner can delete portfolio messages" on public.portfolio_messages;
create policy "anyone can send portfolio message" on public.portfolio_messages for insert to anon, authenticated
  with check (char_length(name) between 1 and 120 and char_length(email) between 3 and 200 and char_length(message) between 1 and 4000);
create policy "owner can read portfolio messages" on public.portfolio_messages for select to authenticated using (public.is_portfolio_admin());
create policy "owner can delete portfolio messages" on public.portfolio_messages for delete to authenticated using (public.is_portfolio_admin());

-- 4) Public photo storage
insert into storage.buckets (id, name, public) values ('portfolio-media', 'portfolio-media', true) on conflict (id) do nothing;
drop policy if exists "public can view portfolio photos" on storage.objects;
drop policy if exists "owner can upload portfolio photos" on storage.objects;
drop policy if exists "owner can delete portfolio photos" on storage.objects;
create policy "public can view portfolio photos" on storage.objects for select using (bucket_id = 'portfolio-media');
create policy "owner can upload portfolio photos" on storage.objects for insert to authenticated with check (bucket_id = 'portfolio-media' and public.is_portfolio_admin());
create policy "owner can delete portfolio photos" on storage.objects for delete to authenticated using (bucket_id = 'portfolio-media' and public.is_portfolio_admin());
