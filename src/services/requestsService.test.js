import { describe, expect, test, vi } from 'vitest'
import { createContactRequest, createVisitRequest } from './requestsService'

function createClient(error = null) {
  const insert = vi.fn().mockResolvedValue({ error })
  const from = vi.fn(() => ({ insert }))
  return { client: { from }, from, insert }
}

describe('requestsService', () => {
  test('normaliza y guarda una solicitud de contacto', async () => {
    const { client, from, insert } = createClient()

    await createContactRequest({ name: '  Ana López ', email: ' ANA@EXAMPLE.COM ', reason: 'Quiero comprar', message: '  Busco una vivienda. ' }, client)

    expect(from).toHaveBeenCalledWith('contact_requests')
    expect(insert).toHaveBeenCalledWith({ name: 'Ana López', email: 'ana@example.com', reason: 'Quiero comprar', message: 'Busco una vivienda.' })
  })

  test('guarda la propiedad asociada a una visita', async () => {
    const { client, from, insert } = createClient()

    await createVisitRequest({ id: 3, title: 'Casa del Olivo' }, { name: 'Pablo Ruiz', email: 'pablo@example.com', phone: '612 345 678', date: '2099-12-20', message: '' }, client)

    expect(from).toHaveBeenCalledWith('visit_requests')
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ property_id: 3, property_title: 'Casa del Olivo', preferred_date: '2099-12-20' }))
  })

  test('convierte los errores de Supabase en un error comprensible', async () => {
    const { client } = createClient({ message: 'database unavailable' })

    await expect(createContactRequest({ name: 'Ana', email: 'ana@example.com', reason: 'Comprar', message: 'Necesito información' }, client)).rejects.toThrow('No se pudo enviar la solicitud')
  })
})
