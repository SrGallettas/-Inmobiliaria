-- Ejecutar en una base de datos local o de pruebas después de aplicar las migraciones.
-- Toda la información creada por esta prueba se revierte al terminar.
begin;

create extension if not exists pgtap with schema extensions;
select plan(1);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
) values
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'ana-chat-test@example.com', '', now(), '{}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'carlos-chat-test@example.com', '', now(), '{}', '{}', now(), now());

insert into public.conversations (
  id, property_id, user_id, property_title, property_location,
  property_image, property_price, property_operation, property_status
) values
  (900001, 1, '10000000-0000-0000-0000-000000000001', 'Conversación de Ana', 'Alicante', 'ana.jpg', 100, 'comprar', 'available'),
  (900002, 1, '20000000-0000-0000-0000-000000000002', 'Conversación de Carlos', 'Alicante', 'carlos.jpg', 200, 'comprar', 'available');

insert into public.messages (id, conversation_id, sender_id, content) values
  (900001, 900001, '10000000-0000-0000-0000-000000000001', 'Mensaje privado de Ana'),
  (900002, 900002, '20000000-0000-0000-0000-000000000002', 'Mensaje privado de Carlos');

insert into public.message_attachments (
  id, message_id, uploader_id, storage_path, media_type,
  mime_type, original_name, size_bytes
) values
  (900001, 900001, '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001/900001/ana.jpg', 'image', 'image/jpeg', 'ana.jpg', 100),
  (900002, 900002, '20000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002/900002/carlos.jpg', 'image', 'image/jpeg', 'carlos.jpg', 100);

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

do $$
begin
  if (select count(*) from public.conversations) <> 1 then
    raise exception 'Ana puede ver una conversación que no le pertenece';
  end if;
  if (select count(*) from public.messages) <> 1 then
    raise exception 'Ana puede ver un mensaje que no le pertenece';
  end if;
  if (select count(*) from public.message_attachments) <> 1 then
    raise exception 'Ana puede ver un adjunto que no le pertenece';
  end if;
  if public.can_read_chat_media('20000000-0000-0000-0000-000000000002/900002/carlos.jpg') then
    raise exception 'Ana puede leer el archivo de Carlos';
  end if;
  if public.can_manage_chat_media('10000000-0000-0000-0000-000000000001/900002/falso.jpg') then
    raise exception 'Ana puede subir archivos a la conversación de Carlos';
  end if;
end;
$$;

do $$
begin
  begin
    insert into public.messages (conversation_id, sender_id, content)
    values (900002, '10000000-0000-0000-0000-000000000001', 'Intento de acceso');
    raise exception 'Ana ha podido escribir en la conversación de Carlos';
  exception
    when insufficient_privilege or check_violation then
      null;
  end;
end;
$$;

reset role;
select pass('RLS aísla conversaciones, mensajes y adjuntos entre clientes');
select * from finish();
rollback;
