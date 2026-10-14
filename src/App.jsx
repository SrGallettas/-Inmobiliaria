import { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router'
import MainLayout from './layouts/MainLayout/MainLayout'
import HomePage from './pages/HomePage/HomePage'
import PropertiesPage from './pages/PropertiesPage/PropertiesPage'
import PropertyDetailPage from './pages/PropertyDetailPage/PropertyDetailPage'
import FavoritesPage from './pages/FavoritesPage/FavoritesPage'
import ContactPage from './pages/ContactPage/ContactPage'
import NotFoundPage from './pages/NotFoundPage/NotFoundPage'
import { loadFavorites, saveFavorites } from './utils/favoritesStorage'

function App() {
  const [favorites, setFavorites] = useState(loadFavorites)

  useEffect(() => {
    saveFavorites(favorites)
  }, [favorites])

  const toggleFavorite = (propertyId) => setFavorites((current) => current.includes(propertyId) ? current.filter((id) => id !== propertyId) : [...current, propertyId])
  const sharedProps = { favorites, onFavorite: toggleFavorite }
  return <Routes><Route element={<MainLayout favoriteCount={favorites.length} />}><Route index element={<HomePage {...sharedProps} />} /><Route path="inmuebles" element={<PropertiesPage {...sharedProps} />} /><Route path="inmuebles/:propertyId" element={<PropertyDetailPage {...sharedProps} />} /><Route path="favoritos" element={<FavoritesPage {...sharedProps} />} /><Route path="contacto" element={<ContactPage />} /><Route path="*" element={<NotFoundPage />} /></Route></Routes>
}
export default App
