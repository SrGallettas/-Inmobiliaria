import { supabase } from '../lib/supabase'

function requireClient(client) {
  if (!client) throw new Error('El chat no está conectado a Supabase.')
  return client
}

function chatWriteError(error, fallback) {
  const details = `${error?.code || ''} ${error?.message || ''}`.toLowerCase()
  if (details.includes('42501') || details.includes('row-level security') || details.includes('conversation is closed')) {
    return new Error('La conversación ya no admite mensajes porque la propiedad no está disponible. Actualiza el chat para ver su estado.')
  }
  return new Error(`${fallback}: ${error?.message || 'Error desconocido'}`)
}

export async function getOrCreateConversation(propertyId, client = supabase) {
  const { data, error } = await requireClient(client).rpc('get_or_create_conversation', { target_property_id: propertyId })
  if (error) throw new Error(`No se pudo abrir la conversación: ${error.message}`)
  return data
}

export async function getInbox(client = supabase) {
  const { data, error } = await requireClient(client).rpc('get_client_inbox')
  if (error) throw new Error(`No se pudo cargar la bandeja: ${error.message}`)
  return data.map(({ latest_message_id: latestId, latest_message_content: latestContent, latest_message_sender_id: latestSenderId, latest_message_read_at: latestReadAt, latest_message_created_at: latestCreatedAt, unread_count: unreadCount, ...conversation }) => ({
    ...conversation,
    latestMessage: latestId ? { id: latestId, content: latestContent, sender_id: latestSenderId, read_at: latestReadAt, created_at: latestCreatedAt } : null,
    unreadCount: Number(unreadCount || 0),
  }))
}

export async function markConversationRead(conversationId, client = supabase) {
  const { error } = await requireClient(client).rpc('mark_conversation_read', { target_conversation_id: conversationId })
  if (error) throw new Error(`No se pudo marcar la conversación: ${error.message}`)
}

export function normalizeRealtimeStatus(status) {
  if (status === 'SUBSCRIBED') return 'live'
  if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') return 'error'
  if (status === 'CLOSED') return 'offline'
  return 'connecting'
}

export function subscribeToMessages(conversationId, onChange, onStatus = () => {}, client = supabase) {
  const database = requireClient(client)
  const channel = database.channel(`conversation:${conversationId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'message_attachments' }, onChange)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'conversations', filter: `id=eq.${conversationId}` }, onChange)
    .subscribe((status) => onStatus(normalizeRealtimeStatus(status)))
  return () => database.removeChannel(channel)
}

export function subscribeToInbox(onChange, onStatus = () => {}, client = supabase) {
  const database = requireClient(client)
  const channel = database.channel('client-inbox')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, onChange)
    .subscribe((status) => onStatus(normalizeRealtimeStatus(status)))
  return () => database.removeChannel(channel)
}

export async function getMessages(conversationId, client = supabase) {
  const database = requireClient(client)
  const { data, error } = await database.from('messages').select('id, conversation_id, sender_id, content, read_at, created_at, attachments:message_attachments(id, storage_path, media_type, mime_type, original_name, size_bytes)').eq('conversation_id', conversationId).order('created_at', { ascending: true })
  if (error) throw new Error(`No se pudieron cargar los mensajes: ${error.message}`)
  return Promise.all(data.map(async (message) => ({ ...message, attachments: await Promise.all((message.attachments || []).map(async (attachment) => ({ ...attachment, url: await getAttachmentUrl(attachment.storage_path, 3600, database) }))) })))
}

export async function sendMessage(conversationId, userId, content, client = supabase) {
  const message = content.trim()
  if (!message || message.length > 2000) throw new Error('El mensaje debe tener entre 1 y 2000 caracteres.')
  const { data, error } = await requireClient(client).from('messages').insert({ conversation_id: conversationId, sender_id: userId, content: message }).select('id, conversation_id, sender_id, content, read_at, created_at').single()
  if (error) throw chatWriteError(error, 'No se pudo enviar el mensaje')
  return data
}

export function validateChatMedia(file) {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime']
  if (!allowed.includes(file?.type)) throw new Error('El archivo debe ser una imagen JPG, PNG o WebP, o un vídeo MP4, WebM o MOV.')
  if (!file.size) throw new Error('El archivo está vacío.')
  if (file.size > 50 * 1024 * 1024) throw new Error('El archivo no puede superar los 50 MB.')
}

export async function uploadChatMedia(userId, conversationId, file, client = supabase) {
  validateChatMedia(file)
  const extension = file.name.split('.').pop()?.toLowerCase() || 'file'
  const path = `${userId}/${conversationId}/${crypto.randomUUID()}.${extension}`
  const { error } = await requireClient(client).storage.from('chat-media').upload(path, file, { contentType: file.type, upsert: false })
  if (error) throw chatWriteError(error, 'No se pudo subir el archivo')
  return { path, mediaType: file.type.startsWith('video/') ? 'video' : 'image', mimeType: file.type, originalName: file.name, sizeBytes: file.size }
}

export async function removeChatMedia(path, client = supabase) {
  const { error } = await requireClient(client).storage.from('chat-media').remove([path])
  if (error) throw new Error(`No se pudo limpiar el archivo: ${error.message}`)
}

export async function sendMessageWithMedia(conversationId, userId, content, file, client = supabase) {
  validateChatMedia(file)
  const message = content.trim() || `Archivo adjunto: ${file.name}`
  if (message.length > 2000) throw new Error('El mensaje debe tener entre 1 y 2000 caracteres.')

  const uploaded = await uploadChatMedia(userId, conversationId, file, client)
  let data
  let sendError
  try {
    const result = await requireClient(client).rpc('send_message_with_attachment', {
      target_conversation_id: conversationId,
      message_content: message,
      attachment_storage_path: uploaded.path,
      attachment_media_type: uploaded.mediaType,
      attachment_mime_type: uploaded.mimeType,
      attachment_original_name: uploaded.originalName,
      attachment_size_bytes: uploaded.sizeBytes,
    })
    data = result.data
    sendError = result.error
  } catch (error) {
    sendError = error
  }

  if (!sendError) return data

  try {
    await removeChatMedia(uploaded.path, client)
  } catch (cleanupError) {
    throw new Error(`No se pudo enviar el archivo (${sendError.message}) ni eliminar la subida incompleta (${cleanupError.message}).`)
  }
  throw chatWriteError(sendError, 'No se pudo enviar el archivo')
}

export async function attachMedia(messageId, userId, fileData, client = supabase) {
  const { data, error } = await requireClient(client).from('message_attachments').insert({ message_id: messageId, uploader_id: userId, storage_path: fileData.path, media_type: fileData.mediaType, mime_type: fileData.mimeType, original_name: fileData.originalName, size_bytes: fileData.sizeBytes }).select('id, message_id, storage_path, media_type, mime_type, original_name, size_bytes').single()
  if (error) throw new Error(`No se pudo adjuntar el archivo: ${error.message}`)
  return data
}

export async function getAttachmentUrl(path, expiresIn = 3600, client = supabase) {
  const { data, error } = await requireClient(client).storage.from('chat-media').createSignedUrl(path, expiresIn)
  if (error) throw new Error(`No se pudo abrir el archivo: ${error.message}`)
  return data.signedUrl
}
