const CITY_ALIASES = ['Alicante', 'Barcelona', 'Bilbao', 'Girona', 'Granada', 'Ibiza', 'Madrid', 'Mallorca', 'Málaga', 'Sevilla', 'Valencia']

const PROPERTY_TYPES = [
  ['apartamento', 'Apartamento'],
  ['piso', 'Apartamento'],
  ['ático', 'Ático'],
  ['villa', 'Villa'],
  ['casa rural', 'Casa rural'],
  ['casa', 'Casa'],
  ['estudio', 'Estudio'],
]

function normalizeText(value) {
  return value.toLocaleLowerCase('es-ES')
}

function readMaximumPrice(text) {
  const match = text.match(/(?:menos de|máximo|hasta|por debajo de)\s*([\d.,]+)\s*(mil|k)?/i)
  if (!match) return null

  const rawNumber = Number(match[1].replace(/\./g, '').replace(',', '.'))
  if (!Number.isFinite(rawNumber)) return null
  return match[2] ? rawNumber * 1000 : rawNumber
}

function readMinimumBedrooms(text) {
  const match = text.match(/(\d+)\s*(?:habitaciones?|dormitorios?)/i)
  return match ? Number(match[1]) : null
}

function readMinimumBathrooms(text) {
  const match = text.match(/(\d+)\s*(?:baños?|cuartos? de baño)/i)
  return match ? Number(match[1]) : null
}

function readMinimumArea(text) {
  const match = text.match(/(?:mínimo|al menos|desde|de)\s*(\d+)\s*(?:m2|m²|metros? cuadrados?)/i)
  return match ? Number(match[1]) : null
}

export function promptToFilters(prompt) {
  const normalized = normalizeText(prompt)
  const city = CITY_ALIASES.find((candidate) => normalized.includes(normalizeText(candidate))) || null
  const type = PROPERTY_TYPES.find(([word]) => normalized.includes(word))?.[1] || null
  const operation = /alquil|renta/.test(normalized) ? 'alquilar' : /compr|venta/.test(normalized) ? 'comprar' : null

  return {
    city,
    maxPrice: readMaximumPrice(normalized),
    minBedrooms: readMinimumBedrooms(normalized),
    minBathrooms: readMinimumBathrooms(normalized),
    minArea: readMinimumArea(normalized),
    operation,
    type,
  }
}

export function searchPropertiesWithPrompt(properties, prompt, previousFilters = null) {
  const parsedFilters = promptToFilters(prompt)
  const filters = previousFilters
    ? Object.fromEntries(Object.entries(parsedFilters).map(([key, value]) => [key, value ?? previousFilters[key] ?? null]))
    : parsedFilters
  const activeFilters = Object.values(filters).filter((value) => value !== null).length
  const matches = properties.filter((property) => {
    if (filters.city && property.city !== filters.city) return false
    if (filters.maxPrice && property.price > filters.maxPrice) return false
    if (filters.minBedrooms && property.bedrooms < filters.minBedrooms) return false
    if (filters.minBathrooms && property.bathrooms < filters.minBathrooms) return false
    if (filters.minArea && property.area < filters.minArea) return false
    if (filters.operation && property.operation !== filters.operation) return false
    if (filters.type && property.type !== filters.type) return false
    return true
  })

  return { activeFilters, filters, matches }
}
