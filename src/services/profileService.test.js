import { describe, expect, test, vi } from 'vitest'
import { getProfile, updateProfile } from './profileService'

const row = { id: 'user-1', full_name: 'Ana López', username: 'ana.lopez', phone: null, avatar_url: null, role: 'client', created_at: '2026-10-26', updated_at: '2026-10-26' }

function query(result) {
  const single = vi.fn().mockResolvedValue(result)
  const selectAfterUpdate = vi.fn(() => ({ single }))
  const eqAfterUpdate = vi.fn(() => ({ select: selectAfterUpdate }))
  const update = vi.fn(() => ({ eq: eqAfterUpdate }))
  const eq = vi.fn(() => ({ single }))
  const select = vi.fn(() => ({ eq }))
  const from = vi.fn(() => ({ select, update }))
  return { client: { from }, from, select, eq, update, eqAfterUpdate, selectAfterUpdate }
}

describe('profileService', () => {
  test('carga y transforma el perfil del usuario', async () => { const mock = query({ data: row, error: null }); await expect(getProfile('user-1', mock.client)).resolves.toMatchObject({ fullName: 'Ana López', phone: '', role: 'client' }); expect(mock.eq).toHaveBeenCalledWith('id', 'user-1') })
  test('actualiza solo los campos editables y nunca envía el rol', async () => { const mock = query({ data: { ...row, phone: '612345678' }, error: null }); await updateProfile('user-1', { fullName: ' Ana López ', username: 'ana.lopez', phone: ' 612345678 ', avatarUrl: '', role: 'agent' }, mock.client); expect(mock.update).toHaveBeenCalledWith(expect.not.objectContaining({ role: expect.anything() })); expect(mock.update).toHaveBeenCalledWith(expect.objectContaining({ full_name: 'Ana López', username: 'ana.lopez', phone: '612345678' })) })
})
