import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test } from 'vitest'
import ContactPage from './ContactPage'

describe('ContactPage', () => {
  test('muestra los errores de los campos obligatorios', async () => {
    const user = userEvent.setup()
    render(<ContactPage />)

    await user.click(screen.getByRole('button', { name: 'Enviar consulta' }))

    expect(screen.getByText('Escribe tu nombre.')).toBeInTheDocument()
    expect(screen.getByText('Introduce un email válido.')).toBeInTheDocument()
    expect(screen.getByText(/mínimo 10 caracteres/i)).toBeInTheDocument()
  })

  test('acepta un formulario válido y permite empezar otro', async () => {
    const user = userEvent.setup()
    render(<ContactPage />)

    await user.type(screen.getByLabelText('Nombre'), 'Laura Martín')
    await user.type(screen.getByLabelText('Email'), 'laura@example.com')
    await user.type(screen.getByLabelText('Mensaje'), 'Me gustaría vender mi vivienda en Madrid.')
    await user.click(screen.getByRole('button', { name: 'Enviar consulta' }))

    expect(screen.getByRole('status')).toHaveTextContent('Mensaje recibido')
    await user.click(screen.getByRole('button', { name: 'Enviar otro mensaje' }))
    expect(screen.getByLabelText('Nombre')).toHaveValue('')
  })
})
