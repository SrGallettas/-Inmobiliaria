-- Ejecutar en una base de datos local o de pruebas después de aplicar las migraciones.
-- Verifica que una pestaña desactualizada no pueda escribir después de una venta.
begin;

create extension if not exists pgtap with schema extensions;
select plan(1);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
) values (
  '00000000-0000-0000-0000-000000000000',
  '30000000-0000-0000-0000-000000000003',
  'authenticated', 'authenticated', 'sold-chat-test@example.com', '',
  now(), '{}', '{}', now(), now()
);

insert into public.conversations (
  id, property_id, user_id, property_title, property_location,
  property_image, property_price, property_operation, property_status
) values (
  900003, 1, '30000000-0000-0000-0000-000000000003',
  'Vivienda de prueba', 'Alicante', 'test.jpg', 100, 'comprar', 'available'
);

update public.properties set listing_status = 'sold' where id = 1;

set local role authenticated;
select set_config('request.jwt.claim.sub', '30000000-0000-0000-0000-000000000003', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

do $$
begin
  if not exists (
    select 1 from public.conversations
    where id = 900003 and status = 'closed' and property_status = 'sold'
  ) then
    raise exception 'La venta no ha cerrado la conversación';
  end if;

  if public.can_upload_chat_media('30000000-0000-0000-0000-000000000003/900003/foto.jpg') then
    raise exception 'La conversación vendida todavía permite subir archivos';
  end if;

  begin
    insert into public.messages (conversation_id, sender_id, content)
    values (900003, '30000000-0000-0000-0000-000000000003', 'Mensaje posterior a la venta');
    raise exception 'La conversación vendida todavía permite mensajes';
  exception
    when insufficient_privilege or check_violation then
      null;
  end;
end;
$$;

reset role;
select pass('Una propiedad no disponible bloquea mensajes y adjuntos incluso desde pestañas antiguas');
select * from finish();
rollback;
