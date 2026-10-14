import test from 'node:test'
import assert from 'node:assert/strict'
import { loadFavorites, saveFavorites } from '../src/utils/favoritesStorage.js'

function createStorage(initialValue = null) {
  let value = initialValue
  return {
    getItem: () => value,
    setItem: (_key, nextValue) => { value = nextValue },
  }
}

test('carga favoritos válidos y elimina identificadores repetidos', () => {
  const storage = createStorage('[2,1,2,"3",-4]')
  assert.deepEqual(loadFavorites(storage), [2, 1])
})

test('devuelve una lista vacía si el almacenamiento está corrupto', () => {
  assert.deepEqual(loadFavorites(createStorage('contenido no válido')), [])
})

test('guarda los favoritos para recuperarlos después', () => {
  const storage = createStorage()
  saveFavorites([1, 5, 8], storage)
  assert.deepEqual(loadFavorites(storage), [1, 5, 8])
})
