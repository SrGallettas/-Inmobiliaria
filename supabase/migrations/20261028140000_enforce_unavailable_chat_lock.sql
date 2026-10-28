drop policy if exists "Los clientes escriben en conversaciones disponibles" on public.messages;
drop policy if exists "Los clientes envían sus mensajes" on public.messages;
create policy "Los clientes escriben en conversaciones disponibles"
on public.messages for insert to authenticated
with check (
  sender_id = (select auth.uid())
  and exists (
    select 1
    from public.conversations
    where conversations.id = messages.conversation_id
      and conversations.user_id = (select auth.uid())
      and conversations.status = 'open'
      and conversations.property_status in ('available', 'reserved')
  )
);

drop policy if exists "Los clientes adjuntan archivos a sus mensajes" on public.message_attachments;
create policy "Los clientes adjuntan archivos en conversaciones disponibles"
on public.message_attachments for insert to authenticated
with check (
  uploader_id = (select auth.uid())
  and exists (
    select 1
    from public.messages
    join public.conversations
      on conversations.id = messages.conversation_id
    where messages.id = message_attachments.message_id
      and messages.sender_id = (select auth.uid())
      and conversations.user_id = (select auth.uid())
      and conversations.status = 'open'
      and conversations.property_status in ('available', 'reserved')
  )
);

create or replace function public.can_upload_chat_media(object_name text)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  path_parts text[] := storage.foldername(object_name);
  target_conversation_id bigint;
begin
  if current_user_id is null or path_parts[1] is distinct from current_user_id::text then
    return false;
  end if;

  begin
    target_conversation_id := path_parts[2]::bigint;
  exception
    when invalid_text_representation or numeric_value_out_of_range then
      return false;
  end;

  return exists (
    select 1
    from public.conversations
    where id = target_conversation_id
      and user_id = current_user_id
      and status = 'open'
      and property_status in ('available', 'reserved')
  );
end;
$$;

revoke all on function public.can_upload_chat_media(text) from public;
grant execute on function public.can_upload_chat_media(text) to authenticated;

drop policy if exists "Los clientes suben archivos de sus conversaciones" on storage.objects;
create policy "Los clientes suben archivos a conversaciones disponibles"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'chat-media'
  and public.can_upload_chat_media(name)
);
