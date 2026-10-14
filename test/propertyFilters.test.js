import test from 'node:test'
import assert from 'node:assert/strict'
import { properties } from '../src/data/properties.js'
import { filterProperties, paramsToFilters } from '../src/utils/propertyFilters.js'

test('filtra viviendas por operación', () => {
  const results = filterProperties(properties, { operation: 'alquilar', sort: 'newest' })
  assert.ok(results.length > 0)
  assert.ok(results.every((property) => property.operation === 'alquilar'))
})

test('combina ubicación, tipo, precio y dormitorios', () => {
  const results = filterProperties(properties, { operation: 'comprar', location: 'Madrid', type: 'Ático', maxPrice: '1500000', bedrooms: '3', sort: 'newest' })
  assert.equal(results.length, 1)
  assert.equal(results[0].title, 'Ático Velázquez')
})

test('devuelve una lista vacía cuando no hay coincidencias', () => {
  const results = filterProperties(properties, { operation: 'comprar', location: 'Ibiza', maxPrice: '500000', sort: 'newest' })
  assert.deepEqual(results, [])
})

test('ordena los precios de menor a mayor', () => {
  const results = filterProperties(properties, { operation: 'comprar', sort: 'price-asc' })
  const prices = results.map((property) => property.price)
  assert.deepEqual(prices, [...prices].sort((a, b) => a - b))
})

test('ordena los precios de mayor a menor', () => {
  const results = filterProperties(properties, { operation: 'comprar', sort: 'price-desc' })
  const prices = results.map((property) => property.price)
  assert.deepEqual(prices, [...prices].sort((a, b) => b - a))
})

test('convierte parámetros de URL en filtros con valores predeterminados', () => {
  const filters = paramsToFilters(new URLSearchParams('location=Madrid&type=Atico&bedrooms=2'))
  assert.equal(filters.location, 'Madrid')
  assert.equal(filters.type, 'Atico')
  assert.equal(filters.bedrooms, '2')
  assert.equal(filters.operation, 'comprar')
  assert.equal(filters.sort, 'newest')
})
