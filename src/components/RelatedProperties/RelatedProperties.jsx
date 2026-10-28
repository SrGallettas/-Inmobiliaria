import PropertyCard from '../PropertyCard/PropertyCard'
import { isMarketedProperty } from '../../utils/propertyAvailability'
import './RelatedProperties.css'

function RelatedProperties({ currentProperty, properties, favorites, onFavorite }) {
  const related = properties.filter((property) => isMarketedProperty(property) && property.id !== currentProperty.id && property.operation === currentProperty.operation && (property.city === currentProperty.city || property.type === currentProperty.type)).slice(0, 3)
  if (!related.length) return null
  return <section className="related-section"><div className="container"><p className="eyebrow">También puede interesarte</p><h2>Propiedades similares</h2><div className="related-grid">{related.map((property) => <PropertyCard key={property.id} property={property} isFavorite={favorites.includes(property.id)} onFavorite={onFavorite} />)}</div></div></section>
}
export default RelatedProperties
