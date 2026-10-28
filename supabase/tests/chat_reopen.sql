-- Ejecutar en una base de datos local o de pruebas después de aplicar las migraciones.
-- Comprueba que una conversación se recupera con el mismo historial.
begin;

create extension if not exists pgtap with schema extensions;
select plan(1);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
) values (
  '00000000-0000-0000-0000-000000000000',
  '40000000-0000-0000-0000-000000000004',
  'authenticated', 'authenticated', 'reopen-chat-test@example.com', '',
  now(), '{}', '{}', now(), now()
);

insert into public.conversations (
  id, property_id, user_id, property_title, property_location,
  property_image, property_price, property_operation, property_status
) values (
  900004, 1, '40000000-0000-0000-0000-000000000004',
  'Vivienda de prueba', 'Alicante', 'test.jpg', 100, 'comprar', 'available'
);

insert into public.messages (id, conversation_id, sender_id, content)
values (900004, 900004, '40000000-0000-0000-0000-000000000004', 'Mensaje anterior a la venta');

update public.properties set listing_status = 'sold' where id = 1;

do $$
begin
  if not exists (
    select 1 from public.conversations
    where id = 900004
      and status = 'closed'
      and property_status = 'sold'
      and closed_reason = 'property_unavailable'
  ) then
    raise exception 'La conversación no se cerró con el motivo correcto';
  end if;
end;
$$;

update public.properties set listing_status = 'available' where id = 1;

set local role authenticated;
select set_config('request.jwt.claim.sub', '40000000-0000-0000-0000-000000000004', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

do $$
begin
  if not exists (
    select 1 from public.conversations
    where id = 900004
      and status = 'open'
      and property_status = 'available'
      and closed_reason is null
  ) then
    raise exception 'La conversación no se reabrió';
  end if;

  if (select count(*) from public.messages where conversation_id = 900004) <> 1 then
    raise exception 'El historial anterior no se conservó';
  end if;

  if not public.can_upload_chat_media('40000000-0000-0000-0000-000000000004/900004/nueva.jpg') then
    raise exception 'La conversación reabierta no permite adjuntos';
  end if;

  insert into public.messages (conversation_id, sender_id, content)
  values (900004, '40000000-0000-0000-0000-000000000004', 'Mensaje posterior a la reapertura');

  if (select count(*) from public.messages where conversation_id = 900004) <> 2 then
    raise exception 'No se pudo continuar en el historial existente';
  end if;
end;
$$;

reset role;

update public.conversations
set status = 'closed', closed_reason = 'manual'
where id = 900004;

update public.properties set title = title where id = 1;

set local role authenticated;
select set_config('request.jwt.claim.sub', '40000000-0000-0000-0000-000000000004', true);

do $$
begin
  if not exists (
    select 1 from public.conversations
    where id = 900004 and status = 'closed' and closed_reason = 'manual'
  ) then
    raise exception 'Una conversación cerrada manualmente se ha reabierto por error';
  end if;
end;
$$;

reset role;
select pass('Una conversación cerrada por la propiedad se reabre sin perder el historial');
select * from finish();
rollback;
