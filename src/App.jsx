import { useEffect, useState } from 'react'
import { Route, Routes, useParams } from 'react-router'
import Seo from './components/Seo/Seo'
import MainLayout from './layouts/MainLayout/MainLayout'
import HomePage from './pages/HomePage/HomePage'
import PropertiesPage from './pages/PropertiesPage/PropertiesPage'
import PropertyDetailPage from './pages/PropertyDetailPage/PropertyDetailPage'
import FavoritesPage from './pages/FavoritesPage/FavoritesPage'
import ContactPage from './pages/ContactPage/ContactPage'
import FaqPage from './pages/FaqPage/FaqPage'
import PrivacyPage from './pages/PrivacyPage/PrivacyPage'
import CookiesPage from './pages/CookiesPage/CookiesPage'
import NotFoundPage from './pages/NotFoundPage/NotFoundPage'
import LoginPage from './pages/AuthPages/LoginPage'
import RegisterPage from './pages/AuthPages/RegisterPage'
import ForgotPasswordPage from './pages/AuthPages/ForgotPasswordPage'
import ResetPasswordPage from './pages/AuthPages/ResetPasswordPage'
import AccountPage from './pages/AuthPages/AccountPage'
import ChatPage from './pages/ChatPage/ChatPage'
import InboxPage from './pages/InboxPage/InboxPage'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import { formatPrice, properties as localProperties } from './data/properties'
import { loadFavorites, saveFavorites } from './utils/favoritesStorage'

function PropertyRoute(props) {
  const { propertyId } = useParams()
  const property = props.properties.find((item) => item.id === Number(propertyId))
  const title = property?.title || 'Propiedad no encontrada'
  const description = property
    ? `${property.type} en ${property.location} por ${formatPrice(property.price, property.operation)}. ${property.bedrooms} dormitorios, ${property.bathrooms} baños y ${property.area} m².`
    : 'La propiedad solicitada ya no está disponible en Lumera.'

  return <><Seo title={title} description={description} image={property?.image} type={property ? 'product' : 'website'} noIndex={!property} /><PropertyDetailPage {...props} /></>
}

function App() {
  const [favorites, setFavorites] = useState(loadFavorites)
  const [properties, setProperties] = useState(localProperties)
  const [catalogStatus, setCatalogStatus] = useState('loading')

  useEffect(() => {
    let active = true
    let unsubscribe = () => {}
    const applyProperties = (result) => {
      if (!active) return
      setProperties(result.properties)
      setCatalogStatus(result.source === 'supabase' ? 'remote' : 'local')
    }
    import('./services/propertiesService')
      .then(async ({ getProperties, subscribeToProperties }) => {
        applyProperties(await getProperties())
        if (!active) return
        unsubscribe = subscribeToProperties(() => getProperties().then(applyProperties).catch(() => { if (active) setCatalogStatus('error') }))
      })
      .catch(() => {
        if (active) setCatalogStatus('error')
      })
    return () => { active = false; unsubscribe() }
  }, [])

  useEffect(() => {
    saveFavorites(favorites)
  }, [favorites])

  const toggleFavorite = (propertyId) => setFavorites((current) => current.includes(propertyId) ? current.filter((id) => id !== propertyId) : [...current, propertyId])
  const sharedProps = { favorites, onFavorite: toggleFavorite, properties, catalogStatus }
  return <Routes><Route element={<MainLayout favoriteCount={favorites.length} />}><Route index element={<HomePage {...sharedProps} />} /><Route path="inmuebles" element={<PropertiesPage {...sharedProps} />} /><Route path="inmuebles/:propertyId" element={<PropertyRoute {...sharedProps} />} /><Route path="mensajes" element={<ProtectedRoute><InboxPage /></ProtectedRoute>} /><Route path="mensajes/:propertyId" element={<ProtectedRoute><ChatPage properties={properties} /></ProtectedRoute>} /><Route path="favoritos" element={<FavoritesPage {...sharedProps} />} /><Route path="contacto" element={<ContactPage />} /><Route path="entrar" element={<LoginPage />} /><Route path="registro" element={<RegisterPage />} /><Route path="recuperar-contrasena" element={<ForgotPasswordPage />} /><Route path="restablecer-contrasena" element={<ResetPasswordPage />} /><Route path="mi-cuenta" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} /><Route path="preguntas-frecuentes" element={<><Seo title="Preguntas frecuentes" description="Resolvemos las dudas habituales sobre visitas, favoritos, compra, alquiler, venta y valoración de propiedades con Lumera." /><FaqPage /></>} /><Route path="privacidad" element={<><Seo title="Política de privacidad" description="Información sobre el tratamiento y la protección de datos personales en Lumera Inmobiliaria." /><PrivacyPage /></>} /><Route path="cookies" element={<><Seo title="Política de cookies" description="Información sobre cookies y almacenamiento local utilizado por Lumera Inmobiliaria." /><CookiesPage /></>} /><Route path="*" element={<><Seo title="Página no encontrada" description="La página solicitada no existe en Lumera Inmobiliaria." noIndex /><NotFoundPage /></>} /></Route></Routes>
}
export default App
