update public.conversations
set status = 'closed', updated_at = now()
where property_status in ('sold', 'removed')
  and status <> 'closed';

drop policy if exists "Los clientes crean sus conversaciones" on public.conversations;
create policy "Los clientes crean conversaciones disponibles"
on public.conversations for insert to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.properties
    where properties.id = conversations.property_id
      and properties.listing_status in ('available', 'reserved')
  )
);

drop policy if exists "Los clientes envían sus mensajes" on public.messages;
create policy "Los clientes escriben en conversaciones disponibles"
on public.messages for insert to authenticated
with check (
  sender_id = (select auth.uid())
  and exists (
    select 1 from public.conversations
    where conversations.id = messages.conversation_id
      and conversations.user_id = (select auth.uid())
      and conversations.status = 'open'
      and conversations.property_status in ('available', 'reserved')
  )
);

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
        else status
      end,
      updated_at = now()
  where property_id = new.id;
  return new;
end;
$$;
