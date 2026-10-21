import { supabase } from '../lib/supabase'

async function insertRequest(table, request, client) {
  if (!client) throw new Error('El formulario no está conectado a Supabase.')

  const { error } = await client.from(table).insert(request)
  if (error) throw new Error(`No se pudo enviar la solicitud: ${error.message}`)
}

export function createContactRequest(form, client = supabase) {
  return insertRequest('contact_requests', {
    name: form.name.trim(),
    email: form.email.trim().toLowerCase(),
    reason: form.reason,
    message: form.message.trim(),
  }, client)
}

export function createVisitRequest(property, form, client = supabase) {
  return insertRequest('visit_requests', {
    property_id: property.id,
    property_title: property.title,
    name: form.name.trim(),
    email: form.email.trim().toLowerCase(),
    phone: form.phone.trim(),
    preferred_date: form.date,
    message: form.message.trim() || null,
  }, client)
}
