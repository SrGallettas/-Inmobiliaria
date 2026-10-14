import { useEffect } from 'react'
import { useLocation } from 'react-router'

function ScrollManager() {
  const { pathname, search } = useLocation()
  useEffect(() => {
    const section = new URLSearchParams(search).get('seccion')
    if (pathname === '/' && section) {
      window.requestAnimationFrame(() => document.querySelector(`#${section}`)?.scrollIntoView({ behavior: 'smooth' }))
      return
    }
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname, search])
  return null
}
export default ScrollManager
