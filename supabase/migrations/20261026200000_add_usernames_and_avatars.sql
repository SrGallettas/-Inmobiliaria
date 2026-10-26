alter table public.profiles
  add column if not exists username text;

alter table public.profiles
  drop constraint if exists profiles_username_format_check;

alter table public.profiles
  add constraint profiles_username_format_check
  check (username is null or username ~ '^[a-z0-9._]{3,24}$');

create unique index if not exists profiles_username_unique
on public.profiles (lower(username))
where username is not null;

grant update (username) on table public.profiles to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(lower(new.raw_user_meta_data ->> 'username'), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace function public.username_available(candidate text)
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select candidate ~ '^[a-z0-9._]{3,24}$'
    and not exists (
      select 1 from public.profiles where lower(username) = lower(candidate)
    );
$$;

grant execute on function public.username_available(text) to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = true, file_size_limit = 2097152, allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists "Cada usuario sube su avatar" on storage.objects;
create policy "Cada usuario sube su avatar" on storage.objects
for insert to authenticated
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid()::text));

drop policy if exists "Cada usuario actualiza su avatar" on storage.objects;
create policy "Cada usuario actualiza su avatar" on storage.objects
for update to authenticated
using (bucket_id = 'avatars' and owner_id = (select auth.uid()::text))
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid()::text));

drop policy if exists "Cada usuario borra su avatar" on storage.objects;
create policy "Cada usuario borra su avatar" on storage.objects
for delete to authenticated
using (bucket_id = 'avatars' and owner_id = (select auth.uid()::text));
