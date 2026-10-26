import { supabase } from '../lib/supabase'

function requireClient(client) {
  if (!client) throw new Error('La autenticación no está conectada a Supabase.')
  return client
}

export function getAuthErrorMessage(error, fallback = 'No hemos podido completar la operación.') {
  if (error?.code === 'over_email_send_rate_limit' || error?.status === 429) return 'Has alcanzado el límite temporal de correos. Espera una hora o configura un servidor SMTP propio.'
  if (error?.code === 'email_address_not_authorized') return 'El correo de prueba de Supabase solo puede escribir a miembros del proyecto. Añade este correo al equipo o configura SMTP propio.'
  if (error?.code === 'email_address_invalid') return 'La dirección de correo no es válida para el servicio de envío.'
  if (error?.code === 'email_provider_disabled') return 'El envío por correo está desactivado en Supabase.'
  return fallback
}

export async function getSession(client = supabase) {
  const { data, error } = await requireClient(client).auth.getSession()
  if (error) throw error
  return data.session
}

export async function signUp({ name, email, password }, client = supabase) {
  const { data, error } = await requireClient(client).auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      data: { full_name: name.trim() },
      emailRedirectTo: `${window.location.origin}/entrar?confirmado=1`,
    },
  })
  if (error) throw error
  return data
}

export async function signIn({ email, password }, client = supabase) {
  const { data, error } = await requireClient(client).auth.signInWithPassword({ email: email.trim().toLowerCase(), password })
  if (error) throw error
  return data
}

export async function signOut(client = supabase) {
  const { error } = await requireClient(client).auth.signOut()
  if (error) throw error
}

export async function requestPasswordReset(email, client = supabase) {
  const redirectTo = `${window.location.origin}/restablecer-contrasena`
  const { error } = await requireClient(client).auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo })
  if (error) throw error
}

export async function updatePassword(password, client = supabase) {
  const { error } = await requireClient(client).auth.updateUser({ password })
  if (error) throw error
}

export function subscribeToAuthChanges(callback, client = supabase) {
  if (!client) return () => {}
  const { data } = client.auth.onAuthStateChange((_event, session) => callback(session))
  return () => data.subscription.unsubscribe()
}
