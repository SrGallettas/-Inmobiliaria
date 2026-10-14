import test from 'node:test'
import assert from 'node:assert/strict'
import { featuredProperties, formatPrice, getPropertyDetails, properties } from '../src/data/properties.js'

test('cada propiedad tiene un identificador único', () => {
  const ids = properties.map((property) => property.id)
  assert.equal(new Set(ids).size, properties.length)
})

test('las propiedades destacadas pertenecen al catálogo', () => {
  assert.ok(featuredProperties.length > 0)
  assert.ok(featuredProperties.every((property) => properties.includes(property)))
})

test('formatea precios de compra y alquiler', () => {
  assert.match(formatPrice(1850000), /1[.]850[.]000/)
  assert.match(formatPrice(2600, 'alquilar'), /mes$/)
})

test('genera una ficha completa para cualquier propiedad', () => {
  const details = getPropertyDetails(properties[0])
  assert.ok(details.description.length > 30)
  assert.ok(details.gallery.length >= 4)
  assert.ok(details.features.length >= 4)
  assert.ok(details.year)
})
