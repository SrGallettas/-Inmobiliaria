create or replace function public.can_manage_chat_media(object_name text)
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
  );
end;
$$;

create or replace function public.can_read_chat_media(object_name text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.message_attachments
    join public.messages
      on messages.id = message_attachments.message_id
    join public.conversations
      on conversations.id = messages.conversation_id
    where message_attachments.storage_path = object_name
      and conversations.user_id = auth.uid()
  );
$$;

revoke all on function public.can_manage_chat_media(text) from public;
revoke all on function public.can_read_chat_media(text) from public;
grant execute on function public.can_manage_chat_media(text) to authenticated;
grant execute on function public.can_read_chat_media(text) to authenticated;

drop policy if exists "Los clientes suben archivos de chat" on storage.objects;
create policy "Los clientes suben archivos de sus conversaciones"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'chat-media'
  and public.can_manage_chat_media(name)
);

drop policy if exists "Los clientes consultan sus archivos de chat" on storage.objects;
create policy "Los clientes consultan archivos vinculados a sus mensajes"
on storage.objects for select to authenticated
using (
  bucket_id = 'chat-media'
  and public.can_read_chat_media(name)
);

drop policy if exists "Los clientes eliminan sus archivos de chat" on storage.objects;
create policy "Los clientes eliminan archivos de sus conversaciones"
on storage.objects for delete to authenticated
using (
  bucket_id = 'chat-media'
  and owner_id = (select auth.uid()::text)
  and public.can_manage_chat_media(name)
);
