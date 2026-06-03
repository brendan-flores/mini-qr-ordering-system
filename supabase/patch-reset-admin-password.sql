-- Run in Supabase SQL Editor if admin login returns 401.
-- Resets password for username `admin` to `admin1245` (bcrypt hash).

create extension if not exists pgcrypto with schema extensions;

insert into public.admin_users (username, password_hash)
values ('admin', extensions.crypt('admin1245', extensions.gen_salt('bf')))
on conflict (username) do update
set password_hash = excluded.password_hash;

-- Should return one row when credentials are correct:
-- select * from public.verify_admin_login('admin', 'admin1245');
