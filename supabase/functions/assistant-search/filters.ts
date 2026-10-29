export const propertySearchSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    operation: { anyOf: [{ type: 'string', enum: ['comprar', 'alquilar'] }, { type: 'null' }] },
    city: { anyOf: [{ type: 'string' }, { type: 'null' }] },
    propertyType: { anyOf: [{ type: 'string', enum: ['Apartamento', 'Ático', 'Villa', 'Casa rural', 'Casa', 'Estudio'] }, { type: 'null' }] },
    maxPrice: { anyOf: [{ type: 'integer', minimum: 1, maximum: 100000000 }, { type: 'null' }] },
    minBedrooms: { anyOf: [{ type: 'integer', minimum: 0, maximum: 100 }, { type: 'null' }] },
    minBathrooms: { anyOf: [{ type: 'integer', minimum: 0, maximum: 100 }, { type: 'null' }] },
    minArea: { anyOf: [{ type: 'integer', minimum: 1, maximum: 100000 }, { type: 'null' }] },
  },
  required: ['operation', 'city', 'propertyType', 'maxPrice', 'minBedrooms', 'minBathrooms', 'minArea'],
} as const

export type PropertySearchFilters = {
  operation: 'comprar' | 'alquilar' | null
  city: string | null
  propertyType: 'Apartamento' | 'Ático' | 'Villa' | 'Casa rural' | 'Casa' | 'Estudio' | null
  maxPrice: number | null
  minBedrooms: number | null
  minBathrooms: number | null
  minArea: number | null
}

const operations = new Set(['comprar', 'alquilar'])
const propertyTypes = new Set(['Apartamento', 'Ático', 'Villa', 'Casa rural', 'Casa', 'Estudio'])

function validNullableInteger(value: unknown, minimum: number, maximum: number) {
  return value === null || (Number.isInteger(value) && Number(value) >= minimum && Number(value) <= maximum)
}

export function isPropertySearchFilters(value: unknown): value is PropertySearchFilters {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const filters = value as Record<string, unknown>
  const expectedKeys = ['operation', 'city', 'propertyType', 'maxPrice', 'minBedrooms', 'minBathrooms', 'minArea']
  if (Object.keys(filters).length !== expectedKeys.length || expectedKeys.some((key) => !(key in filters))) return false

  return (filters.operation === null || operations.has(String(filters.operation)))
    && (filters.city === null || (typeof filters.city === 'string' && filters.city.trim().length > 0 && filters.city.length <= 80))
    && (filters.propertyType === null || propertyTypes.has(String(filters.propertyType)))
    && validNullableInteger(filters.maxPrice, 1, 100000000)
    && validNullableInteger(filters.minBedrooms, 0, 100)
    && validNullableInteger(filters.minBathrooms, 0, 100)
    && validNullableInteger(filters.minArea, 1, 100000)
}
