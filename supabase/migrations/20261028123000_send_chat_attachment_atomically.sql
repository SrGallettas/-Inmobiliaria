create or replace function public.send_message_with_attachment(
  target_conversation_id bigint,
  message_content text,
  attachment_storage_path text,
  attachment_media_type text,
  attachment_mime_type text,
  attachment_original_name text,
  attachment_size_bytes bigint
)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  created_message public.messages;
  created_attachment public.message_attachments;
begin
  if attachment_storage_path not like auth.uid()::text || '/' || target_conversation_id::text || '/%' then
    raise exception 'Invalid attachment path';
  end if;

  insert into public.messages (conversation_id, sender_id, content)
  values (target_conversation_id, auth.uid(), trim(message_content))
  returning * into created_message;

  insert into public.message_attachments (
    message_id, uploader_id, storage_path, media_type, mime_type,
    original_name, size_bytes
  ) values (
    created_message.id, auth.uid(), attachment_storage_path, attachment_media_type,
    attachment_mime_type, attachment_original_name, attachment_size_bytes
  )
  returning * into created_attachment;

  return jsonb_build_object(
    'message', to_jsonb(created_message),
    'attachment', to_jsonb(created_attachment)
  );
end;
$$;

revoke all on function public.send_message_with_attachment(bigint, text, text, text, text, text, bigint) from public;
grant execute on function public.send_message_with_attachment(bigint, text, text, text, text, text, bigint) to authenticated;
