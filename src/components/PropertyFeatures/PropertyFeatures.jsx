import './PropertyFeatures.css'

function PropertyFeatures({ property, details }) {
  return <section className="property-features"><div className="technical-grid"><div><span>Superficie</span><strong>{property.area} m²</strong></div><div><span>Construcción</span><strong>{details.year}</strong></div><div><span>Planta</span><strong>{details.floor}</strong></div><div><span>Eficiencia</span><strong className={`energy energy-${details.energyRating.toLowerCase()}`}>{details.energyRating}</strong></div></div><div className="features-list"><h2>Lo que hace especial esta vivienda</h2><ul>{details.features.map((feature) => <li key={feature}><span>✓</span>{feature}</li>)}</ul></div></section>
}
export default PropertyFeatures
