alter table public.properties
  add column if not exists listing_status text not null default 'available'
  check (listing_status in ('available', 'reserved', 'sold', 'removed'));

alter table public.conversations
  add column if not exists property_title text,
  add column if not exists property_location text,
  add column if not exists property_image text,
  add column if not exists property_price integer,
  add column if not exists property_operation text,
  add column if not exists property_status text not null default 'available'
  check (property_status in ('available', 'reserved', 'sold', 'removed'));

update public.conversations as conversation
set property_title = property.title,
    property_location = property.location,
    property_image = property.image,
    property_price = property.price,
    property_operation = property.operation,
    property_status = property.listing_status
from public.properties as property
where property.id = conversation.property_id
  and conversation.property_title is null;

alter table public.conversations
  alter column property_title set not null,
  alter column property_location set not null,
  alter column property_image set not null,
  alter column property_price set not null,
  alter column property_operation set not null,
  alter column property_id drop not null;

alter table public.conversations drop constraint if exists conversations_property_id_fkey;
alter table public.conversations add constraint conversations_property_id_fkey
foreign key (property_id) references public.properties(id) on delete set null;

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
      updated_at = now()
  where property_id = new.id;
  return new;
end;
$$;

drop trigger if exists on_property_status_changed on public.properties;
create trigger on_property_status_changed
after update of listing_status, title, location, image, price, operation on public.properties
for each row execute procedure public.sync_conversation_property_status();

create or replace function public.mark_conversation_read(target_conversation_id bigint)
returns void
language plpgsql
security definer set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.conversations
    where id = target_conversation_id and user_id = auth.uid()
  ) then
    raise exception 'Conversation not found';
  end if;
  update public.messages
  set read_at = now()
  where conversation_id = target_conversation_id
    and sender_id <> auth.uid()
    and read_at is null;
end;
$$;

grant execute on function public.mark_conversation_read(bigint) to authenticated;
