import { supabase } from '../lib/supabase'
import { searchPropertiesWithPrompt } from '../utils/assistantSearch'

const OPERATIONS = new Set(['comprar', 'alquilar'])
const PROPERTY_TYPES = new Set(['Apartamento', 'Ático', 'Villa', 'Casa rural', 'Casa', 'Estudio'])

function normalizeFilters(value) {
  if (!value || typeof value !== 'object') return null
  const filters = {
    operation: value.operation ?? null,
    city: value.city ?? null,
    type: value.propertyType ?? null,
    maxPrice: value.maxPrice ?? null,
    minBedrooms: value.minBedrooms ?? null,
    minBathrooms: value.minBathrooms ?? null,
    minArea: value.minArea ?? null,
  }

  if (filters.operation !== null && !OPERATIONS.has(filters.operation)) return null
  if (filters.city !== null && (typeof filters.city !== 'string' || !filters.city.trim())) return null
  if (filters.type !== null && !PROPERTY_TYPES.has(filters.type)) return null
  if (filters.maxPrice !== null && (!Number.isInteger(filters.maxPrice) || filters.maxPrice <= 0)) return null
  if (filters.minBedrooms !== null && (!Number.isInteger(filters.minBedrooms) || filters.minBedrooms < 0)) return null
  if (filters.minBathrooms !== null && (!Number.isInteger(filters.minBathrooms) || filters.minBathrooms < 0)) return null
  if (filters.minArea !== null && (!Number.isInteger(filters.minArea) || filters.minArea <= 0)) return null
  return filters
}

function applyFilters(properties, filters) {
  const normalizedCity = filters.city?.trim().toLocaleLowerCase('es-ES')
  return properties.filter((property) => {
    if (normalizedCity && property.city.toLocaleLowerCase('es-ES') !== normalizedCity) return false
    if (filters.maxPrice && property.price > filters.maxPrice) return false
    if (filters.minBedrooms !== null && property.bedrooms < filters.minBedrooms) return false
    if (filters.minBathrooms !== null && property.bathrooms < filters.minBathrooms) return false
    if (filters.minArea !== null && property.area < filters.minArea) return false
    if (filters.operation && property.operation !== filters.operation) return false
    if (filters.type && property.type !== filters.type) return false
    return true
  })
}

export async function searchPropertiesWithAssistant(properties, prompt, options = {}) {
  const legacyClient = options?.functions ? options : null
  const { client = legacyClient || supabase, previousFilters = null, aiEnabled = true } = legacyClient ? {} : options
  const localFallback = () => ({ ...searchPropertiesWithPrompt(properties, prompt, previousFilters), source: 'local' })
  if (!aiEnabled || !client) return localFallback()

  try {
    const apiPreviousFilters = previousFilters ? { ...previousFilters, propertyType: previousFilters.type, type: undefined } : null
    const { data, error } = await client.functions.invoke('assistant-search', { body: { message: prompt, previousFilters: apiPreviousFilters } })
    if (error) throw error
    const filters = normalizeFilters(data?.filters)
    if (!filters) throw new Error('La IA ha devuelto filtros no válidos.')
    return {
      activeFilters: Object.values(filters).filter((value) => value !== null).length,
      filters,
      matches: applyFilters(properties, filters),
      source: 'ai',
    }
  } catch {
    return localFallback()
  }
}
