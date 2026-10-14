import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test } from 'vitest'
import PropertyGallery from './PropertyGallery'

const images = ['/casa-1.jpg', '/casa-2.jpg', '/casa-3.jpg', '/casa-4.jpg']

describe('PropertyGallery', () => {
  test('abre la vista ampliada, navega con el teclado y se cierra con Escape', async () => {
    const user = userEvent.setup()
    render(<PropertyGallery images={images} title="Casa Azul" />)

    await user.click(screen.getByRole('button', { name: /Casa Azul, imagen 1/i }))
    expect(screen.getByRole('dialog', { name: 'Vista ampliada de Casa Azul' })).toBeInTheDocument()

    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(screen.getByAltText('Casa Azul, imagen ampliada 2')).toBeInTheDocument()

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  test('cambia la imagen principal al elegir una miniatura', async () => {
    const user = userEvent.setup()
    render(<PropertyGallery images={images} title="Casa Azul" />)

    await user.click(screen.getByRole('button', { name: 'Ver imagen 3 de Casa Azul' }))

    expect(screen.getByAltText('Casa Azul, imagen 3')).toHaveAttribute('src', '/casa-3.jpg')
    expect(screen.getByText('03 / 04')).toBeInTheDocument()
  })
})
