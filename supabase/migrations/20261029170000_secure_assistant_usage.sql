create table if not exists public.assistant_rate_limits (
  identifier_hash text not null,
  window_start timestamptz not null,
  request_count integer not null default 1 check (request_count > 0),
  primary key (identifier_hash, window_start)
);

create table if not exists public.assistant_usage_events (
  id bigint generated always as identity primary key,
  outcome text not null check (outcome in ('success', 'provider_error', 'timeout', 'invalid_request', 'rate_limited')),
  model text not null check (char_length(model) between 1 and 100),
  duration_ms integer not null check (duration_ms >= 0),
  used_retry boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.assistant_rate_limits enable row level security;
alter table public.assistant_usage_events enable row level security;
revoke all on public.assistant_rate_limits, public.assistant_usage_events from anon, authenticated;

create or replace function public.consume_assistant_rate_limit(
  p_identifier_hash text,
  p_limit integer default 10,
  p_window_seconds integer default 60
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_window timestamptz;
  current_count integer;
begin
  if p_identifier_hash is null or char_length(p_identifier_hash) <> 64
    or p_limit < 1 or p_window_seconds < 1 then
    raise exception 'invalid rate-limit arguments';
  end if;

  current_window := to_timestamp(
    floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds
  );

  insert into public.assistant_rate_limits (identifier_hash, window_start, request_count)
  values (p_identifier_hash, current_window, 1)
  on conflict (identifier_hash, window_start)
  do update set request_count = public.assistant_rate_limits.request_count + 1
  returning request_count into current_count;

  return current_count <= p_limit;
end;
$$;

revoke all on function public.consume_assistant_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_assistant_rate_limit(text, integer, integer) to service_role;

create index if not exists assistant_usage_events_created_at_idx
  on public.assistant_usage_events (created_at desc);

-- Evita que las tablas crezcan sin límite. Puede ejecutarse periódicamente.
create or replace function public.clean_old_assistant_telemetry()
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.assistant_rate_limits where window_start < now() - interval '1 day';
  delete from public.assistant_usage_events where created_at < now() - interval '90 days';
$$;

revoke all on function public.clean_old_assistant_telemetry() from public, anon, authenticated;
grant execute on function public.clean_old_assistant_telemetry() to service_role;
