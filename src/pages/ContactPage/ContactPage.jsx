import { useState } from 'react'
import { validateContactForm } from '../../utils/formValidation'
import Seo from '../../components/Seo/Seo'
import '../pages.css'

const initialForm = { name: '', email: '', reason: 'Quiero comprar', message: '' }

function ContactPage() {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(false)
  const updateField = ({ target }) => { setForm((current) => ({ ...current, [target.name]: target.value })); setErrors((current) => ({ ...current, [target.name]: '' })) }
  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = validateContactForm(form)
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return }
    setSent(true)
  }
  const resetForm = () => { setForm(initialForm); setErrors({}); setSent(false) }
  const errorFor = (name) => errors[name] && <span className="field-error" id={`contact-${name}-error`}>{errors[name]}</span>

  return <div className="contact-page page-space"><Seo title="Contacto" description="Contacta con Lumera para encontrar, visitar, vender o valorar una propiedad." /><div className="contact-grid container"><div className="contact-copy"><p className="eyebrow">Hablemos</p><h1>Tu próxima casa empieza con una conversación.</h1><p>Cuéntanos qué estás buscando o qué propiedad quieres vender. Nuestro equipo te responderá personalmente.</p><div className="contact-details"><a href="tel:+34910000000">+34 910 000 000</a><a href="mailto:hola@lumera.es">hola@lumera.es</a></div></div>{sent ? <div className="form-success" role="status"><span aria-hidden="true">✓</span><h2>Mensaje recibido</h2><p>Gracias por contactar con Lumera. Te responderemos muy pronto.</p><button type="button" onClick={resetForm}>Enviar otro mensaje</button></div> : <form className="contact-form" onSubmit={handleSubmit} noValidate><label htmlFor="contact-name">Nombre</label><input id="contact-name" name="name" value={form.name} onChange={updateField} autoComplete="name" placeholder="Tu nombre" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'contact-name-error' : undefined} />{errorFor('name')}<label htmlFor="contact-email">Email</label><input id="contact-email" name="email" type="email" value={form.email} onChange={updateField} autoComplete="email" placeholder="tu@email.com" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'contact-email-error' : undefined} />{errorFor('email')}<label htmlFor="contact-reason">Motivo</label><select id="contact-reason" name="reason" value={form.reason} onChange={updateField}><option>Quiero comprar</option><option>Quiero vender</option><option>Solicitar una visita</option></select><label htmlFor="contact-message">Mensaje</label><textarea id="contact-message" name="message" rows="5" value={form.message} onChange={updateField} placeholder="Cuéntanos un poco más..." aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? 'contact-message-error' : undefined} />{errorFor('message')}<button type="submit" className="solid-link">Enviar consulta</button></form>}</div></div>
}
export default ContactPage
