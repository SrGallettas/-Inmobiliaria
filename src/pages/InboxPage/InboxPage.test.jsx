import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { MemoryRouter } from 'react-router'
import InboxPage from './InboxPage'

const mocks = vi.hoisted(() => ({
  getInbox: vi.fn(),
  subscribeToInbox: vi.fn(),
}))

vi.mock('../../services/chatService', () => mocks)

const inboxItem = {
  id: 7,
  property_id: 1,
  property_title: 'Villa Serena',
  property_location: 'Jávea, Alicante',
  property_image: '/villa.jpg',
  property_price: 1850000,
  property_operation: 'comprar',
  property_status: 'available',
  updated_at: '2026-10-28T10:00:00Z',
  latestMessage: { content: 'Tenemos disponibilidad mañana.', created_at: '2026-10-28T10:05:00Z' },
  unreadCount: 2,
}

function renderPage() {
  return render(<MemoryRouter><InboxPage /></MemoryRouter>)
}

describe('InboxPage', () => {
  let onRealtimeChange
  let onRealtimeStatus
  let unsubscribe

  beforeEach(() => {
    vi.clearAllMocks()
    unsubscribe = vi.fn()
    mocks.getInbox.mockResolvedValue([inboxItem])
    mocks.subscribeToInbox.mockImplementation((onChange, onStatus) => {
      onRealtimeChange = onChange
      onRealtimeStatus = onStatus
      onStatus('live')
      return unsubscribe
    })
  })

  test('muestra el último mensaje y el número de pendientes', async () => {
    renderPage()

    expect(await screen.findByRole('heading', { name: 'Villa Serena' })).toBeInTheDocument()
    expect(screen.getByText('Tenemos disponibilidad mañana.')).toBeInTheDocument()
    expect(screen.getByText('2')).toHaveClass('unread-count')
    expect(screen.getByRole('link', { name: /Villa Serena/ })).toHaveAttribute('href', '/mensajes/1')
  })

  test('recarga el resumen cuando llega un cambio de Realtime', async () => {
    renderPage()
    await screen.findByRole('heading', { name: 'Villa Serena' })
    mocks.getInbox.mockResolvedValue([{ ...inboxItem, latestMessage: { content: 'Nuevo mensaje', created_at: '2026-10-28T10:10:00Z' }, unreadCount: 3 }])

    await act(() => onRealtimeChange())

    expect(await screen.findByText('Nuevo mensaje')).toBeInTheDocument()
    expect(screen.getByText('3')).toHaveClass('unread-count')
  })

  test('avisa de la desconexión y reconstruye la suscripción', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByRole('heading', { name: 'Villa Serena' })

    act(() => onRealtimeStatus('offline'))
    expect(screen.getByRole('alert')).toHaveTextContent('Sin conexión en directo')
    await user.click(screen.getByRole('button', { name: 'Reintentar' }))

    await waitFor(() => expect(mocks.subscribeToInbox).toHaveBeenCalledTimes(2))
    expect(unsubscribe).toHaveBeenCalled()
    await waitFor(() => expect(screen.queryByText(/Sin conexión en directo/)).not.toBeInTheDocument())
  })

  test('muestra el estado vacío', async () => {
    mocks.getInbox.mockResolvedValue([])
    renderPage()

    expect(await screen.findByRole('heading', { name: 'Todavía no tienes conversaciones' })).toBeInTheDocument()
  })

  test('muestra un error si no puede cargar la bandeja', async () => {
    mocks.getInbox.mockRejectedValue(new Error('No se pudo cargar la bandeja'))
    renderPage()

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo cargar la bandeja')
  })
})
