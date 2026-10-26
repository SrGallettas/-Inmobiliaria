drop policy if exists "Cada usuario consulta su avatar" on storage.objects;

create policy "Cada usuario consulta su avatar"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);
