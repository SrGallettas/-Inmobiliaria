import { describe, expect, test } from 'vitest'
import { promptToFilters, searchPropertiesWithPrompt } from './assistantSearch'

describe('assistantSearch', () => {
  test('traduce una petición natural a filtros', () => {
    expect(promptToFilters('Quiero comprar un ático en Valencia por menos de 700.000 € con 2 habitaciones')).toEqual({
      city: 'Valencia',
      maxPrice: 700000,
      minBedrooms: 2,
      minBathrooms: null,
      minArea: null,
      operation: 'comprar',
      type: 'Ático',
    })
  })

  test('mantiene el contexto y añade baños y superficie', () => {
    const listings = [
      { city: 'Madrid', operation: 'alquilar', price: 2000, bedrooms: 2, bathrooms: 1, area: 80, type: 'Apartamento' },
      { city: 'Madrid', operation: 'alquilar', price: 2500, bedrooms: 2, bathrooms: 2, area: 120, type: 'Apartamento' },
    ]
    const previous = promptToFilters('Alquilar piso en Madrid con 2 dormitorios')
    const result = searchPropertiesWithPrompt(listings, 'mejor con 2 baños y al menos 100 m²', previous)

    expect(result.matches).toEqual([listings[1]])
    expect(result.filters.city).toBe('Madrid')
  })

  test('filtra propiedades con los datos interpretados', () => {
    const properties = [
      { city: 'Madrid', operation: 'alquilar', price: 1400, bedrooms: 2, type: 'Apartamento' },
      { city: 'Madrid', operation: 'alquilar', price: 1700, bedrooms: 2, type: 'Apartamento' },
    ]

    const result = searchPropertiesWithPrompt(properties, 'Alquilar piso en Madrid con 2 dormitorios hasta 1.500 €')
    expect(result.activeFilters).toBe(5)
    expect(result.matches).toEqual([properties[0]])
  })
})
