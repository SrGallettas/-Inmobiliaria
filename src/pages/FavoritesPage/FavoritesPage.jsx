import { Link } from 'react-router'
import PropertyCard from '../../components/PropertyCard/PropertyCard'
import Seo from '../../components/Seo/Seo'
import { properties as localProperties } from '../../data/properties'
import '../pages.css'

function FavoritesPage({ favorites, onFavorite, properties = localProperties }) {
  const favoriteProperties = properties.filter((property) => favorites.includes(property.id))

  return <div className="favorites-page page-space"><Seo title="Mis propiedades favoritas" description="Consulta y compara las viviendas que has guardado en Lumera." noIndex /><header className="page-hero container"><p className="eyebrow">Tu selección</p><h1>Casas que merece la pena<br /><em>volver a mirar.</em></h1><p>Guardamos tus propiedades favoritas en este navegador para que puedas compararlas con calma.</p></header><section className="favorites-content container" aria-live="polite">{favoriteProperties.length > 0 ? <><div className="favorites-toolbar"><p><strong>{favoriteProperties.length}</strong> {favoriteProperties.length === 1 ? 'propiedad guardada' : 'propiedades guardadas'}</p><Link to="/inmuebles" className="text-link">Seguir explorando →</Link></div><div className="catalogue-grid">{favoriteProperties.map((property) => <PropertyCard key={property.id} property={property} isFavorite onFavorite={onFavorite} />)}</div></> : <div className="favorites-empty"><span aria-hidden="true">♡</span><h2>Todavía no has guardado ninguna casa</h2><p>Pulsa el corazón de una propiedad para añadirla a esta selección. Se conservará aunque cierres el navegador.</p><Link to="/inmuebles" className="solid-link">Explorar propiedades</Link></div>}</section></div>
}

export default FavoritesPage
