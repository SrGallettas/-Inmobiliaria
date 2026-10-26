import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router'
import { useAuth } from '../../auth/useAuth'
import { validateLoginForm } from '../../utils/formValidation'
import AuthLayout from './AuthLayout'

export default function LoginPage() {
  const { user, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  if (user) return <Navigate to="/mi-cuenta" replace />

  const update = ({ target }) => { setForm({ ...form, [target.name]: target.value }); setErrors({ ...errors, [target.name]: '' }) }
  const submit = async (event) => {
    event.preventDefault()
    const next = validateLoginForm(form)
    if (Object.keys(next).length) return setErrors(next)
    setSubmitting(true); setSubmitError('')
    try { await signIn(form); navigate(location.state?.from || '/mi-cuenta', { replace: true }) }
    catch { setSubmitError('No hemos podido iniciar sesión. Revisa el correo y la contraseña.') }
    finally { setSubmitting(false) }
  }

  return <AuthLayout eyebrow="Área privada" title="Bienvenido de nuevo." description="Accede para gestionar tu actividad en Lumera." footer={<>¿Todavía no tienes cuenta? <Link to="/registro">Crear cuenta</Link></>}>
    {searchParams.get('confirmado') === '1' && <p className="auth-notice" role="status">Correo confirmado correctamente. Ya puedes iniciar sesión.</p>}
    <form className="auth-form" onSubmit={submit} noValidate><label htmlFor="login-email">Correo electrónico</label><input id="login-email" name="email" type="email" autoComplete="email" value={form.email} onChange={update} aria-invalid={Boolean(errors.email)} />{errors.email && <span className="field-error">{errors.email}</span>}<label htmlFor="login-password">Contraseña</label><input id="login-password" name="password" type="password" autoComplete="current-password" value={form.password} onChange={update} aria-invalid={Boolean(errors.password)} />{errors.password && <span className="field-error">{errors.password}</span>}<Link className="auth-help" to="/recuperar-contrasena">¿Has olvidado tu contraseña?</Link>{submitError && <p className="submit-error" role="alert">{submitError}</p>}<button className="solid-link" disabled={submitting}>{submitting ? 'Entrando…' : 'Entrar'}</button></form>
  </AuthLayout>
}
