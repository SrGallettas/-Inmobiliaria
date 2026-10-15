import { describe, expect, test, vi } from 'vitest'
import { properties as localProperties } from '../data/properties'
import { getProperties } from './propertiesService'

describe('getProperties', () => {
  test('utiliza el catálogo local cuando Supabase no está configurado', async () => {
    const result = await getProperties()

    expect(result.source).toBe('local')
    expect(result.properties).toEqual(localProperties)
  })

  test('devuelve un error comprensible si falla la consulta remota', async () => {
    const order = vi.fn().mockResolvedValue({ data: null, error: { message: 'sin conexión' } })
    const select = vi.fn(() => ({ order }))
    const from = vi.fn(() => ({ select }))

    await expect(getProperties({ from })).rejects.toThrow('No se pudieron cargar las propiedades: sin conexión')
    expect(from).toHaveBeenCalledWith('properties')
  })
})
