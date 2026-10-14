const FAVORITES_KEY = 'lumera:favorites'

export function loadFavorites(storage = globalThis.localStorage) {
  try {
    const storedFavorites = JSON.parse(storage?.getItem(FAVORITES_KEY) || '[]')
    if (!Array.isArray(storedFavorites)) return []
    return [...new Set(storedFavorites.filter((id) => Number.isInteger(id) && id > 0))]
  } catch {
    return []
  }
}

export function saveFavorites(favorites, storage = globalThis.localStorage) {
  try {
    storage?.setItem(FAVORITES_KEY, JSON.stringify(favorites))
  } catch {
    // La aplicación sigue funcionando aunque el navegador bloquee localStorage.
  }
}
