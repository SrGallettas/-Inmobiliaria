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
    listingStatus: row.listing_status || 'available',
    ownerId: row.owner_id || null,
  }
}

export async function getProperties(client = supabase) {
  if (!client) {
    return { properties: localProperties, source: 'local' }
  }

  const { data, error } = await client
    .from('properties')
    .select('id, title, location, city, price, bedrooms, bathrooms, area, type, operation, badge, featured, date_added, image, description, construction_year, energy_rating, floor, features, gallery, listing_status, owner_id')
    .order('date_added', { ascending: false })

  if (error) throw new Error(`No se pudieron cargar las propiedades: ${error.message}`)
  return { properties: data.map(mapProperty), source: 'supabase' }
}

export async function getOwnedProperties(userId, client = supabase) {
  if (!client) return []
  const { data, error } = await client.from('properties').select('*').eq('owner_id', userId).order('created_at', { ascending: false })
  if (error) throw error
  return data.map(mapProperty)
}

export async function createOwnedProperty(userId, values, client = supabase) {
  if (!client) throw new Error('Supabase no está configurado.')
  const payload = { owner_id: userId, title: values.title.trim(), location: values.location.trim(), city: values.city.trim(), price: Number(values.price), bedrooms: Number(values.bedrooms), bathrooms: Number(values.bathrooms), area: Number(values.area), type: values.type, operation: values.operation, image: values.image.trim(), description: values.description.trim(), construction_year: Number(values.year), energy_rating: values.energyRating, floor: values.floor.trim(), features: ['Luz natural'], gallery: [values.image.trim()], listing_status: 'available' }
  const { data, error } = await client.from('properties').insert(payload).select().single()
  if (error) throw error
  return mapProperty(data)
}

export async function updateOwnedPropertyStatus(propertyId, listingStatus, client = supabase) {
  if (!client) throw new Error('Supabase no está configurado.')
  const { error } = await client.from('properties').update({ listing_status: listingStatus }).eq('id', propertyId)
  if (error) throw error
}

export function subscribeToProperties(onChange, client = supabase) {
  if (!client) return () => {}
  const channel = client.channel('public-properties').on('postgres_changes', { event: '*', schema: 'public', table: 'properties' }, onChange).subscribe()
  return () => client.removeChannel(channel)
}
