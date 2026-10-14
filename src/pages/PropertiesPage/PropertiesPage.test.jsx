import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test } from 'vitest'
import { MemoryRouter } from 'react-router'
import PropertiesPage from './PropertiesPage'

function renderPage(path = '/inmuebles') {
  return render(<MemoryRouter initialEntries={[path]}><PropertiesPage favorites={[]} onFavorite={() => {}} /></MemoryRouter>)
}

describe('PropertiesPage', () => {
  test('aplica filtros desde los controles del catálogo', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.selectOptions(screen.getByLabelText('Ubicación'), 'Madrid')
    await user.selectOptions(screen.getByLabelText('Tipo de propiedad'), 'Ático')

    expect(screen.getByText('propiedad encontrada').closest('p')).toHaveTextContent('1 propiedad encontrada')
    expect(screen.getByRole('heading', { name: 'Ático Velázquez' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Villa Serena' })).not.toBeInTheDocument()
  })

  test('lee los filtros iniciales de la URL y permite limpiarlos', async () => {
    const user = userEvent.setup()
    renderPage('/inmuebles?operation=alquilar&location=Barcelona')

    expect(screen.getByRole('heading', { name: 'Apartamento Born' })).toBeInTheDocument()
    expect(screen.getByText('propiedad encontrada').closest('p')).toHaveTextContent('1 propiedad encontrada')

    await user.click(screen.getByRole('button', { name: 'Limpiar todo' }))

    expect(screen.getByText('propiedades encontradas').closest('p')).toHaveTextContent('9 propiedades encontradas')
    expect(screen.getByRole('heading', { name: 'Villa Serena' })).toBeInTheDocument()
  })

  test('muestra una ayuda cuando no existen resultados', () => {
    renderPage('/inmuebles?location=Ibiza&maxPrice=500000')

    expect(screen.getByRole('heading', { name: 'No hemos encontrado viviendas' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Limpiar filtros' })).toBeInTheDocument()
  })
})
