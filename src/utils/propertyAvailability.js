const unavailableStatuses = new Set(['sold', 'removed'])

export function isMarketedProperty(property) {
  return !unavailableStatuses.has(property.listingStatus)
}

export function isUnavailableProperty(property) {
  return unavailableStatuses.has(property.listingStatus)
}
