import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'
import VisitForm from './VisitForm'

const property = { id: 1, title: 'Villa Serena' }

describe('VisitForm', () => {
  test('muestra errores cuando se envía vacío', async () => {
    const user = userEvent.setup()
    const submitRequest = vi.fn()
    render(<VisitForm property={property} submitRequest={submitRequest} />)

    await user.click(screen.getByRole('button', { name: 'Solicitar visita' }))

    expect(screen.getByText('Escribe tu nombre completo.')).toBeInTheDocument()
    expect(screen.getByText('Introduce un email válido.')).toBeInTheDocument()
    expect(screen.getByText('Introduce un teléfono válido.')).toBeInTheDocument()
    expect(screen.getByText('Selecciona una fecha futura.')).toBeInTheDocument()
    expect(submitRequest).not.toHaveBeenCalled()
  })

  test('acepta una solicitud válida', async () => {
    const user = userEvent.setup()
    const submitRequest = vi.fn().mockResolvedValue(undefined)
    render(<VisitForm property={property} submitRequest={submitRequest} />)

    await user.type(screen.getByLabelText('Nombre completo'), 'Paula García')
    await user.type(screen.getByLabelText('Email'), 'paula@example.com')
    await user.type(screen.getByLabelText('Teléfono'), '612345678')
    await user.type(screen.getByLabelText('Fecha preferida'), '2099-12-20')
    await user.click(screen.getByRole('button', { name: 'Solicitar visita' }))

    expect(submitRequest).toHaveBeenCalledWith(property, expect.objectContaining({ phone: '612345678' }))
    expect(screen.getByRole('status')).toHaveTextContent('Solicitud recibida')
    expect(screen.getByText(/Villa Serena/)).toBeInTheDocument()
  })

  test('muestra un error si no se puede guardar la visita', async () => {
    const user = userEvent.setup()
    const submitRequest = vi.fn().mockRejectedValue(new Error('fallo de red'))
    render(<VisitForm property={property} submitRequest={submitRequest} />)

    await user.type(screen.getByLabelText('Nombre completo'), 'Paula García')
    await user.type(screen.getByLabelText('Email'), 'paula@example.com')
    await user.type(screen.getByLabelText('Teléfono'), '612345678')
    await user.type(screen.getByLabelText('Fecha preferida'), '2099-12-20')
    await user.click(screen.getByRole('button', { name: 'Solicitar visita' }))

    expect(screen.getByRole('alert')).toHaveTextContent('No hemos podido solicitar la visita')
  })
})
