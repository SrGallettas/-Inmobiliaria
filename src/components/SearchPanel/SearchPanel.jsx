import { useState } from 'react'
import { useNavigate } from 'react-router'
import './SearchPanel.css'

function SearchPanel() {
  const navigate = useNavigate()
  const [operation, setOperation] = useState('comprar')
  const submitSearch = (event) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const params = new URLSearchParams({ operation })
    for (const [key, value] of form.entries()) if (value) params.set(key, value)
    navigate(`/inmuebles?${params.toString()}`)
  }
  return <div className="search-panel"><div className="search-tabs" role="group" aria-label="Tipo de operación"><button className={operation === 'comprar' ? 'active' : ''} aria-pressed={operation === 'comprar'} onClick={() => setOperation('comprar')} type="button">Comprar</button><button className={operation === 'alquilar' ? 'active' : ''} aria-pressed={operation === 'alquilar'} onClick={() => setOperation('alquilar')} type="button">Alquilar</button></div><form onSubmit={submitSearch}><label><span>Ubicación</span><select name="location" defaultValue=""><option value="">¿Dónde quieres vivir?</option><option>Madrid</option><option>Barcelona</option><option>Alicante</option><option>Málaga</option><option>Girona</option><option>Valencia</option><option>Mallorca</option><option>Ibiza</option></select></label><label><span>Tipo de propiedad</span><select name="type" defaultValue=""><option value="">Todas las propiedades</option><option>Villa</option><option>Ático</option><option>Apartamento</option><option>Casa</option><option>Casa rural</option><option>Estudio</option></select></label><label><span>Precio máximo</span><select key={operation} name="maxPrice" defaultValue=""><option value="">Sin límite</option>{operation === 'alquilar' ? <><option value="2000">2.000 €/mes</option><option value="3000">3.000 €/mes</option><option value="4000">4.000 €/mes</option></> : <><option value="500000">500.000 €</option><option value="1000000">1.000.000 €</option><option value="2000000">2.000.000 €</option></>}</select></label><button className="search-button" type="submit"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg><span>Buscar</span></button></form></div>
}
export default SearchPanel
