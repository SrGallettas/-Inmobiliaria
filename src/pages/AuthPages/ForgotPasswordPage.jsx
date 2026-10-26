import { useState } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../../auth/useAuth'
import { validateEmail } from '../../utils/formValidation'
import AuthLayout from './AuthLayout'
import { getAuthErrorMessage } from '../../services/authService'
export default function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth(); const [email, setEmail] = useState(''); const [error, setError] = useState(''); const [sent, setSent] = useState(false); const [submitting, setSubmitting] = useState(false)
  const submit = async (event) => { event.preventDefault(); const problem = validateEmail(email); if (problem) return setError(problem); setSubmitting(true); setError(''); try { await requestPasswordReset(email); setSent(true) } catch (requestError) { setError(getAuthErrorMessage(requestError, 'No hemos podido enviar el enlace. Inténtalo de nuevo.')) } finally { setSubmitting(false) } }
  return <AuthLayout eyebrow="Recuperar acceso" title="Crea una contraseña nueva." description="Indica tu correo y recibirás un enlace seguro.">{sent ? <div className="auth-success" role="status"><span>✓</span><p>Si existe una cuenta con ese correo, recibirás las instrucciones.</p><Link to="/entrar">Volver a entrar</Link></div> : <form className="auth-form" onSubmit={submit} noValidate><label htmlFor="recovery-email">Correo electrónico</label><input id="recovery-email" type="email" autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); setError('') }} aria-invalid={Boolean(error)} />{error && <span className="field-error" role="alert">{error}</span>}<button className="solid-link" disabled={submitting}>{submitting ? 'Enviando…' : 'Enviar enlace'}</button></form>}</AuthLayout>
}
