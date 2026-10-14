import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test } from 'vitest'
import VisitForm from './VisitForm'

const property = { title: 'Villa Serena' }

describe('VisitForm', () => {
  test('muestra errores cuando se envía vacío', async () => {
    const user = userEvent.setup()
    render(<VisitForm property={property} />)

    await user.click(screen.getByRole('button', { name: 'Solicitar visita' }))

    expect(screen.getByText('Escribe tu nombre completo.')).toBeInTheDocument()
    expect(screen.getByText('Introduce un email válido.')).toBeInTheDocument()
    expect(screen.getByText('Introduce un teléfono válido.')).toBeInTheDocument()
    expect(screen.getByText('Selecciona una fecha futura.')).toBeInTheDocument()
  })

  test('acepta una solicitud válida', async () => {
    const user = userEvent.setup()
    render(<VisitForm property={property} />)

    await user.type(screen.getByLabelText('Nombre completo'), 'Paula García')
    await user.type(screen.getByLabelText('Email'), 'paula@example.com')
    await user.type(screen.getByLabelText('Teléfono'), '612345678')
    await user.type(screen.getByLabelText('Fecha preferida'), '2099-12-20')
    await user.click(screen.getByRole('button', { name: 'Solicitar visita' }))

    expect(screen.getByRole('status')).toHaveTextContent('Solicitud recibida')
    expect(screen.getByText(/Villa Serena/)).toBeInTheDocument()
  })
})
