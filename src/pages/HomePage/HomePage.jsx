import { Link } from 'react-router'
import SearchPanel from '../../components/SearchPanel/SearchPanel'
import PropertyCard from '../../components/PropertyCard/PropertyCard'
import Seo from '../../components/Seo/Seo'
import { properties as localProperties } from '../../data/properties'
import '../../App.css'

const cities = [
  { name: 'Madrid', region: 'Comunidad de Madrid', image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=900&q=85' },
  { name: 'Barcelona', region: 'Cataluña', image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=900&q=85' },
  { name: 'Málaga', region: 'Andalucía', image: 'https://images.unsplash.com/photo-1504512485720-7d83a16ee930?auto=format&fit=crop&w=900&q=85' },
  { name: 'Valencia', region: 'Comunidad Valenciana', image: 'https://images.unsplash.com/photo-1577990432593-6bf35f43beed?auto=format&fit=crop&w=900&q=85' },
  { name: 'Alicante', region: 'Comunidad Valenciana', image: 'https://images.unsplash.com/photo-1552057031-5071f53c5757?auto=format&fit=crop&w=900&q=85' },
  { name: 'Girona', region: 'Cataluña', image: 'https://images.unsplash.com/photo-1706001545123-f9eac6636514?auto=format&fit=crop&w=900&q=85' },
]
function ArrowIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg> }

function HomePage({ favorites, onFavorite, properties = localProperties }) {
  const featuredProperties = properties.filter((property) => property.featured)
  return <>
    <Seo title="Lumera Inmobiliaria" description="Viviendas seleccionadas en las mejores ciudades y destinos de España. Encuentra una casa con carácter para comprar o alquilar." />
    <section className="hero-section" aria-labelledby="hero-title"><div className="hero-image" role="img" aria-label="Villa contemporánea frente al mar" /><div className="hero-shade" /><div className="hero-content container"><p className="eyebrow light">Viviendas excepcionales · España</p><h1 id="hero-title">Tu próximo capítulo<br />empieza <em>aquí.</em></h1><p className="hero-copy">Una selección cuidada de hogares con carácter, en los lugares donde realmente quieres vivir.</p><SearchPanel /></div><div className="hero-index" aria-hidden="true"><span>01</span><i /><span>04</span></div><button className="scroll-cue" type="button" onClick={() => document.querySelector('#destacadas')?.scrollIntoView({ behavior: 'smooth' })}><span>Descubrir</span><span aria-hidden="true">↓</span></button></section>
    <section className="intro-section container"><p className="eyebrow">Otra forma de encontrar casa</p><div className="intro-grid"><h2>No buscamos propiedades.<br /><em>Encontramos lugares.</em></h2><div className="intro-copy"><p>Creemos que una casa no se elige solo por sus metros cuadrados. Se elige por cómo entra la luz, por el barrio que la rodea y por la vida que imaginas dentro.</p><Link to="/inmuebles" className="text-link">Conoce nuestra selección <ArrowIcon /></Link></div></div></section>
    <section className="properties-section" id="destacadas"><div className="container"><div className="section-heading"><div><p className="eyebrow">Selección de la semana</p><h2>Propiedades destacadas</h2></div><Link to="/inmuebles" className="outline-link">Ver todas <ArrowIcon /></Link></div><div className="property-grid">{featuredProperties.map((property, index) => <PropertyCard key={property.id} property={property} featured={index === 0} isFavorite={favorites.includes(property.id)} onFavorite={onFavorite} />)}</div></div></section>
    <section className="manifesto-section" id="metodo"><div className="manifesto-photo" role="img" aria-label="Interior luminoso de una vivienda mediterránea" /><div className="manifesto-content"><p className="eyebrow light">El valor de elegir bien</p><blockquote>“Una buena vivienda mejora tu vida incluso antes de cruzar la puerta.”</blockquote><p>Visitamos, comprobamos y seleccionamos cada propiedad para que tú solo tengas que decidir dónde quieres empezar.</p><Link to="/contacto" className="light-link">Nuestro método <ArrowIcon /></Link></div></section>
    <section className="areas-section container" id="zonas"><div className="section-heading"><div><p className="eyebrow">Destinos para vivir</p><h2>Ciudades con carácter</h2></div><p className="section-description">Descubre nuestra selección de viviendas en algunas de las ciudades más especiales de España.</p></div><div className="areas-grid">{cities.map((city, index) => { const homes = properties.filter((property) => property.city === city.name && property.operation === 'comprar').length; return <Link className={`area-card area-card-${index + 1}`} to={`/inmuebles?operation=comprar&location=${encodeURIComponent(city.name)}`} aria-label={`Ver viviendas en ${city.name}`} key={city.name}><img src={city.image} alt={`Vista de ${city.name}`} loading="lazy" decoding="async" /><div className="area-overlay" /><div className="area-info"><span>{city.region}</span><h3>{city.name}</h3><p>{homes} {homes === 1 ? 'vivienda' : 'viviendas'}</p></div><span className="area-arrow"><ArrowIcon /></span></Link> })}</div></section>
    <section className="cta-section"><div className="container cta-inner"><p className="eyebrow">¿Tienes una propiedad especial?</p><h2>Hablemos de ella.</h2><p>Te acompañamos en todo el proceso de venta, con una valoración honesta y una presentación a la altura.</p><Link to="/contacto" className="solid-link">Solicitar valoración <ArrowIcon /></Link></div></section>
  </>
}
export default HomePage
