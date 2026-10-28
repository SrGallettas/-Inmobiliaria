import { useSearchParams } from 'react-router'
import Filters from '../../components/Filters/Filters'
import PropertyGrid from '../../components/PropertyGrid/PropertyGrid'
import Seo from '../../components/Seo/Seo'
import { properties as localProperties } from '../../data/properties'
import { filterProperties, paramsToFilters } from '../../utils/propertyFilters'
import { isMarketedProperty } from '../../utils/propertyAvailability'
import '../pages.css'

function CatalogStatus({ status }) {
  if (status === 'remote' || !status) return null

  const message = status === 'loading'
    ? 'Actualizando el catálogo…'
    : status === 'local'
      ? 'Estás viendo el catálogo de demostración. Conecta Supabase para cargar las propiedades publicadas.'
      : 'No hemos podido conectar con el catálogo. Mostramos una copia local para que puedas seguir navegando.'

  return <div className={`catalog-status catalog-status-${status}`} role="status" aria-live="polite">{message}</div>
}

function PropertiesPage({ favorites, onFavorite, properties = localProperties, catalogStatus }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = paramsToFilters(searchParams)
  const visibleProperties = filterProperties(properties.filter(isMarketedProperty), filters)

  const updateFilter = (name, value) => {
    const nextParams = new URLSearchParams(searchParams)
    if (value) nextParams.set(name, value)
    else nextParams.delete(name)
    if (name === 'operation') { nextParams.delete('minPrice'); nextParams.delete('maxPrice') }
    setSearchParams(nextParams)
  }

  const clearFilters = () => setSearchParams({ operation: 'comprar' })

  return <div className="page-space"><Seo title="Viviendas en venta y alquiler" description="Explora la colección de viviendas de Lumera y filtra por ciudad, tipo, precio y número de dormitorios." /><header className="page-hero container"><p className="eyebrow">Colección Lumera</p><h1>Encuentra un lugar<br /><em>hecho para ti.</em></h1><p>Viviendas seleccionadas por su arquitectura, ubicación y manera de entender la vida.</p></header><section className="catalogue container"><CatalogStatus status={catalogStatus} /><div className="catalogue-toolbar"><p><strong>{visibleProperties.length}</strong> {visibleProperties.length === 1 ? 'propiedad encontrada' : 'propiedades encontradas'}</p><label className="sort-control">Ordenar por<select name="sort" value={filters.sort} onChange={(event) => updateFilter('sort', event.target.value)}><option value="newest">Más recientes</option><option value="price-asc">Precio: menor a mayor</option><option value="price-desc">Precio: mayor a menor</option></select></label></div><div className="catalogue-layout"><Filters filters={filters} onChange={updateFilter} onClear={clearFilters} /><PropertyGrid properties={visibleProperties} favorites={favorites} onFavorite={onFavorite} onClear={clearFilters} /></div></section></div>
}
export default PropertiesPage
