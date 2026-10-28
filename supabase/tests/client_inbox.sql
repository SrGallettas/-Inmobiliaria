-- Ejecutar en una base de datos local o de pruebas después de aplicar las migraciones.
-- Comprueba resumen, pendientes y aislamiento de la bandeja optimizada.
begin;

create extension if not exists pgtap with schema extensions;
select plan(1);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
) values
  ('00000000-0000-0000-0000-000000000000', '50000000-0000-0000-0000-000000000005', 'authenticated', 'authenticated', 'inbox-client-test@example.com', '', now(), '{}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '60000000-0000-0000-0000-000000000006', 'authenticated', 'authenticated', 'inbox-other-test@example.com', '', now(), '{}', '{}', now(), now());

insert into public.conversations (
  id, property_id, user_id, property_title, property_location,
  property_image, property_price, property_operation, property_status
) values
  (900005, 1, '50000000-0000-0000-0000-000000000005', 'Conversación con mensajes', 'Alicante', 'one.jpg', 100, 'comprar', 'available'),
  (900006, 2, '50000000-0000-0000-0000-000000000005', 'Conversación vacía', 'Madrid', 'two.jpg', 200, 'comprar', 'available'),
  (900007, 3, '60000000-0000-0000-0000-000000000006', 'Conversación ajena', 'Girona', 'three.jpg', 300, 'comprar', 'available');

insert into public.messages (
  id, conversation_id, sender_id, content, read_at, created_at
) values
  (900005, 900005, '50000000-0000-0000-0000-000000000005', 'Primer mensaje', null, '2026-10-28 10:00:00+00'),
  (900006, 900005, '60000000-0000-0000-0000-000000000006', 'Respuesta ya leída', '2026-10-28 10:06:00+00', '2026-10-28 10:05:00+00'),
  (900007, 900005, '60000000-0000-0000-0000-000000000006', 'Última respuesta pendiente', null, '2026-10-28 10:10:00+00'),
  (900008, 900007, '60000000-0000-0000-0000-000000000006', 'Mensaje de otra conversación', null, '2026-10-28 10:15:00+00');

set local role authenticated;
select set_config('request.jwt.claim.sub', '50000000-0000-0000-0000-000000000005', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

do $$
begin
  if (select count(*) from public.get_client_inbox()) <> 2 then
    raise exception 'La bandeja no devuelve exactamente las conversaciones del cliente';
  end if;

  if not exists (
    select 1
    from public.get_client_inbox()
    where id = 900005
      and latest_message_id = 900007
      and latest_message_content = 'Última respuesta pendiente'
      and unread_count = 1
  ) then
    raise exception 'El último mensaje o el contador de pendientes es incorrecto';
  end if;

  if not exists (
    select 1
    from public.get_client_inbox()
    where id = 900006
      and latest_message_id is null
      and unread_count = 0
  ) then
    raise exception 'La conversación vacía no se representa correctamente';
  end if;

  if exists (select 1 from public.get_client_inbox() where id = 900007) then
    raise exception 'La bandeja contiene una conversación ajena';
  end if;
end;
$$;

reset role;
select pass('La bandeja devuelve el resumen correcto y solo las conversaciones del cliente');
select * from finish();
rollback;
