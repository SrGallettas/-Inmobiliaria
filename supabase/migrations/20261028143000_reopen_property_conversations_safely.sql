alter table public.conversations
  add column if not exists closed_reason text
  check (closed_reason is null or closed_reason in ('property_unavailable', 'manual'));

update public.conversations
set closed_reason = 'property_unavailable'
where status = 'closed'
  and property_status in ('sold', 'removed')
  and closed_reason is null;

create or replace function public.sync_conversation_property_status()
returns trigger
language plpgsql
security definer
set search_path = ''
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
        when new.listing_status in ('available', 'reserved')
          and closed_reason = 'property_unavailable' then 'open'
        else status
      end,
      closed_reason = case
        when new.listing_status in ('sold', 'removed')
          and closed_reason is null then 'property_unavailable'
        when new.listing_status in ('available', 'reserved')
          and closed_reason = 'property_unavailable' then null
        else closed_reason
      end,
      updated_at = now()
  where property_id = new.id;
  return new;
end;
$$;
