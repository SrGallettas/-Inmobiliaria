import { useState } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../../auth/useAuth'
import { validateNewPassword } from '../../utils/formValidation'
import AuthLayout from './AuthLayout'
import PasswordRequirements from './PasswordRequirements'
export default function ResetPasswordPage() {
  const { updatePassword } = useAuth(); const [form, setForm] = useState({ password: '', passwordConfirmation: '' }); const [error, setError] = useState(''); const [updated, setUpdated] = useState(false); const [submitting, setSubmitting] = useState(false)
  const submit = async (event) => { event.preventDefault(); const problem = validateNewPassword(form); if (problem) return setError(problem); setSubmitting(true); setError(''); try { await updatePassword(form.password); setUpdated(true) } catch { setError('El enlace no es válido o ha caducado. Solicita uno nuevo.') } finally { setSubmitting(false) } }
  return <AuthLayout eyebrow="Nueva contraseña" title="Recupera tu cuenta." description="Elige una contraseña segura que no utilices en otros servicios.">{updated ? <div className="auth-success" role="status"><span>✓</span><p>Tu contraseña se ha actualizado correctamente.</p><Link className="solid-link" to="/mi-cuenta">Ir a mi cuenta</Link></div> : <form className="auth-form" onSubmit={submit} noValidate><label htmlFor="reset-password">Nueva contraseña</label><input id="reset-password" type="password" autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /><PasswordRequirements /><label htmlFor="reset-confirmation">Repite la contraseña</label><input id="reset-confirmation" type="password" autoComplete="new-password" value={form.passwordConfirmation} onChange={(e) => setForm({ ...form, passwordConfirmation: e.target.value })} />{error && <p className="submit-error" role="alert">{error}</p>}<button className="solid-link" disabled={submitting}>{submitting ? 'Guardando…' : 'Guardar contraseña'}</button></form>}</AuthLayout>
}
