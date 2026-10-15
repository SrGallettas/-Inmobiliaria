import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { MemoryRouter } from 'react-router'
import HomePage from './HomePage'

describe('HomePage', () => {
  test('cada ciudad enlaza al catálogo con el filtro correspondiente', () => {
    render(<MemoryRouter><HomePage favorites={[]} onFavorite={() => {}} /></MemoryRouter>)

    const cities = ['Madrid', 'Barcelona', 'Málaga', 'Valencia', 'Alicante', 'Girona']

    for (const city of cities) {
      const href = screen.getByRole('link', { name: `Ver viviendas en ${city}` }).getAttribute('href')
      const params = new URL(href, 'https://lumera.test').searchParams

      expect(params.get('operation')).toBe('comprar')
      expect(params.get('location')).toBe(city)
    }
  })
})
