import { properties as localProperties } from '../data/properties'
import { supabase } from '../lib/supabase'

function mapProperty(row) {
  return {
    id: row.id,
    title: row.title,
    location: row.location,
    city: row.city,
    price: row.price,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    area: row.area,
    type: row.type,
    operation: row.operation,
    badge: row.badge || undefined,
    featured: row.featured,
    dateAdded: row.date_added,
    image: row.image,
    description: row.description,
    year: row.construction_year,
    energyRating: row.energy_rating,
    floor: row.floor,
    features: row.features,
    gallery: row.gallery,
  }
}

export async function getProperties(client = supabase) {
  if (!client) {
    return { properties: localProperties, source: 'local' }
  }

  const { data, error } = await client
    .from('properties')
    .select('id, title, location, city, price, bedrooms, bathrooms, area, type, operation, badge, featured, date_added, image, description, construction_year, energy_rating, floor, features, gallery')
    .order('date_added', { ascending: false })

  if (error) throw new Error(`No se pudieron cargar las propiedades: ${error.message}`)
  return { properties: data.map(mapProperty), source: 'supabase' }
}
