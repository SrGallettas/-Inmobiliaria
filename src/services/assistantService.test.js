import { describe, expect, test, vi } from 'vitest'
import { properties } from '../data/properties'
import { searchPropertiesWithAssistant } from './assistantService'

describe('assistantService', () => {
  test('aplica a las propiedades los filtros recibidos de Gemini', async () => {
    const client = {
      functions: {
        invoke: vi.fn().mockResolvedValue({
          data: { filters: { operation: 'comprar', city: 'Valencia', propertyType: 'Ático', maxPrice: 700000, minBedrooms: 2, minBathrooms: 2, minArea: 100 } },
          error: null,
        }),
      },
    }

    const result = await searchPropertiesWithAssistant(properties, 'ático en Valencia', client)
    expect(result.source).toBe('ai')
    expect(result.matches.map((property) => property.title)).toEqual(['Ático del Mar'])
  })

  test('no llama a Gemini cuando la IA está desactivada', async () => {
    const client = { functions: { invoke: vi.fn() } }
    const result = await searchPropertiesWithAssistant(properties, 'Comprar en Madrid', { client, aiEnabled: false })

    expect(result.source).toBe('local')
    expect(client.functions.invoke).not.toHaveBeenCalled()
  })

  test('utiliza las reglas locales si Gemini no está disponible', async () => {
    const client = { functions: { invoke: vi.fn().mockResolvedValue({ data: null, error: new Error('503') }) } }
    const result = await searchPropertiesWithAssistant(properties, 'Comprar un ático en Valencia por menos de 700.000 €', client)

    expect(result.source).toBe('local')
    expect(result.matches.map((property) => property.title)).toEqual(['Ático del Mar'])
  })
})
