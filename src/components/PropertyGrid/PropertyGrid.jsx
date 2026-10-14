import PropertyCard from '../PropertyCard/PropertyCard'

function PropertyGrid({ properties, favorites, onFavorite, onClear }) {
  if (properties.length === 0) return <div className="empty-results"><span>0</span><h2>No hemos encontrado viviendas</h2><p>Prueba a ampliar el precio, cambiar la ubicación o eliminar algún filtro.</p><button type="button" onClick={onClear}>Limpiar filtros</button></div>
  return <div className="catalogue-grid">{properties.map((property) => <PropertyCard key={property.id} property={property} isFavorite={favorites.includes(property.id)} onFavorite={onFavorite} />)}</div>
}
export default PropertyGrid
