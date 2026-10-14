import test from 'node:test'
import assert from 'node:assert/strict'
import { validateContactForm, validateVisitForm } from '../src/utils/formValidation.js'

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
