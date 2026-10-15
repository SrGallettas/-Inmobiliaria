import { useEffect } from 'react'
import defaultImage from '../../assets/hero.png'

const siteName = 'Lumera Inmobiliaria'

function findOrCreateMeta(attribute, value) {
  let element = document.head.querySelector(`meta[${attribute}="${value}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, value)
    document.head.append(element)
  }
  return element
}

function Seo({ title, description, image = defaultImage, type = 'website', noIndex = false, canonicalPath }) {
  useEffect(() => {
    const fullTitle = title === siteName ? title : `${title} — ${siteName}`
    const origin = window.location.origin
    const canonicalUrl = new URL(canonicalPath || window.location.pathname, origin).href
    const imageUrl = new URL(image, origin).href
    const meta = (attribute, value, content) => findOrCreateMeta(attribute, value).setAttribute('content', content)

    document.title = fullTitle
    meta('name', 'description', description)
    meta('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow')
    meta('property', 'og:site_name', siteName)
    meta('property', 'og:title', fullTitle)
    meta('property', 'og:description', description)
    meta('property', 'og:type', type)
    meta('property', 'og:url', canonicalUrl)
    meta('property', 'og:image', imageUrl)
    meta('name', 'twitter:card', 'summary_large_image')
    meta('name', 'twitter:title', fullTitle)
    meta('name', 'twitter:description', description)
    meta('name', 'twitter:image', imageUrl)

    let canonical = document.head.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.append(canonical)
    }
    canonical.setAttribute('href', canonicalUrl)
  }, [canonicalPath, description, image, noIndex, title, type])

  return null
}

export default Seo
