import { Link } from 'react-router'
import Seo from '../../components/Seo/Seo'
import './AuthPages.css'
export default function AuthLayout({ eyebrow, title, description, children, footer }) {
  return <div className="auth-page page-space"><Seo title={title} description={description} noIndex /><div className="auth-shell container"><div className="auth-intro"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p><Link to="/">← Volver a Lumera</Link></div><div className="auth-card">{children}{footer && <p className="auth-footer">{footer}</p>}</div></div></div>
}
