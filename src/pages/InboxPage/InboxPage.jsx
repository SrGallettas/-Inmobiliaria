import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import Seo from '../../components/Seo/Seo'
import { getInbox, subscribeToInbox } from '../../services/chatService'
import { formatPrice } from '../../data/properties'
import './InboxPage.css'

const labels = { available: 'Disponible', reserved: 'Reservada', sold: 'Vendida', removed: 'Publicación retirada' }

export default function InboxPage() {
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [realtimeStatus, setRealtimeStatus] = useState('connecting')
  const [realtimeAttempt, setRealtimeAttempt] = useState(0)

  useEffect(() => {
    let active = true

    const loadInbox = async () => {
      try {
        const data = await getInbox()
        if (!active) return
        setItems(data)
        setStatus('ready')
        setError('')
      } catch (requestError) {
        if (!active) return
        setError(requestError.message)
        setStatus('error')
      }
    }

    loadInbox()
    const unsubscribe = subscribeToInbox(
      () => { loadInbox() },
      (nextStatus) => {
        if (!active) return
        setRealtimeStatus(nextStatus)
        if (nextStatus === 'live') loadInbox()
      },
    )

    return () => {
      active = false
      unsubscribe()
    }
  }, [realtimeAttempt])

  const retryRealtime = () => {
    setRealtimeStatus('connecting')
    setRealtimeAttempt((current) => current + 1)
  }

  const disconnected = realtimeStatus === 'error' || realtimeStatus === 'offline'

  return <div className="inbox-page page-space">
    <Seo title="Mensajes" description="Tus conversaciones privadas sobre propiedades de Lumera." noIndex />
    <header className="page-hero container">
      <p className="eyebrow">Bandeja de entrada</p>
      <h1>Tus conversaciones.</h1>
      <p>Consulta mensajes, propiedades y novedades desde un único lugar.</p>
    </header>
    <main className="inbox-list container">
      {disconnected && <div className="realtime-warning" role="alert">
        <span>Sin conexión en directo. La bandeja puede no mostrar los mensajes más recientes.</span>
        <button type="button" onClick={retryRealtime}>Reintentar</button>
      </div>}
      {status === 'loading' && <p>Cargando conversaciones…</p>}
      {error && <p className="submit-error" role="alert">{error}</p>}
      {status === 'ready' && items.length === 0 && <div className="inbox-empty">
        <h2>Todavía no tienes conversaciones</h2>
        <p>Cuando contactes por una vivienda aparecerá aquí.</p>
        <Link className="solid-link" to="/inmuebles">Explorar viviendas</Link>
      </div>}
      {items.map((item) => <Link className={`inbox-item ${item.unreadCount ? 'has-unread' : ''}`} to={item.property_id ? `/mensajes/${item.property_id}` : '#'} key={item.id}>
        <img src={item.property_image} alt="" />
        <div className="inbox-property">
          <div><h2>{item.property_title}</h2><span className={`listing-status status-${item.property_status}`}>{labels[item.property_status]}</span></div>
          <p>{item.property_location} · {formatPrice(item.property_price, item.property_operation)}</p>
          <strong>{item.latestMessage?.content || 'Conversación iniciada'}</strong>
          <time>{new Date(item.latestMessage?.created_at || item.updated_at).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}</time>
          {item.property_status === 'sold' && <em>Esta vivienda se ha vendido. El historial se conserva.</em>}
          {item.property_status === 'removed' && <em>Esta publicación ya no está disponible. El historial se conserva.</em>}
        </div>
        {item.unreadCount > 0 && <b className="unread-count">{item.unreadCount}</b>}
      </Link>)}
    </main>
  </div>
}
