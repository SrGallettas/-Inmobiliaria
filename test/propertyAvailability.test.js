import test from 'node:test'
import assert from 'node:assert/strict'
import { isMarketedProperty, isUnavailableProperty } from '../src/utils/propertyAvailability.js'

test('muestra propiedades disponibles y reservadas en el catálogo', () => {
  assert.equal(isMarketedProperty({ listingStatus: 'available' }), true)
  assert.equal(isMarketedProperty({ listingStatus: 'reserved' }), true)
})

test('oculta propiedades vendidas o retiradas del catálogo', () => {
  assert.equal(isMarketedProperty({ listingStatus: 'sold' }), false)
  assert.equal(isMarketedProperty({ listingStatus: 'removed' }), false)
  assert.equal(isUnavailableProperty({ listingStatus: 'sold' }), true)
})
