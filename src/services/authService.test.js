import { describe, expect, test, vi } from 'vitest'
import { getAuthErrorMessage, requestPasswordReset, signIn, signOut, signUp, updatePassword } from './authService'

function createClient() {
  return { auth: { signUp: vi.fn().mockResolvedValue({ data: {}, error: null }), signInWithPassword: vi.fn().mockResolvedValue({ data: {}, error: null }), signOut: vi.fn().mockResolvedValue({ error: null }), resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }), updateUser: vi.fn().mockResolvedValue({ error: null }) } }
}
describe('authService', () => {
  test('normaliza el registro y configura la confirmación por correo', async () => { const client = createClient(); await signUp({ name: '  Ana López ', email: ' ANA@EXAMPLE.COM ', password: 'segura123' }, client); expect(client.auth.signUp).toHaveBeenCalledWith({ email: 'ana@example.com', password: 'segura123', options: { data: { full_name: 'Ana López' }, emailRedirectTo: expect.stringContaining('/entrar?confirmado=1') } }) })
  test('inicia y cierra sesión', async () => { const client = createClient(); await signIn({ email: ' ANA@EXAMPLE.COM ', password: 'segura123' }, client); await signOut(client); expect(client.auth.signInWithPassword).toHaveBeenCalledWith({ email: 'ana@example.com', password: 'segura123' }); expect(client.auth.signOut).toHaveBeenCalled() })
  test('recupera y actualiza la contraseña', async () => { const client = createClient(); await requestPasswordReset('ana@example.com', client); await updatePassword('nueva-segura', client); expect(client.auth.resetPasswordForEmail).toHaveBeenCalledWith('ana@example.com', expect.objectContaining({ redirectTo: expect.stringContaining('/restablecer-contrasena') })); expect(client.auth.updateUser).toHaveBeenCalledWith({ password: 'nueva-segura' }) })
  test('traduce los errores del proveedor de correo', () => { expect(getAuthErrorMessage({ code: 'over_email_send_rate_limit', status: 429 })).toMatch(/límite/); expect(getAuthErrorMessage({ code: 'email_address_not_authorized' })).toMatch(/miembros/) })
})
