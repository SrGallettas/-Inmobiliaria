import { expect, test } from '@playwright/test'

test('filtra el catálogo y conserva el regreso desde la ficha', async ({ page }) => {
  await page.goto('/inmuebles')
  await page.getByLabel('Ubicación').selectOption('Madrid')
  await page.getByLabel('Tipo de propiedad').selectOption('Ático')

  await expect(page.getByText('1 propiedad encontrada')).toBeVisible()
  await page.getByRole('link', { name: 'Ático Velázquez', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Ático Velázquez' })).toBeVisible()

  await page.getByRole('link', { name: /Volver a los resultados/ }).click()
  await expect(page).toHaveURL(/location=Madrid/)
  await expect(page.getByText('1 propiedad encontrada')).toBeVisible()
})

test('guarda favoritos y los conserva después de recargar', async ({ page }) => {
  await page.goto('/inmuebles')
  await page.getByRole('button', { name: 'Añadir Villa Serena a favoritos' }).click()
  await expect(page.getByRole('link', { name: 'Favoritos: 1 propiedades' })).toBeVisible()

  await page.reload()
  await expect(page.getByRole('button', { name: 'Quitar Villa Serena de favoritos' })).toBeVisible()
  await page.getByRole('link', { name: 'Favoritos: 1 propiedades' }).click()
  await expect(page.getByRole('heading', { name: 'Villa Serena' })).toBeVisible()
})

test('protege mensajes y recuerda el destino de acceso', async ({ page }) => {
  await page.goto('/mensajes')
  await expect(page).toHaveURL(/\/entrar$/)
  await expect(page.getByRole('heading', { name: 'Bienvenido de nuevo.' })).toBeVisible()
})

test('muestra validaciones del formulario de acceso', async ({ page }) => {
  await page.goto('/entrar')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page.getByText('Introduce tu correo o nickname.')).toBeVisible()
  await expect(page.getByText('Introduce tu contraseña.')).toBeVisible()
})

test('permite navegar por las páginas legales', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Privacidad' }).click()
  await expect(page.getByRole('heading', { name: /Política de privacidad/ })).toBeVisible()
  await page.getByRole('link', { name: 'Cookies', exact: true }).click()
  await expect(page.getByRole('heading', { name: /Política de cookies/ })).toBeVisible()
})

test('presenta una página 404 útil', async ({ page }) => {
  await page.goto('/direccion-inexistente')
  await expect(page.getByRole('heading', { name: /esta dirección/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /Volver al inicio/ })).toBeVisible()
})
