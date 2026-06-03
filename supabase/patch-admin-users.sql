-- Admin login accounts (run in Supabase → SQL Editor)
-- Enable pgcrypto: Dashboard → Database → Extensions → pgcrypto (if this script errors).
-- Passwords are bcrypt hashes only; verification uses extensions.crypt() in the DB.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  password_hash text not null,
  created_at timestamptz not null default now(),
  constraint admin_users_username_unique unique (username)
);

-- Default admin: username `admin`, password `admin1245` (change in production)
insert into public.admin_users (username, password_hash)
select 'admin', extensions.crypt('admin1245', extensions.gen_salt('bf'))
where not exists (
  select 1 from public.admin_users where username = 'admin'
);

-- Returns matching row only when username + password are correct.
create or replace function public.verify_admin_login(
  p_username text,
  p_password text
)
returns table (id uuid, username text)
language sql
security definer
set search_path = public, extensions
stable
as $$
  select u.id, u.username
  from public.admin_users u
  where u.username = p_username
    and u.password_hash = extensions.crypt(p_password, u.password_hash);
$$;

revoke all on function public.verify_admin_login(text, text) from public;
grant execute on function public.verify_admin_login(text, text) to service_role;
