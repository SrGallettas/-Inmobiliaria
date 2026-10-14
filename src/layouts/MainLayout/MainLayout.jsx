import { Outlet, useLocation } from 'react-router'
import Header from '../../components/Header/Header'
import Footer from '../../components/Footer/Footer'
import ScrollManager from '../../components/ScrollManager/ScrollManager'

function MainLayout({ favoriteCount }) {
  const { pathname } = useLocation()
  return <div className={`site-shell ${pathname === '/' ? 'home-shell' : 'inner-shell'}`}><ScrollManager /><a className="skip-link" href="#main-content">Saltar al contenido</a><Header favoriteCount={favoriteCount} overlay={pathname === '/'} /><main id="main-content" tabIndex="-1"><Outlet /></main><Footer /></div>
}
export default MainLayout
