import { render, waitFor } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { MemoryRouter } from 'react-router'
import Seo from './Seo'

describe('Seo', () => {
  test('actualiza el título, la descripción y la URL canónica', async () => {
    render(<MemoryRouter initialEntries={['/inmuebles/2']}><Seo title="Ático Velázquez" description="Vivienda en Madrid" canonicalPath="/inmuebles/2" /></MemoryRouter>)

    await waitFor(() => expect(document.title).toBe('Ático Velázquez — Lumera Inmobiliaria'))
    expect(document.head.querySelector('meta[name="description"]')).toHaveAttribute('content', 'Vivienda en Madrid')
    expect(document.head.querySelector('meta[property="og:title"]')).toHaveAttribute('content', 'Ático Velázquez — Lumera Inmobiliaria')
    expect(document.head.querySelector('link[rel="canonical"]')).toHaveAttribute('href', 'http://localhost:3000/inmuebles/2')
  })

  test('evita la indexación cuando la página es privada o no existe', async () => {
    render(<MemoryRouter initialEntries={['/favoritos']}><Seo title="Favoritos" description="Tu selección" noIndex /></MemoryRouter>)

    await waitFor(() => expect(document.head.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow'))
  })
})
