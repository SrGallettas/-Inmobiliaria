const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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
