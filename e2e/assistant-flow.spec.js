import { expect, test } from '@playwright/test'

test.describe('asistente inmobiliario flotante', () => {
  test('envía una búsqueda, conserva contexto y permite desactivar la IA', async ({ page }) => {
    const requests = []
    await page.route('**/functions/v1/assistant-search', async (route) => {
      const body = route.request().postDataJSON()
      requests.push(body)
      const filters = requests.length === 1
        ? { operation: 'alquilar', city: 'Madrid', propertyType: 'Apartamento', maxPrice: null, minBedrooms: 2, minBathrooms: null, minArea: null }
        : { ...body.previousFilters, minBathrooms: 2 }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ filters }) })
    })

    await page.goto('/')
    const input = page.getByLabel('Describe la vivienda que buscas')
    await input.fill('Alquilar un piso en Madrid con 2 dormitorios')
    await page.getByRole('button', { name: 'Enviar búsqueda' }).click()
    await expect(page.getByText(/He encontrado 1 vivienda/)).toBeVisible()

    await input.fill('mejor con 2 baños')
    await page.getByRole('button', { name: 'Enviar búsqueda' }).click()
    await expect.poll(() => requests.length).toBe(2)
    expect(requests[1].previousFilters.city).toBe('Madrid')

    await page.getByRole('switch').click()
    await expect(page.getByText('Modo local')).toBeVisible()
    await input.fill('Comprar en Valencia')
    await page.getByRole('button', { name: 'Enviar búsqueda' }).click()
    await expect(page.getByText(/has desactivado la IA/)).toBeVisible()
    expect(requests).toHaveLength(2)
  })

  test('consulta la Edge Function y Gemini reales', async ({ page }) => {
    test.skip(process.env.RUN_LIVE_AI_E2E !== '1', 'Prueba real opcional: RUN_LIVE_AI_E2E=1 npm run test:e2e:assistant:live')
    await page.goto('/')
    await page.getByLabel('Describe la vivienda que buscas').fill('Alquilar un apartamento en Madrid con 2 dormitorios')
    await page.getByRole('button', { name: 'Enviar búsqueda' }).click()
    await expect(page.getByText(/He encontrado 1 vivienda/)).toBeVisible({ timeout: 45000 })
    await expect(page.getByText(/búsqueda básica/)).toHaveCount(0)
  })
})
