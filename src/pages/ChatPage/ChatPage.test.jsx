import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router'
import { AuthContext } from '../../auth/useAuth'
import ChatPage from './ChatPage'

const mocks = vi.hoisted(() => ({
  getMessages: vi.fn(),
  getOrCreateConversation: vi.fn(),
  markConversationRead: vi.fn(),
  sendMessage: vi.fn(),
  sendMessageWithMedia: vi.fn(),
  subscribeToMessages: vi.fn(),
  validateChatMedia: vi.fn(),
}))

vi.mock('../../services/chatService', () => mocks)

const property = {
  id: 1,
  title: 'Villa Serena',
  location: 'Jávea, Alicante',
  price: 1850000,
  operation: 'comprar',
  image: '/villa.jpg',
  listingStatus: 'available',
}

const conversation = {
  id: 7,
  property_id: 1,
  user_id: 'user-1',
  property_status: 'available',
  status: 'open',
}

const message = {
  id: 11,
  conversation_id: 7,
  sender_id: 'user-1',
  content: 'Hola, me interesa esta vivienda.',
  created_at: '2026-10-28T10:00:00Z',
  attachments: [],
}

function renderPage() {
  return render(
    <AuthContext.Provider value={{ user: { id: 'user-1' } }}>
      <MemoryRouter initialEntries={['/mensajes/1']}>
        <Routes><Route path="/mensajes/:propertyId" element={<ChatPage properties={[property]} />} /></Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

describe('ChatPage', () => {
  let onRealtimeChange
  let onRealtimeStatus
  let unsubscribe

  beforeEach(() => {
    vi.clearAllMocks()
    unsubscribe = vi.fn()
    mocks.getOrCreateConversation.mockResolvedValue(conversation)
    mocks.getMessages.mockResolvedValue([message])
    mocks.markConversationRead.mockResolvedValue(undefined)
    mocks.sendMessage.mockResolvedValue({ id: 12 })
    mocks.sendMessageWithMedia.mockResolvedValue({ message: { id: 12 } })
    mocks.validateChatMedia.mockReset()
    mocks.subscribeToMessages.mockImplementation((_id, onChange, onStatus) => {
      onRealtimeChange = onChange
      onRealtimeStatus = onStatus
      onStatus('live')
      return unsubscribe
    })
  })

  test('abre el historial y marca la conversación como leída', async () => {
    renderPage()

    expect(await screen.findByText(message.content)).toBeInTheDocument()
    expect(screen.getByText('En directo')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Mensaje' })).toBeEnabled()
    expect(mocks.getOrCreateConversation).toHaveBeenCalledWith(1)
    expect(mocks.markConversationRead).toHaveBeenCalledWith(7)
  })

  test('envía texto y limpia el campo al terminar', async () => {
    const user = userEvent.setup()
    renderPage()
    const textbox = await screen.findByRole('textbox', { name: 'Mensaje' })

    await user.type(textbox, '¿Podemos visitarla mañana?')
    await user.click(screen.getByRole('button', { name: 'Enviar' }))

    await waitFor(() => expect(mocks.sendMessage).toHaveBeenCalledWith(7, 'user-1', '¿Podemos visitarla mañana?'))
    expect(textbox).toHaveValue('')
  })

  test('valida y envía una fotografía mediante el flujo seguro', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByRole('textbox', { name: 'Mensaje' })
    const file = new File(['imagen'], 'salon.jpg', { type: 'image/jpeg' })

    await user.upload(screen.getByLabelText(/Foto o vídeo/), file)
    expect(screen.getByText('salon.jpg')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Enviar' }))

    await waitFor(() => expect(mocks.sendMessageWithMedia).toHaveBeenCalledWith(7, 'user-1', '', file))
  })

  test('rechaza un archivo inválido antes de intentar enviarlo', async () => {
    const user = userEvent.setup({ applyAccept: false })
    mocks.validateChatMedia.mockImplementation(() => { throw new Error('El archivo debe ser una imagen o un vídeo permitido.') })
    renderPage()
    await screen.findByRole('textbox', { name: 'Mensaje' })

    await user.upload(screen.getByLabelText(/Foto o vídeo/), new File(['pdf'], 'documento.pdf', { type: 'application/pdf' }))

    expect(screen.getByRole('alert')).toHaveTextContent('imagen o un vídeo permitido')
    expect(screen.queryByText('documento.pdf')).not.toBeInTheDocument()
    expect(mocks.sendMessageWithMedia).not.toHaveBeenCalled()
  })

  test('cierra y reabre el formulario cuando cambia el estado de la vivienda', async () => {
    renderPage()
    await screen.findByRole('textbox', { name: 'Mensaje' })

    await act(() => onRealtimeChange({ table: 'conversations', new: { ...conversation, status: 'closed', property_status: 'sold' } }))
    expect(screen.getByText('Vivienda vendida')).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: 'Mensaje' })).not.toBeInTheDocument()

    await act(() => onRealtimeChange({ table: 'conversations', new: { ...conversation, status: 'open', property_status: 'available' } }))
    expect(await screen.findByRole('textbox', { name: 'Mensaje' })).toBeEnabled()
    expect(screen.queryByText('Vivienda vendida')).not.toBeInTheDocument()
  })

  test('informa de la desconexión y reconstruye el canal al reintentar', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText(message.content)

    act(() => onRealtimeStatus('error'))
    expect(screen.getByRole('alert')).toHaveTextContent('conexión en directo se ha interrumpido')
    expect(screen.getByText('Sin conexión')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Reintentar' }))
    await waitFor(() => expect(mocks.subscribeToMessages).toHaveBeenCalledTimes(2))
    expect(unsubscribe).toHaveBeenCalled()
    expect(await screen.findByText('En directo')).toBeInTheDocument()
  })

  test('muestra el error inicial y no presenta un formulario inutilizable', async () => {
    mocks.getOrCreateConversation.mockRejectedValue(new Error('Supabase no disponible'))
    renderPage()

    expect(await screen.findByText('Supabase no disponible')).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: 'Mensaje' })).not.toBeInTheDocument()
  })
})
