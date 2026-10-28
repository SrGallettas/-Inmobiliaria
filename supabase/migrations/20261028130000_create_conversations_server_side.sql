drop policy if exists "Los clientes crean conversaciones disponibles" on public.conversations;
drop policy if exists "Los clientes crean sus conversaciones" on public.conversations;
revoke insert on table public.conversations from authenticated;

create or replace function public.get_or_create_conversation(target_property_id bigint)
returns public.conversations
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  existing_conversation public.conversations;
  selected_property public.properties;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  select * into existing_conversation
  from public.conversations
  where property_id = target_property_id
    and user_id = current_user_id;

  if found then
    return existing_conversation;
  end if;

  select * into selected_property
  from public.properties
  where id = target_property_id
    and listing_status in ('available', 'reserved');

  if not found then
    raise exception 'Esta propiedad no admite conversaciones nuevas';
  end if;

  begin
    insert into public.conversations (
      property_id,
      user_id,
      property_title,
      property_location,
      property_image,
      property_price,
      property_operation,
      property_status
    ) values (
      selected_property.id,
      current_user_id,
      selected_property.title,
      selected_property.location,
      selected_property.image,
      selected_property.price,
      selected_property.operation,
      selected_property.listing_status
    )
    returning * into existing_conversation;
  exception
    when unique_violation then
      select * into existing_conversation
      from public.conversations
      where property_id = target_property_id
        and user_id = current_user_id;
  end;

  return existing_conversation;
end;
$$;

revoke all on function public.get_or_create_conversation(bigint) from public;
grant execute on function public.get_or_create_conversation(bigint) to authenticated;
