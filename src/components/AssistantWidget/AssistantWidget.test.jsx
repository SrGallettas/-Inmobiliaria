import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { properties } from '../../data/properties'
import AssistantWidget from './AssistantWidget'

function renderWidget(props = {}) {
  return render(<MemoryRouter><AssistantWidget properties={properties} {...props} /></MemoryRouter>)
}

describe('AssistantWidget', () => {
  beforeEach(() => localStorage.clear())

  test('aparece abierto, puede minimizarse y volver a abrirse', async () => {
    const user = userEvent.setup()
    renderWidget()

    expect(screen.getByLabelText('Asistente de búsqueda de Lumera')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Minimizar asistente' }))
    expect(screen.queryByLabelText('Asistente de búsqueda de Lumera')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Abrir asistente de Lumera' }))
    expect(screen.getByLabelText('Asistente de búsqueda de Lumera')).toBeInTheDocument()
  })

  test('muestra resultados compactos a partir de una frase', async () => {
    const user = userEvent.setup()
    renderWidget()

    await user.type(screen.getByLabelText('Describe la vivienda que buscas'), 'Comprar un ático en Valencia por menos de 700.000 €')
    await user.click(screen.getByRole('button', { name: 'Enviar búsqueda' }))

    expect(await screen.findByText(/He encontrado 1 vivienda que encaja con tu búsqueda/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Ático del Mar/ })).toHaveAttribute('href', '/inmuebles/8')
  })

  test('muestra la espera, evita duplicados y permite empezar de nuevo', async () => {
    const user = userEvent.setup()
    let resolveSearch
    const search = vi.fn(() => new Promise((resolve) => { resolveSearch = resolve }))
    renderWidget({ search })

    await user.type(screen.getByLabelText('Describe la vivienda que buscas'), 'Comprar en Madrid')
    await user.click(screen.getByRole('button', { name: 'Enviar búsqueda' }))

    expect(screen.getByRole('status', { name: 'Buscando viviendas' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Enviar búsqueda' })).toBeDisabled()
    resolveSearch({ activeFilters: 1, matches: [] })
    expect(await screen.findByText(/No encuentro viviendas/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Nueva' }))
    expect(screen.queryByText('Comprar en Madrid')).not.toBeInTheDocument()
  })

  test('informa de un error del servicio', async () => {
    const user = userEvent.setup()
    renderWidget({ search: vi.fn().mockRejectedValue(new Error('Sin conexión')) })

    await user.type(screen.getByLabelText('Describe la vivienda que buscas'), 'Comprar en Madrid')
    await user.click(screen.getByRole('button', { name: 'Enviar búsqueda' }))

    expect(await screen.findByText(/No he podido realizar la búsqueda/)).toBeInTheDocument()
  })

  test('recuerda que el usuario ha minimizado el asistente', async () => {
    const user = userEvent.setup()
    const { unmount } = renderWidget()
    await user.click(screen.getByRole('button', { name: 'Minimizar asistente' }))
    unmount()

    renderWidget()
    expect(screen.getByRole('button', { name: 'Abrir asistente de Lumera' })).toBeInTheDocument()
  })
})
