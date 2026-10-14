import { useSearchParams } from 'react-router'
import Filters from '../../components/Filters/Filters'
import PropertyGrid from '../../components/PropertyGrid/PropertyGrid'
import { properties } from '../../data/properties'
import { filterProperties, paramsToFilters } from '../../utils/propertyFilters'
import '../pages.css'

function PropertiesPage({ favorites, onFavorite }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = paramsToFilters(searchParams)
  const visibleProperties = filterProperties(properties, filters)

  const updateFilter = (name, value) => {
    const nextParams = new URLSearchParams(searchParams)
    if (value) nextParams.set(name, value)
    else nextParams.delete(name)
    if (name === 'operation') { nextParams.delete('minPrice'); nextParams.delete('maxPrice') }
    setSearchParams(nextParams)
  }

  const clearFilters = () => setSearchParams({ operation: 'comprar' })

  return <div className="page-space"><header className="page-hero container"><p className="eyebrow">Colección Lumera</p><h1>Encuentra un lugar<br /><em>hecho para ti.</em></h1><p>Viviendas seleccionadas por su arquitectura, ubicación y manera de entender la vida.</p></header><section className="catalogue container"><div className="catalogue-toolbar"><p><strong>{visibleProperties.length}</strong> {visibleProperties.length === 1 ? 'propiedad encontrada' : 'propiedades encontradas'}</p><label className="sort-control">Ordenar por<select name="sort" value={filters.sort} onChange={(event) => updateFilter('sort', event.target.value)}><option value="newest">Más recientes</option><option value="price-asc">Precio: menor a mayor</option><option value="price-desc">Precio: mayor a menor</option></select></label></div><div className="catalogue-layout"><Filters filters={filters} onChange={updateFilter} onClear={clearFilters} /><PropertyGrid properties={visibleProperties} favorites={favorites} onFavorite={onFavorite} onClear={clearFilters} /></div></section></div>
}
export default PropertiesPage
