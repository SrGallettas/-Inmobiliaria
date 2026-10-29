import { properties as localProperties } from '../../data/properties'
import './Filters.css'

function SelectFilter({ label, name, value, onChange, children }) {
  return <label>{label}<select name={name} value={value} onChange={onChange}>{children}</select></label>
}

function Filters({ filters, onChange, onClear, properties = localProperties }) {
  const locations = [...new Set(properties.map((property) => property.city))].sort()
  const types = [...new Set(properties.map((property) => property.type))].sort()
  const update = (event) => onChange(event.target.name, event.target.value)
  const rental = filters.operation === 'alquilar'

  return <aside className="filters-panel" aria-label="Filtros de propiedades">
    <div className="filter-heading"><h2>Filtrar resultados</h2><button type="button" onClick={onClear}>Limpiar todo</button></div>
    <div className="operation-control"><button type="button" className={filters.operation === 'comprar' ? 'active' : ''} onClick={() => onChange('operation', 'comprar')}>Comprar</button><button type="button" className={rental ? 'active' : ''} onClick={() => onChange('operation', 'alquilar')}>Alquilar</button></div>
    <SelectFilter label="Ubicación" name="location" value={filters.location} onChange={update}><option value="">Toda España</option>{locations.map((location) => <option key={location}>{location}</option>)}</SelectFilter>
    <SelectFilter label="Tipo de propiedad" name="type" value={filters.type} onChange={update}><option value="">Todos los tipos</option>{types.map((type) => <option key={type}>{type}</option>)}</SelectFilter>
    <div className="price-fields">
      <SelectFilter label="Precio mínimo" name="minPrice" value={filters.minPrice} onChange={update}><option value="">Sin mínimo</option>{rental ? <><option value="1500">1.500 €</option><option value="2500">2.500 €</option><option value="3500">3.500 €</option></> : <><option value="500000">500.000 €</option><option value="750000">750.000 €</option><option value="1000000">1.000.000 €</option></>}</SelectFilter>
      <SelectFilter label="Precio máximo" name="maxPrice" value={filters.maxPrice} onChange={update}><option value="">Sin máximo</option>{rental ? <><option value="2000">2.000 €</option><option value="3000">3.000 €</option><option value="4000">4.000 €</option></> : <><option value="750000">750.000 €</option><option value="1000000">1.000.000 €</option><option value="2000000">2.000.000 €</option><option value="3500000">3.500.000 €</option></>}</SelectFilter>
    </div>
    <SelectFilter label="Dormitorios mínimos" name="bedrooms" value={filters.bedrooms} onChange={update}><option value="">Cualquiera</option><option value="1">1 o más</option><option value="2">2 o más</option><option value="3">3 o más</option><option value="4">4 o más</option></SelectFilter>
    <SelectFilter label="Baños mínimos" name="bathrooms" value={filters.bathrooms} onChange={update}><option value="">Cualquiera</option><option value="1">1 o más</option><option value="2">2 o más</option><option value="3">3 o más</option></SelectFilter>
    <SelectFilter label="Superficie mínima" name="minArea" value={filters.minArea} onChange={update}><option value="">Cualquiera</option><option value="80">80 m²</option><option value="120">120 m²</option><option value="200">200 m²</option></SelectFilter>
  </aside>
}

export default Filters
