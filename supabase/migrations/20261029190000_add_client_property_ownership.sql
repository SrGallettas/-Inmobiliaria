alter table public.properties
  add column if not exists owner_id uuid references public.profiles(id) on delete set null;

create index if not exists properties_owner_id_idx on public.properties (owner_id);

grant insert, update, delete on public.properties to authenticated;
grant usage, select on sequence public.properties_id_seq to authenticated;

drop policy if exists "Los clientes publican viviendas" on public.properties;
create policy "Los clientes publican viviendas"
on public.properties for insert to authenticated
with check (owner_id = (select auth.uid()));

drop policy if exists "Los clientes editan sus viviendas" on public.properties;
create policy "Los clientes editan sus viviendas"
on public.properties for update to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

drop policy if exists "Los clientes eliminan sus viviendas" on public.properties;
create policy "Los clientes eliminan sus viviendas"
on public.properties for delete to authenticated
using (owner_id = (select auth.uid()));

