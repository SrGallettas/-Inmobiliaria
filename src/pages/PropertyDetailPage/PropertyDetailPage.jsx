import { useEffect } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import PropertyGallery from '../../components/PropertyGallery/PropertyGallery'
import PropertyFeatures from '../../components/PropertyFeatures/PropertyFeatures'
import VisitForm from '../../components/VisitForm/VisitForm'
import RelatedProperties from '../../components/RelatedProperties/RelatedProperties'
import { properties as localProperties, formatPrice, getPropertyDetails } from '../../data/properties'
import '../pages.css'

function PropertyDetailPage({ favorites, onFavorite, properties = localProperties }) {
  const { propertyId } = useParams()
  const location = useLocation()
  const property = properties.find((item) => item.id === Number(propertyId))
  const backTo = location.state?.from?.startsWith('/inmuebles') ? location.state.from : '/inmuebles'

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [property])

  if (!property) return <section className="not-found page-space"><p className="eyebrow">Propiedad no encontrada</p><h1>Esta vivienda ya no está disponible.</h1><Link to="/inmuebles" className="solid-link">Volver al catálogo</Link></section>

  const details = getPropertyDetails(property)
  const isFavorite = favorites.includes(property.id)

  return <article className="detail-page page-space"><div className="detail-breadcrumb container"><Link to="/">Inicio</Link><span>/</span><Link to={backTo}>Inmuebles</Link><span>/</span><strong>{property.title}</strong></div><PropertyGallery images={details.gallery} title={property.title} /><div className="detail-content container"><div className="detail-heading"><p className="eyebrow">{property.type} · {property.location}</p><h1>{property.title}</h1><p className="detail-price">{formatPrice(property.price, property.operation)}</p></div><button className="detail-favorite" type="button" aria-pressed={isFavorite} onClick={() => onFavorite(property.id)}>{isFavorite ? '♥ Guardada en favoritos' : '♡ Añadir a favoritos'}</button><ul className="detail-facts"><li><strong>{property.bedrooms}</strong><span>Dormitorios</span></li><li><strong>{property.bathrooms}</strong><span>Baños</span></li><li><strong>{property.area}</strong><span>Metros cuadrados</span></li></ul><div className="detail-main"><div><section className="detail-description"><p className="eyebrow">La propiedad</p><h2>Un hogar con carácter</h2><p>{details.description}</p><p>La distribución diferencia con naturalidad las zonas sociales de los espacios más privados, mientras los materiales y la luz aportan continuidad a toda la vivienda.</p></section><PropertyFeatures property={property} details={details} /><Link to={backTo} className="back-link">← Volver a los resultados</Link></div><VisitForm property={property} /></div></div><RelatedProperties currentProperty={property} properties={properties} favorites={favorites} onFavorite={onFavorite} /></article>
}
export default PropertyDetailPage
