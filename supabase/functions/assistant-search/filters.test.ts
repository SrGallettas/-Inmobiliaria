import { describe, expect, test } from 'vitest'
import { isPropertySearchFilters } from './filters.ts'

describe('filtros estructurados del asistente', () => {
  test('acepta filtros completos y valores no mencionados como null', () => {
    expect(isPropertySearchFilters({
      operation: 'comprar',
      city: 'Valencia',
      propertyType: 'Ático',
      maxPrice: 700000,
      minBedrooms: null,
      minBathrooms: null,
      minArea: null,
    })).toBe(true)
  })

  test('rechaza valores inventados y propiedades adicionales', () => {
    expect(isPropertySearchFilters({
      operation: 'intercambiar',
      city: 'Valencia',
      propertyType: 'Palacio',
      maxPrice: -10,
      minBedrooms: 2,
      minBathrooms: 1,
      minArea: 80,
      dangerousField: true,
    })).toBe(false)
  })
})
