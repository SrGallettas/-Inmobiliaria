import { useState } from 'react'
import { Route, Routes } from 'react-router'
import MainLayout from './layouts/MainLayout/MainLayout'
import HomePage from './pages/HomePage/HomePage'
import PropertiesPage from './pages/PropertiesPage/PropertiesPage'
import PropertyDetailPage from './pages/PropertyDetailPage/PropertyDetailPage'
import ContactPage from './pages/ContactPage/ContactPage'
import NotFoundPage from './pages/NotFoundPage/NotFoundPage'

function App() {
  const [favorites, setFavorites] = useState([])
  const toggleFavorite = (propertyId) => setFavorites((current) => current.includes(propertyId) ? current.filter((id) => id !== propertyId) : [...current, propertyId])
  const sharedProps = { favorites, onFavorite: toggleFavorite }
  return <Routes><Route element={<MainLayout favoriteCount={favorites.length} />}><Route index element={<HomePage {...sharedProps} />} /><Route path="inmuebles" element={<PropertiesPage {...sharedProps} />} /><Route path="inmuebles/:propertyId" element={<PropertyDetailPage {...sharedProps} />} /><Route path="contacto" element={<ContactPage />} /><Route path="*" element={<NotFoundPage />} /></Route></Routes>
}
export default App
