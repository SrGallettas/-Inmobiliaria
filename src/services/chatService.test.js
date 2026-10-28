import { describe, expect, test, vi } from 'vitest'
import { getInbox, getOrCreateConversation, normalizeRealtimeStatus, sendMessage, sendMessageWithMedia, subscribeToInbox, subscribeToMessages, validateChatMedia } from './chatService'

describe('chatService', () => {
  test('abre la conversación usando únicamente el identificador de la propiedad', async () => {
    const conversation = { id: 7, property_id: 2, user_id: 'user-1', status: 'open' }
    const rpc = vi.fn().mockResolvedValue({ data: conversation, error: null })
    const client = { rpc }

    await expect(getOrCreateConversation(2, client)).resolves.toEqual(conversation)
    expect(rpc).toHaveBeenCalledWith('get_or_create_conversation', { target_property_id: 2 })
  })

  test('limpia y envía un mensaje', async () => {
    const single = vi.fn().mockResolvedValue({ data: { id: 1, content: 'Hola' }, error: null })
    const select = vi.fn(() => ({ single }))
    const insert = vi.fn(() => ({ select }))
    const client = { from: vi.fn(() => ({ insert })) }
    await sendMessage(7, 'user-1', '  Hola  ', client)
    expect(insert).toHaveBeenCalledWith({ conversation_id: 7, sender_id: 'user-1', content: 'Hola' })
  })

  test('rechaza mensajes vacíos o demasiado largos', async () => {
    await expect(sendMessage(7, 'user-1', '   ', {})).rejects.toThrow(/1 y 2000/)
    await expect(sendMessage(7, 'user-1', 'a'.repeat(2001), {})).rejects.toThrow(/1 y 2000/)
  })

  test('explica que el chat se ha cerrado si Supabase bloquea el mensaje', async () => {
    const single = vi.fn().mockResolvedValue({ data: null, error: { code: '42501', message: 'new row violates row-level security policy' } })
    const client = { from: vi.fn(() => ({ insert: vi.fn(() => ({ select: vi.fn(() => ({ single })) })) })) }

    await expect(sendMessage(7, 'user-1', '¿Sigue disponible?', client)).rejects.toThrow(/ya no admite mensajes/)
  })

  test('explica que el chat se ha cerrado si Storage bloquea la subida', async () => {
    const upload = vi.fn().mockResolvedValue({ error: { code: '42501', message: 'new row violates row-level security policy' } })
    const client = { storage: { from: vi.fn(() => ({ upload })) } }

    await expect(sendMessageWithMedia(7, 'user-1', '', { name: 'salon.jpg', type: 'image/jpeg', size: 1024 }, client)).rejects.toThrow(/ya no admite mensajes/)
  })

  test('valida el tipo y el tamaño antes de subir un adjunto', () => {
    expect(() => validateChatMedia({ name: 'documento.pdf', type: 'application/pdf', size: 100 })).toThrow(/JPG/)
    expect(() => validateChatMedia({ name: 'vacio.jpg', type: 'image/jpeg', size: 0 })).toThrow(/vacío/)
    expect(() => validateChatMedia({ name: 'video.mp4', type: 'video/mp4', size: 51 * 1024 * 1024 })).toThrow(/50 MB/)
  })

  test('sube el archivo y crea mensaje y adjunto mediante una sola operación', async () => {
    const upload = vi.fn().mockResolvedValue({ error: null })
    const remove = vi.fn()
    const rpc = vi.fn().mockResolvedValue({ data: { message: { id: 4 }, attachment: { id: 8 } }, error: null })
    const client = { storage: { from: vi.fn(() => ({ upload, remove })) }, rpc }
    const file = { name: 'salon.jpg', type: 'image/jpeg', size: 1024 }

    await expect(sendMessageWithMedia(7, 'user-1', '  Mira el salón  ', file, client)).resolves.toEqual({ message: { id: 4 }, attachment: { id: 8 } })
    expect(upload).toHaveBeenCalledOnce()
    expect(rpc).toHaveBeenCalledWith('send_message_with_attachment', expect.objectContaining({
      target_conversation_id: 7,
      message_content: 'Mira el salón',
      attachment_original_name: 'salon.jpg',
    }))
    expect(remove).not.toHaveBeenCalled()
  })

  test('elimina el archivo subido si falla la creación del mensaje con adjunto', async () => {
    const upload = vi.fn().mockResolvedValue({ error: null })
    const remove = vi.fn().mockResolvedValue({ error: null })
    const rpc = vi.fn().mockResolvedValue({ data: null, error: { message: 'database unavailable' } })
    const client = { storage: { from: vi.fn(() => ({ upload, remove })) }, rpc }
    const file = { name: 'salon.jpg', type: 'image/jpeg', size: 1024 }

    await expect(sendMessageWithMedia(7, 'user-1', '', file, client)).rejects.toThrow(/No se pudo enviar/)
    expect(remove).toHaveBeenCalledWith([expect.stringMatching(/^user-1\/7\/.+\.jpg$/)])
  })

  test('también elimina el archivo si la conexión se interrumpe', async () => {
    const upload = vi.fn().mockResolvedValue({ error: null })
    const remove = vi.fn().mockResolvedValue({ error: null })
    const rpc = vi.fn().mockRejectedValue(new Error('network error'))
    const client = { storage: { from: vi.fn(() => ({ upload, remove })) }, rpc }

    await expect(sendMessageWithMedia(7, 'user-1', '', { name: 'salon.jpg', type: 'image/jpeg', size: 1024 }, client)).rejects.toThrow(/network error/)
    expect(remove).toHaveBeenCalledOnce()
  })

  test('no sube ni crea mensajes cuando el archivo no es válido', async () => {
    const upload = vi.fn()
    const rpc = vi.fn()
    const client = { storage: { from: vi.fn(() => ({ upload })) }, rpc }

    await expect(sendMessageWithMedia(7, 'user-1', '', { name: 'virus.exe', type: 'application/octet-stream', size: 200 }, client)).rejects.toThrow(/JPG/)
    expect(upload).not.toHaveBeenCalled()
    expect(rpc).not.toHaveBeenCalled()
  })

  test('se suscribe al chat y libera el canal al salir', () => {
    const subscribe = vi.fn((callback) => { callback('SUBSCRIBED'); return { id: 'channel-1' } })
    const on = vi.fn(function chain() { return this })
    const channel = vi.fn(() => ({ on, subscribe }))
    const removeChannel = vi.fn()
    const client = { channel, removeChannel }
    const onStatus = vi.fn()
    const stop = subscribeToMessages(7, vi.fn(), onStatus, client)

    expect(channel).toHaveBeenCalledWith('conversation:7')
    expect(on).toHaveBeenCalledTimes(3)
    expect(onStatus).toHaveBeenCalledWith('live')
    stop()
    expect(removeChannel).toHaveBeenCalledWith({ id: 'channel-1' })
  })

  test('actualiza la bandeja con mensajes y conversaciones', () => {
    const subscribe = vi.fn((callback) => { callback('CHANNEL_ERROR'); return { id: 'inbox-channel' } })
    const on = vi.fn(function chain() { return this })
    const channel = vi.fn(() => ({ on, subscribe }))
    const removeChannel = vi.fn()
    const client = { channel, removeChannel }
    const onStatus = vi.fn()
    const stop = subscribeToInbox(vi.fn(), onStatus, client)

    expect(channel).toHaveBeenCalledWith('client-inbox')
    expect(on).toHaveBeenCalledTimes(2)
    expect(onStatus).toHaveBeenCalledWith('error')
    stop()
    expect(removeChannel).toHaveBeenCalledWith({ id: 'inbox-channel' })
  })

  test('normaliza todos los estados relevantes de Realtime', () => {
    expect(normalizeRealtimeStatus('SUBSCRIBED')).toBe('live')
    expect(normalizeRealtimeStatus('CHANNEL_ERROR')).toBe('error')
    expect(normalizeRealtimeStatus('TIMED_OUT')).toBe('error')
    expect(normalizeRealtimeStatus('CLOSED')).toBe('offline')
    expect(normalizeRealtimeStatus('JOINING')).toBe('connecting')
  })

  test('carga toda la bandeja con una sola llamada y transforma el resumen', async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: [{
        id: 7,
        property_title: 'Villa Serena',
        latest_message_id: 12,
        latest_message_content: '¿Podemos visitarla?',
        latest_message_sender_id: 'agent-1',
        latest_message_read_at: null,
        latest_message_created_at: '2026-10-28T10:00:00Z',
        unread_count: 3,
      }],
      error: null,
    })

    await expect(getInbox({ rpc })).resolves.toEqual([expect.objectContaining({
      id: 7,
      property_title: 'Villa Serena',
      unreadCount: 3,
      latestMessage: expect.objectContaining({ id: 12, content: '¿Podemos visitarla?' }),
    })])
    expect(rpc).toHaveBeenCalledOnce()
    expect(rpc).toHaveBeenCalledWith('get_client_inbox')
  })

  test('representa una conversación sin mensajes ni pendientes', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: [{ id: 8, latest_message_id: null, unread_count: 0 }], error: null })

    await expect(getInbox({ rpc })).resolves.toEqual([expect.objectContaining({ id: 8, latestMessage: null, unreadCount: 0 })])
  })

  test('muestra el error de Supabase cuando la propiedad no admite conversaciones', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: null, error: { message: 'Esta propiedad no admite conversaciones nuevas' } })

    await expect(getOrCreateConversation(2, { rpc })).rejects.toThrow(/no admite conversaciones/)
  })
})
