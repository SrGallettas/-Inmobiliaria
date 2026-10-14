import { useEffect, useRef, useState } from 'react'
import './PropertyGallery.css'

function PropertyGallery({ images, title }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const closeButtonRef = useRef(null)
  const triggerRef = useRef(null)
  const showPrevious = () => setActiveIndex((current) => (current - 1 + images.length) % images.length)
  const showNext = () => setActiveIndex((current) => (current + 1) % images.length)

  useEffect(() => {
    if (!lightboxOpen) return undefined
    const previousOverflow = document.body.style.overflow
    const galleryTrigger = triggerRef.current
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setLightboxOpen(false)
      if (event.key === 'ArrowLeft') setActiveIndex((current) => (current - 1 + images.length) % images.length)
      if (event.key === 'ArrowRight') setActiveIndex((current) => (current + 1) % images.length)
      if (event.key === 'Tab') {
        const focusable = [...document.querySelectorAll('.lightbox button')]
        const first = focusable[0]
        const last = focusable.at(-1)
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener('keydown', handleKeyDown); galleryTrigger?.focus() }
  }, [lightboxOpen, images.length])

  return <><section className="property-gallery" aria-label={`Galería de ${title}`}><button ref={triggerRef} className="gallery-main" type="button" onClick={() => setLightboxOpen(true)}><img src={images[activeIndex]} alt={`${title}, imagen ${activeIndex + 1}`} fetchPriority="high" /><span>Ampliar imagen</span></button><div className="gallery-thumbs">{images.slice(0, 4).map((image, index) => <button type="button" className={index === activeIndex ? 'active' : ''} onClick={() => setActiveIndex(index)} aria-pressed={index === activeIndex} key={image}><img src={image} alt={`Ver imagen ${index + 1} de ${title}`} loading="lazy" decoding="async" /></button>)}</div><div className="gallery-count" aria-live="polite">{String(activeIndex + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}</div></section>{lightboxOpen && <div className="lightbox" role="dialog" aria-modal="true" aria-label={`Vista ampliada de ${title}`}><button ref={closeButtonRef} className="lightbox-close" type="button" onClick={() => setLightboxOpen(false)} aria-label="Cerrar galería">×</button><button className="lightbox-nav previous" type="button" onClick={showPrevious} aria-label="Imagen anterior">←</button><img src={images[activeIndex]} alt={`${title}, imagen ampliada ${activeIndex + 1}`} /><button className="lightbox-nav next" type="button" onClick={showNext} aria-label="Imagen siguiente">→</button></div>}</>
}
export default PropertyGallery
