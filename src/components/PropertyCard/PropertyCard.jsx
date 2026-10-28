import { Link, useLocation } from 'react-router'
import { formatPrice } from '../../data/properties'
import './PropertyCard.css'

function HeartIcon({ filled }) { return <svg className={filled ? 'filled' : ''} viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" /></svg> }

function PropertyCard({ property, featured, isFavorite, onFavorite }) {
  const location = useLocation()
  const detailState = { from: `${location.pathname}${location.search}` }
  const statusLabel = { reserved: 'Reservada', sold: 'Vendida', removed: 'Retirada' }[property.listingStatus]
  return <article className={`property-card ${featured ? 'property-featured' : ''}`}><div className="property-image-wrap"><Link to={`/inmuebles/${property.id}`} state={detailState} className="property-image-link"><img src={property.image} alt={`${property.title} en ${property.location}`} /></Link>{statusLabel ? <span className={`property-badge property-status-${property.listingStatus}`}>{statusLabel}</span> : property.badge && <span className="property-badge">{property.badge}</span>}<button type="button" className="heart-button" aria-label={isFavorite ? `Quitar ${property.title} de favoritos` : `Añadir ${property.title} a favoritos`} aria-pressed={isFavorite} onClick={() => onFavorite(property.id)}><HeartIcon filled={isFavorite} /></button><span className="property-type">{property.type}</span></div><div className="property-body"><div className="property-topline"><div><p>{property.location}</p><h3><Link to={`/inmuebles/${property.id}`} state={detailState}>{property.title}</Link></h3></div><strong>{formatPrice(property.price, property.operation)}</strong></div><ul><li><b>{property.bedrooms}</b> hab.</li><li><b>{property.bathrooms}</b> baños</li><li><b>{property.area}</b> m²</li></ul></div></article>
}
export default PropertyCard
