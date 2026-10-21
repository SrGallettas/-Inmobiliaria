import { useState } from 'react'
import { validateVisitForm } from '../../utils/formValidation'
import './VisitForm.css'

const initialForm = { name: '', email: '', phone: '', date: '', message: '' }
const today = new Date().toISOString().split('T')[0]
const submitVisitRequest = async (property, form) => {
  const { createVisitRequest } = await import('../../services/requestsService')
  return createVisitRequest(property, form)
}

function VisitForm({ property, submitRequest = submitVisitRequest }) {
  const [form, setForm] = useState({ ...initialForm, message: `Me interesa visitar ${property.title}.` })
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const updateField = ({ target }) => {
    setForm((current) => ({ ...current, [target.name]: target.value }))
    setErrors((current) => ({ ...current, [target.name]: '' }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = validateVisitForm(form, today)
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return }
    setSubmitting(true)
    setSubmitError('')
    try {
      await submitRequest(property, form)
      setSent(true)
    } catch {
      setSubmitError('No hemos podido solicitar la visita. Inténtalo de nuevo en unos minutos.')
    } finally {
      setSubmitting(false)
    }
  }

  if (sent) return <div className="visit-success" role="status"><span aria-hidden="true">✓</span><h2>Solicitud recibida</h2><p>Contactaremos contigo para organizar la visita a {property.title}.</p><button type="button" onClick={() => setSent(false)}>Modificar solicitud</button></div>

  const fieldError = (name) => errors[name] && <span className="field-error" id={`visit-${name}-error`}>{errors[name]}</span>
  return <form className="visit-form" onSubmit={handleSubmit} noValidate><p className="eyebrow">Visita privada</p><h2>Descubre {property.title}</h2><p>Déjanos tus datos y buscaremos el momento que mejor te venga.</p><label htmlFor="visit-name">Nombre completo</label><input id="visit-name" name="name" value={form.name} onChange={updateField} autoComplete="name" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'visit-name-error' : undefined} />{fieldError('name')}<div className="visit-row"><div><label htmlFor="visit-email">Email</label><input id="visit-email" name="email" type="email" value={form.email} onChange={updateField} autoComplete="email" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'visit-email-error' : undefined} />{fieldError('email')}</div><div><label htmlFor="visit-phone">Teléfono</label><input id="visit-phone" name="phone" type="tel" value={form.phone} onChange={updateField} autoComplete="tel" aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? 'visit-phone-error' : undefined} />{fieldError('phone')}</div></div><label htmlFor="visit-date">Fecha preferida</label><input id="visit-date" name="date" type="date" min={today} value={form.date} onChange={updateField} aria-invalid={Boolean(errors.date)} aria-describedby={errors.date ? 'visit-date-error' : undefined} />{fieldError('date')}<label htmlFor="visit-message">Mensaje</label><textarea id="visit-message" name="message" rows="3" value={form.message} onChange={updateField} />{submitError && <p className="submit-error" role="alert">{submitError}</p>}<button className="solid-link" type="submit" disabled={submitting}>{submitting ? 'Enviando…' : 'Solicitar visita'}</button><small>Al enviar aceptas nuestra política de privacidad.</small></form>
}
export default VisitForm
