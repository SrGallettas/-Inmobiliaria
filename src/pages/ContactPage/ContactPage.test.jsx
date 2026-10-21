import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'
import ContactPage from './ContactPage'

describe('ContactPage', () => {
  test('muestra los errores de los campos obligatorios', async () => {
    const user = userEvent.setup()
    const submitRequest = vi.fn()
    render(<ContactPage submitRequest={submitRequest} />)

    await user.click(screen.getByRole('button', { name: 'Enviar consulta' }))

    expect(screen.getByText('Escribe tu nombre.')).toBeInTheDocument()
    expect(screen.getByText('Introduce un email válido.')).toBeInTheDocument()
    expect(screen.getByText(/mínimo 10 caracteres/i)).toBeInTheDocument()
    expect(submitRequest).not.toHaveBeenCalled()
  })

  test('acepta un formulario válido y permite empezar otro', async () => {
    const user = userEvent.setup()
    const submitRequest = vi.fn().mockResolvedValue(undefined)
    render(<ContactPage submitRequest={submitRequest} />)

    await user.type(screen.getByLabelText('Nombre'), 'Laura Martín')
    await user.type(screen.getByLabelText('Email'), 'laura@example.com')
    await user.type(screen.getByLabelText('Mensaje'), 'Me gustaría vender mi vivienda en Madrid.')
    await user.click(screen.getByRole('button', { name: 'Enviar consulta' }))

    expect(submitRequest).toHaveBeenCalledWith(expect.objectContaining({ email: 'laura@example.com' }))
    expect(screen.getByRole('status')).toHaveTextContent('Mensaje recibido')
    await user.click(screen.getByRole('button', { name: 'Enviar otro mensaje' }))
    expect(screen.getByLabelText('Nombre')).toHaveValue('')
  })

  test('permite reintentar cuando falla el envío', async () => {
    const user = userEvent.setup()
    const submitRequest = vi.fn().mockRejectedValue(new Error('fallo de red'))
    render(<ContactPage submitRequest={submitRequest} />)

    await user.type(screen.getByLabelText('Nombre'), 'Laura Martín')
    await user.type(screen.getByLabelText('Email'), 'laura@example.com')
    await user.type(screen.getByLabelText('Mensaje'), 'Necesito información sobre una vivienda.')
    await user.click(screen.getByRole('button', { name: 'Enviar consulta' }))

    expect(screen.getByRole('alert')).toHaveTextContent('No hemos podido enviar')
    expect(screen.getByRole('button', { name: 'Enviar consulta' })).toBeEnabled()
  })
})
