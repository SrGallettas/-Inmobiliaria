export function filterProperties(properties, filters) {
  const filtered = properties.filter((property) => {
    const matchesOperation = !filters.operation || property.operation === filters.operation
    const matchesLocation = !filters.location || property.city === filters.location
    const matchesType = !filters.type || property.type === filters.type
    const matchesMinPrice = !filters.minPrice || property.price >= Number(filters.minPrice)
    const matchesMaxPrice = !filters.maxPrice || property.price <= Number(filters.maxPrice)
    const matchesBedrooms = !filters.bedrooms || property.bedrooms >= Number(filters.bedrooms)
    return matchesOperation && matchesLocation && matchesType && matchesMinPrice && matchesMaxPrice && matchesBedrooms
  })

  return [...filtered].sort((a, b) => {
    if (filters.sort === 'price-asc') return a.price - b.price
    if (filters.sort === 'price-desc') return b.price - a.price
    return new Date(b.dateAdded) - new Date(a.dateAdded)
  })
}

export function paramsToFilters(searchParams) {
  return {
    operation: searchParams.get('operation') || 'comprar',
    location: searchParams.get('location') || '',
    type: searchParams.get('type') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    sort: searchParams.get('sort') || 'newest',
  }
}
