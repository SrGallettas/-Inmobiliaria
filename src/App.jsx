import { lazy, Suspense, useEffect, useState } from 'react'
import { Route, Routes, useParams } from 'react-router'
import Seo from './components/Seo/Seo'
import MainLayout from './layouts/MainLayout/MainLayout'
import HomePage from './pages/HomePage/HomePage'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import { formatPrice, properties as localProperties } from './data/properties'
import { loadFavorites, saveFavorites } from './utils/favoritesStorage'

const PropertyDetailPage = lazy(() => import('./pages/PropertyDetailPage/PropertyDetailPage'))
const PropertiesPage = lazy(() => import('./pages/PropertiesPage/PropertiesPage'))
const FavoritesPage = lazy(() => import('./pages/FavoritesPage/FavoritesPage'))
const ContactPage = lazy(() => import('./pages/ContactPage/ContactPage'))
const FaqPage = lazy(() => import('./pages/FaqPage/FaqPage'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage/PrivacyPage'))
const CookiesPage = lazy(() => import('./pages/CookiesPage/CookiesPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage/NotFoundPage'))
const LoginPage = lazy(() => import('./pages/AuthPages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/AuthPages/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('./pages/AuthPages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/AuthPages/ResetPasswordPage'))
const AccountPage = lazy(() => import('./pages/AuthPages/AccountPage'))
const ChatPage = lazy(() => import('./pages/ChatPage/ChatPage'))
const InboxPage = lazy(() => import('./pages/InboxPage/InboxPage'))
const AssistantWidget = lazy(() => import('./components/AssistantWidget/AssistantWidget'))
const MyPropertiesPage = lazy(() => import('./pages/MyPropertiesPage/MyPropertiesPage'))

function RouteLoading() {
  return <section className="route-loading page-space" role="status">Cargando página…</section>
}

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
  return <>
    <Suspense fallback={<RouteLoading />}>
      <Routes><Route element={<MainLayout favoriteCount={favorites.length} />}>
        <Route index element={<HomePage {...sharedProps} />} />
        <Route path="inmuebles" element={<PropertiesPage {...sharedProps} />} />
        <Route path="inmuebles/:propertyId" element={<PropertyRoute {...sharedProps} />} />
        <Route path="mensajes" element={<ProtectedRoute><InboxPage /></ProtectedRoute>} />
        <Route path="mensajes/:propertyId" element={<ProtectedRoute><ChatPage properties={properties} /></ProtectedRoute>} />
        <Route path="favoritos" element={<FavoritesPage {...sharedProps} />} />
        <Route path="contacto" element={<ContactPage />} />
        <Route path="entrar" element={<LoginPage />} />
        <Route path="registro" element={<RegisterPage />} />
        <Route path="recuperar-contrasena" element={<ForgotPasswordPage />} />
        <Route path="restablecer-contrasena" element={<ResetPasswordPage />} />
        <Route path="mi-cuenta" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
        <Route path="mis-viviendas" element={<ProtectedRoute><MyPropertiesPage /></ProtectedRoute>} />
        <Route path="preguntas-frecuentes" element={<><Seo title="Preguntas frecuentes" description="Resolvemos las dudas habituales sobre visitas, favoritos, compra, alquiler, venta y valoración de propiedades con Lumera." /><FaqPage /></>} />
        <Route path="privacidad" element={<><Seo title="Política de privacidad" description="Información sobre el tratamiento y la protección de datos personales en Lumera Inmobiliaria." /><PrivacyPage /></>} />
        <Route path="cookies" element={<><Seo title="Política de cookies" description="Información sobre cookies y almacenamiento local utilizado por Lumera Inmobiliaria." /><CookiesPage /></>} />
        <Route path="*" element={<><Seo title="Página no encontrada" description="La página solicitada no existe en Lumera Inmobiliaria." noIndex /><NotFoundPage /></>} />
      </Route></Routes>
    </Suspense>
    <Suspense fallback={null}><AssistantWidget properties={properties} /></Suspense>
  </>
}
export default App
