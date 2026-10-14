import { Link } from 'react-router'
import '../pages.css'

function NotFoundPage() { return <section className="not-found page-space"><span className="error-number">404</span><p className="eyebrow">Página no encontrada</p><h1>Parece que esta dirección<br />no lleva a ninguna casa.</h1><p>Vuelve al inicio o sigue explorando nuestra colección de propiedades.</p><div><Link to="/" className="solid-link">Volver al inicio</Link><Link to="/inmuebles" className="outline-link">Ver inmuebles</Link></div></section> }
export default NotFoundPage
