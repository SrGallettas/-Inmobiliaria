import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test } from 'vitest'
import { MemoryRouter } from 'react-router'
import App from './App'

function renderApp(path = '/') {
  return render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>)
}

describe('App', () => {
  beforeEach(() => localStorage.clear())

  test('guarda una propiedad, actualiza el contador y permite verla en favoritos', async () => {
    const user = userEvent.setup()
    renderApp('/inmuebles')

    await user.click(screen.getByRole('button', { name: 'Añadir Villa Serena a favoritos' }))

    const favoritesLink = screen.getByRole('link', { name: 'Favoritos: 1 propiedades' })
    expect(favoritesLink).toBeInTheDocument()
    await waitFor(() => expect(localStorage.getItem('lumera:favorites')).toBe('[1]'))

    await user.click(favoritesLink)

    expect(screen.getByRole('heading', { name: /Casas que merece la pena/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Villa Serena' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Quitar Villa Serena de favoritos' })).toBeInTheDocument()
  })

  test('recupera los favoritos guardados al iniciar la aplicación', () => {
    localStorage.setItem('lumera:favorites', '[2]')
    renderApp('/favoritos')

    expect(screen.getByRole('heading', { name: 'Ático Velázquez' })).toBeInTheDocument()
    expect(screen.getByText('propiedad guardada').closest('p')).toHaveTextContent('1 propiedad guardada')
  })

  test('elimina una propiedad desde favoritos y muestra el estado vacío', async () => {
    const user = userEvent.setup()
    localStorage.setItem('lumera:favorites', '[2]')
    renderApp('/favoritos')

    await user.click(screen.getByRole('button', { name: 'Quitar Ático Velázquez de favoritos' }))

    expect(screen.getByRole('heading', { name: 'Todavía no has guardado ninguna casa' })).toBeInTheDocument()
    await waitFor(() => expect(localStorage.getItem('lumera:favorites')).toBe('[]'))
  })

  test('muestra la página 404 para una ruta desconocida', () => {
    renderApp('/ruta-que-no-existe')
    expect(screen.getByRole('heading', { name: /esta dirección/i })).toBeInTheDocument()
  })

  test('permite abrir las preguntas frecuentes desde el pie de página', async () => {
    const user = userEvent.setup()
    renderApp('/')

    await user.click(screen.getByRole('link', { name: 'Preguntas frecuentes' }))

    expect(screen.getByRole('heading', { name: /Preguntas\s*frecuentes/i })).toBeInTheDocument()
    expect(screen.getByText('¿Cómo puedo solicitar una visita?')).toBeInTheDocument()
  })

  test.each([
    ['Privacidad', /Política de privacidad/i],
    ['Cookies', /Política de cookies/i],
  ])('abre la página de %s desde el pie', async (linkName, heading) => {
    const user = userEvent.setup()
    renderApp('/')

    await user.click(screen.getByRole('link', { name: linkName }))

    expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument()
  })
})
