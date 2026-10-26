import { supabase } from '../lib/supabase'

function requireClient(client) {
  if (!client) throw new Error('Los perfiles no están conectados a Supabase.')
  return client
}

function mapProfile(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    username: row.username || '',
    phone: row.phone || '',
    avatarUrl: row.avatar_url || '',
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getProfile(userId, client = supabase) {
  const { data, error } = await requireClient(client).from('profiles').select('id, full_name, username, phone, avatar_url, role, created_at, updated_at').eq('id', userId).single()
  if (error) throw new Error(`No se pudo cargar el perfil: ${error.message}`)
  return mapProfile(data)
}

export async function updateProfile(userId, profile, client = supabase) {
  const changes = {
    full_name: profile.fullName.trim(),
    username: profile.username.trim().toLowerCase(),
    phone: profile.phone.trim() || null,
    avatar_url: profile.avatarUrl?.trim() || null,
    updated_at: new Date().toISOString(),
  }
  const { data, error } = await requireClient(client).from('profiles').update(changes).eq('id', userId).select('id, full_name, username, phone, avatar_url, role, created_at, updated_at').single()
  if (error) throw new Error(`No se pudo actualizar el perfil: ${error.message}`)
  return mapProfile(data)
}

export async function uploadAvatar(userId, file, client = supabase) {
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `${userId}/avatar.${extension}`
  const { error } = await requireClient(client).storage.from('avatars').upload(path, file, { upsert: true, contentType: file.type, cacheControl: '3600' })
  if (error) throw new Error(`No se pudo subir la imagen: ${error.message}`)
  const { data } = client.storage.from('avatars').getPublicUrl(path)
  return `${data.publicUrl}?v=${Date.now()}`
}
