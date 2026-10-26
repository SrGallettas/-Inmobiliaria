import test from 'node:test'
import assert from 'node:assert/strict'
import { validateContactForm, validateLoginForm, validateNewPassword, validatePassword, validateProfileForm, validateRegisterForm, validateVisitForm } from '../src/utils/formValidation.js'

test('acepta un formulario de contacto válido', () => {
  const errors = validateContactForm({ name: 'Paula', email: 'paula@example.com', message: 'Quiero recibir información sobre una vivienda.' })
  assert.deepEqual(errors, {})
})

test('detecta todos los errores del formulario de contacto', () => {
  const errors = validateContactForm({ name: 'P', email: 'correo-invalido', message: 'Hola' })
  assert.deepEqual(Object.keys(errors).sort(), ['email', 'message', 'name'])
})

test('acepta una solicitud de visita válida', () => {
  const errors = validateVisitForm({ name: 'Pablo Ruiz', email: 'pablo@example.com', phone: '+34 612 345 678', date: '2026-12-20' }, '2026-10-14')
  assert.deepEqual(errors, {})
})

test('rechaza una fecha de visita pasada', () => {
  const errors = validateVisitForm({ name: 'Pablo Ruiz', email: 'pablo@example.com', phone: '612345678', date: '2026-10-13' }, '2026-10-14')
  assert.ok(errors.date)
})

test('acepta teléfonos con espacios y prefijo internacional', () => {
  const errors = validateVisitForm({ name: 'Ana López', email: 'ana@example.com', phone: '+34 600 123 456', date: '2026-10-15' }, '2026-10-14')
  assert.equal(errors.phone, undefined)
})

test('valida el registro y la confirmación de contraseña', () => {
  assert.deepEqual(validateRegisterForm({ name: 'Ana López', username: 'ana.lopez', email: 'ana@example.com', password: 'Segura.12345', passwordConfirmation: 'Segura.12345', privacy: true }), {})
  const errors = validateRegisterForm({ name: '', username: 'a!', email: 'mal', password: '123', passwordConfirmation: '456', privacy: false })
  assert.ok(errors.name && errors.username && errors.email && errors.password && errors.passwordConfirmation && errors.privacy)
})

test('valida el inicio y el cambio de contraseña', () => {
  assert.deepEqual(validateLoginForm({ identifier: 'ana.lopez', password: 'segura123' }), {})
  assert.equal(validateNewPassword({ password: 'Segura.12345', passwordConfirmation: 'Segura.12345' }), '')
  assert.ok(validateNewPassword({ password: '123', passwordConfirmation: '456' }))
})

test('exige longitud, mayúscula, minúscula, número y símbolo', () => {
  assert.match(validatePassword('Aa1!'), /12/)
  assert.match(validatePassword('minuscula.123'), /mayúscula/)
  assert.match(validatePassword('MAYUSCULA.123'), /minúscula/)
  assert.match(validatePassword('SinNumero.abc'), /número/)
  assert.match(validatePassword('SinSimbolo123A'), /símbolo/)
  assert.equal(validatePassword('CasaSegura.123'), '')
})

test('valida los campos editables del perfil', () => {
  assert.deepEqual(validateProfileForm({ fullName: 'Ana López', username: 'ana.lopez', phone: '+34 612 345 678' }), {})
  assert.deepEqual(validateProfileForm({ fullName: 'Ana López', username: 'ana.lopez', phone: '' }), {})
  const errors = validateProfileForm({ fullName: 'A', username: 'a!', phone: '123' })
  assert.ok(errors.fullName && errors.username && errors.phone)
})
