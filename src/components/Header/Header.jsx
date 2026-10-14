import { useState } from 'react'
import { Link, NavLink } from 'react-router'
import './Header.css'

function HeartIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" /></svg> }

function Header({ favoriteCount, overlay }) {
  const [menuOpen, setMenuOpen] = useState(false)
  return <header className={`main-header ${overlay ? 'header-overlay' : 'header-solid'}`}><Link to="/" className="brand" aria-label="Lumera, inicio"><svg viewBox="0 0 34 34" aria-hidden="true"><path d="M17 2 3 10v14l14 8 14-8V10L17 2Z" /><path d="m3 10 14 8 14-8M17 18v14" /></svg><span>LUMERA</span></Link><nav className={menuOpen ? 'nav-open' : ''} aria-label="Navegación principal"><NavLink to="/inmuebles" onClick={() => setMenuOpen(false)}>Comprar</NavLink><NavLink to="/contacto" onClick={() => setMenuOpen(false)}>Vender</NavLink><Link to="/?seccion=zonas" onClick={() => setMenuOpen(false)}>Zonas</Link><Link to="/?seccion=metodo" onClick={() => setMenuOpen(false)}>Nosotros</Link></nav><div className="header-actions"><button className="favorite-button" type="button" aria-label={`${favoriteCount} propiedades favoritas`}><HeartIcon /><span>Favoritos</span>{favoriteCount > 0 && <b>{favoriteCount}</b>}</button><Link className="contact-button" to="/contacto">Contacto</Link><button className={`menu-button ${menuOpen ? 'is-open' : ''}`} type="button" aria-label="Abrir menú" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><i /><i /></button></div></header>
}
export default Header
