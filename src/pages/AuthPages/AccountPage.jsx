import { useState } from 'react'
import { useAuth } from '../../auth/useAuth'
import Seo from '../../components/Seo/Seo'
import { getAuthErrorMessage } from '../../services/authService'
import './AuthPages.css'

function maskEmail(email) {
  const [name, domain] = email.split('@')
  return `${name.slice(0, 2)}${'*'.repeat(Math.max(2, name.length - 2))}@${domain}`
}

export default function AccountPage() {
  const { user, requestPasswordReset } = useAuth()
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const name = user.user_metadata?.full_name || 'Tu cuenta'

  const sendPasswordEmail = async () => {
    setSending(true); setError('')
    try { await requestPasswordReset(user.email); setSent(true) }
    catch (requestError) { setError(getAuthErrorMessage(requestError, 'No hemos podido enviar el correo. Inténtalo de nuevo en unos minutos.')) }
    finally { setSending(false) }
  }

  return <div className="account-page page-space"><Seo title="Mi cuenta" description="Área privada de tu cuenta de Lumera." noIndex /><div className="container account-content"><p className="eyebrow">Área privada</p><h1>Hola, {name}.</h1><p>Tu cuenta ya está conectada. En las próximas fases aparecerán aquí tus favoritos sincronizados, conversaciones y solicitudes de visita.</p><dl><div><dt>Correo</dt><dd>{user.email}</dd></div><div><dt>Estado</dt><dd>Cuenta activa</dd></div></dl><section className="account-security" aria-labelledby="security-title"><h2 id="security-title">Seguridad</h2><p>Enviaremos un enlace de un solo uso al correo de tu cuenta. No necesitas volver a escribirlo.</p>{sent ? <p className="auth-notice" role="status">Correo enviado a {maskEmail(user.email)}. Revisa también la carpeta de spam.</p> : <button className="solid-link" type="button" onClick={sendPasswordEmail} disabled={sending}>{sending ? 'Enviando…' : 'Enviar enlace para cambiar contraseña'}</button>}{error && <p className="submit-error" role="alert">{error}</p>}</section></div></div>
}
