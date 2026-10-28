create index if not exists messages_unread_conversation_sender_idx
on public.messages (conversation_id, sender_id)
where read_at is null;

create index if not exists messages_inbox_latest_idx
on public.messages (conversation_id, created_at desc, id desc)
include (content, sender_id, read_at);

create or replace function public.get_client_inbox()
returns table (
  id bigint,
  property_id bigint,
  user_id uuid,
  status text,
  created_at timestamptz,
  updated_at timestamptz,
  property_title text,
  property_location text,
  property_image text,
  property_price integer,
  property_operation text,
  property_status text,
  closed_reason text,
  latest_message_id bigint,
  latest_message_content text,
  latest_message_sender_id uuid,
  latest_message_read_at timestamptz,
  latest_message_created_at timestamptz,
  unread_count bigint
)
language sql
stable
set search_path = ''
as $$
  select
    conversation.id,
    conversation.property_id,
    conversation.user_id,
    conversation.status,
    conversation.created_at,
    conversation.updated_at,
    conversation.property_title,
    conversation.property_location,
    conversation.property_image,
    conversation.property_price,
    conversation.property_operation,
    conversation.property_status,
    conversation.closed_reason,
    latest.id,
    latest.content,
    latest.sender_id,
    latest.read_at,
    latest.created_at,
    coalesce(unread.total, 0)
  from public.conversations as conversation
  left join lateral (
    select message.id, message.content, message.sender_id, message.read_at, message.created_at
    from public.messages as message
    where message.conversation_id = conversation.id
    order by message.created_at desc, message.id desc
    limit 1
  ) as latest on true
  left join lateral (
    select count(*) as total
    from public.messages as message
    where message.conversation_id = conversation.id
      and message.sender_id <> auth.uid()
      and message.read_at is null
  ) as unread on true
  where conversation.user_id = auth.uid()
  order by conversation.updated_at desc, conversation.id desc;
$$;

revoke all on function public.get_client_inbox() from public;
grant execute on function public.get_client_inbox() to authenticated;
