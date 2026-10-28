create or replace function public.sync_conversation_property_status()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  update public.conversations
  set property_status = new.listing_status,
      property_title = new.title,
      property_location = new.location,
      property_image = new.image,
      property_price = new.price,
      property_operation = new.operation,
      status = case
        when new.listing_status in ('sold', 'removed') then 'closed'
        when new.listing_status in ('available', 'reserved') then 'open'
        else status
      end,
      updated_at = now()
  where property_id = new.id;
  return new;
end;
$$;

update public.conversations
set status = 'open', updated_at = now()
where property_status in ('available', 'reserved')
  and status = 'closed';

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'properties'
  ) then
    alter publication supabase_realtime add table public.properties;
  end if;
end $$;
