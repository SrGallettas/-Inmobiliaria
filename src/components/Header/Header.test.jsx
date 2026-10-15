import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test } from 'vitest'
import { MemoryRouter, useLocation } from 'react-router'
import Header from './Header'

function LocationProbe() {
  const location = useLocation()
  return <output aria-label="Ruta actual">{location.pathname}</output>
}

function renderHeader() {
  return render(<MemoryRouter><Header favoriteCount={2} /><LocationProbe /></MemoryRouter>)
}

describe('Header', () => {
  test('abre y cierra el menú desde su botón', async () => {
    const user = userEvent.setup()
    renderHeader()

    await user.click(screen.getByRole('button', { name: 'Abrir menú' }))

    const closeButton = screen.getByRole('button', { name: 'Cerrar menú' })
    expect(closeButton).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('navigation', { name: 'Navegación principal' })).toHaveClass('nav-open')

    await user.click(closeButton)

    expect(screen.getByRole('button', { name: 'Abrir menú' })).toHaveAttribute('aria-expanded', 'false')
  })

  test('cierra el menú después de navegar', async () => {
    const user = userEvent.setup()
    renderHeader()

    await user.click(screen.getByRole('button', { name: 'Abrir menú' }))
    await user.click(screen.getByRole('link', { name: 'Comprar' }))

    expect(screen.getByLabelText('Ruta actual')).toHaveTextContent('/inmuebles')
    expect(screen.getByRole('button', { name: 'Abrir menú' })).toHaveAttribute('aria-expanded', 'false')
  })

  test('permite cerrar el menú con la tecla Escape', async () => {
    const user = userEvent.setup()
    renderHeader()

    await user.click(screen.getByRole('button', { name: 'Abrir menú' }))
    await user.keyboard('{Escape}')

    expect(screen.getByRole('button', { name: 'Abrir menú' })).toHaveAttribute('aria-expanded', 'false')
  })
})
