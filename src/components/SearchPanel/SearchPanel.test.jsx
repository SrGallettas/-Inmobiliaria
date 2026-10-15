import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test } from 'vitest'
import { MemoryRouter, useLocation } from 'react-router'
import SearchPanel from './SearchPanel'

function LocationProbe() {
  const location = useLocation()
  return <output aria-label="Dirección actual">{location.pathname}{location.search}</output>
}

function renderSearch() {
  return render(<MemoryRouter><SearchPanel /><LocationProbe /></MemoryRouter>)
}

describe('SearchPanel', () => {
  test('envía una búsqueda de compra con todos los filtros seleccionados', async () => {
    const user = userEvent.setup()
    renderSearch()

    await user.selectOptions(screen.getByLabelText('Ubicación'), 'Madrid')
    await user.selectOptions(screen.getByLabelText('Tipo de propiedad'), 'Ático')
    await user.selectOptions(screen.getByLabelText('Precio máximo'), '2000000')
    await user.click(screen.getByRole('button', { name: 'Buscar' }))

    expect(screen.getByLabelText('Dirección actual')).toHaveTextContent('/inmuebles?operation=comprar&location=Madrid&type=%C3%81tico&maxPrice=2000000')
  })

  test('cambia a alquiler, muestra sus precios y elimina el precio anterior', async () => {
    const user = userEvent.setup()
    renderSearch()

    await user.selectOptions(screen.getByLabelText('Precio máximo'), '2000000')
    await user.click(screen.getByRole('button', { name: 'Alquilar' }))

    expect(screen.getByRole('button', { name: 'Alquilar' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByLabelText('Precio máximo')).toHaveValue('')
    expect(screen.getByRole('option', { name: '4.000 €/mes' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: '2.000.000 €' })).not.toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText('Ubicación'), 'Barcelona')
    await user.selectOptions(screen.getByLabelText('Precio máximo'), '3000')
    await user.click(screen.getByRole('button', { name: 'Buscar' }))

    expect(screen.getByLabelText('Dirección actual')).toHaveTextContent('/inmuebles?operation=alquilar&location=Barcelona&maxPrice=3000')
  })

  test('permite buscar sin filtros adicionales', async () => {
    const user = userEvent.setup()
    renderSearch()

    await user.click(screen.getByRole('button', { name: 'Buscar' }))

    expect(screen.getByLabelText('Dirección actual')).toHaveTextContent('/inmuebles?operation=comprar')
  })
})
