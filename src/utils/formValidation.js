const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateEmail(email) {
  return emailPattern.test(email.trim()) ? '' : 'Introduce un email válido.'
}

export function validateLoginForm(form) {
  const errors = {}
  if (!form.identifier?.trim() && !form.email?.trim()) errors.identifier = 'Introduce tu correo o nickname.'
  if (!form.password) errors.password = 'Introduce tu contraseña.'
  return errors
}

export function validateUsername(username) {
  const value = String(username || '').trim().toLowerCase()
  if (!/^[a-z0-9._]{3,24}$/.test(value)) return 'Usa entre 3 y 24 caracteres: letras, números, punto o guion bajo.'
  return ''
}

export const passwordRequirements = [
  '12 caracteres como mínimo',
  'Una letra mayúscula',
  'Una letra minúscula',
  'Un número',
  'Un símbolo especial',
]

export function validatePassword(password) {
  if (password.length < 12) return 'La contraseña debe tener al menos 12 caracteres.'
  if (!/[A-Z]/.test(password)) return 'Añade al menos una letra mayúscula.'
  if (!/[a-z]/.test(password)) return 'Añade al menos una letra minúscula.'
  if (!/[0-9]/.test(password)) return 'Añade al menos un número.'
  if (!/[^A-Za-z0-9]/.test(password)) return 'Añade al menos un símbolo especial.'
  return ''
}

export function validateRegisterForm(form) {
  const errors = validateLoginForm(form)
  if (form.name.trim().length < 2) errors.name = 'Escribe tu nombre completo.'
  const usernameError = validateUsername(form.username)
  if (usernameError) errors.username = usernameError
  const emailError = validateEmail(form.email)
  if (emailError) errors.email = emailError
  const passwordError = validatePassword(form.password)
  if (passwordError) errors.password = passwordError
  if (form.passwordConfirmation !== form.password) errors.passwordConfirmation = 'Las contraseñas no coinciden.'
  if (!form.privacy) errors.privacy = 'Debes aceptar la política de privacidad.'
  return errors
}

export function validateNewPassword(form) {
  const passwordError = validatePassword(form.password)
  if (passwordError) return passwordError
  if (form.password !== form.passwordConfirmation) return 'Las contraseñas no coinciden.'
  return ''
}

export function validateProfileForm(form) {
  const errors = {}
  if (form.fullName.trim().length < 2) errors.fullName = 'Escribe tu nombre completo.'
  const usernameError = validateUsername(form.username)
  if (usernameError) errors.username = usernameError
  if (form.phone && form.phone.replace(/\D/g, '').length < 9) errors.phone = 'Introduce un teléfono válido o déjalo vacío.'
  return errors
}

export function validateContactForm(form) {
  const errors = {}
  if (form.name.trim().length < 2) errors.name = 'Escribe tu nombre.'
  if (!emailPattern.test(form.email)) errors.email = 'Introduce un email válido.'
  if (form.message.trim().length < 10) errors.message = 'Cuéntanos un poco más (mínimo 10 caracteres).'
  return errors
}

export function validateVisitForm(form, today) {
  const errors = {}
  if (form.name.trim().length < 2) errors.name = 'Escribe tu nombre completo.'
  if (!emailPattern.test(form.email)) errors.email = 'Introduce un email válido.'
  if (form.phone.replace(/\D/g, '').length < 9) errors.phone = 'Introduce un teléfono válido.'
  if (!form.date || form.date < today) errors.date = 'Selecciona una fecha futura.'
  return errors
}
