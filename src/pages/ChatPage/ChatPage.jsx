import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import { useAuth } from '../../auth/useAuth'
import Seo from '../../components/Seo/Seo'
import { getMessages, getOrCreateConversation, markConversationRead, sendMessage, sendMessageWithMedia, subscribeToMessages, validateChatMedia } from '../../services/chatService'
import { formatPrice } from '../../data/properties'
import './ChatPage.css'

const realtimeLabels = {
  live: 'En directo',
  connecting: 'Conectando…',
  error: 'Sin conexión',
  offline: 'Sin conexión',
}

export default function ChatPage({ properties }) {
  const { propertyId } = useParams()
  const { user } = useAuth()
  const property = properties.find((item) => item.id === Number(propertyId))
  const [conversation, setConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [content, setContent] = useState('')
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('loading')
  const [realtimeStatus, setRealtimeStatus] = useState('connecting')
  const [realtimeError, setRealtimeError] = useState('')
  const [realtimeAttempt, setRealtimeAttempt] = useState(0)
  const [error, setError] = useState('')
  const fileInput = useRef(null)

  useEffect(() => {
    if (!property) return undefined
    let active = true
    let unsubscribe = () => {}

    const refreshMessages = async (conversationId) => {
      const history = await getMessages(conversationId)
      await markConversationRead(conversationId)
      if (active) setMessages(history)
    }

    const recoverMissedChanges = async (conversationId) => {
      try {
        const [currentConversation] = await Promise.all([
          getOrCreateConversation(property.id),
          refreshMessages(conversationId),
        ])
        if (!active) return
        setConversation(currentConversation)
        setRealtimeError('')
      } catch {
        if (active) setRealtimeError('La conexión volvió, pero no hemos podido actualizar la conversación.')
      }
    }

    getOrCreateConversation(property.id).then(async (value) => {
      await refreshMessages(value.id)
      if (!active) return
      setConversation(value)
      setStatus('ready')
      setError('')
      unsubscribe = subscribeToMessages(
        value.id,
        async (payload) => {
          try {
            if (payload.table === 'conversations' && payload.new) {
              setConversation(payload.new)
              setError('')
              if (['sold', 'removed'].includes(payload.new.property_status)) {
                setFile(null)
                if (fileInput.current) fileInput.current.value = ''
              }
            }
            await refreshMessages(value.id)
            if (active) setRealtimeError('')
          } catch {
            if (active) setRealtimeError('Ha llegado un cambio, pero no hemos podido actualizar el historial.')
          }
        },
        (nextStatus) => {
          if (!active) return
          setRealtimeStatus(nextStatus)
          if (nextStatus === 'live') recoverMissedChanges(value.id)
          if (nextStatus === 'error' || nextStatus === 'offline') {
            setRealtimeError('La conexión en directo se ha interrumpido. Puede que falten mensajes recientes.')
          }
        },
      )
    }).catch((requestError) => {
      if (!active) return
      setError(requestError.message)
      setStatus('error')
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [property, user.id, realtimeAttempt])

  const activeConversation = conversation?.property_id === property?.id ? conversation : null
  const displayedRealtimeStatus = activeConversation ? realtimeStatus : 'connecting'
  const listingStatus = activeConversation?.property_status || property?.listingStatus || 'available'
  const unavailable = ['sold', 'removed'].includes(listingStatus)
  const disconnected = realtimeStatus === 'error' || realtimeStatus === 'offline'

  const retryRealtime = () => {
    setRealtimeStatus('connecting')
    setRealtimeError('')
    setRealtimeAttempt((current) => current + 1)
  }

  const selectFile = (event) => {
    const selectedFile = event.target.files?.[0] || null
    try {
      if (selectedFile) validateChatMedia(selectedFile)
      setFile(selectedFile)
      setError('')
    } catch (requestError) {
      setFile(null)
      event.target.value = ''
      setError(requestError.message)
    }
  }

  const submit = async (event) => {
    event.preventDefault()
    if (unavailable) {
      setError('Esta propiedad ya no admite nuevos mensajes.')
      return
    }
    if (!content.trim() && !file) {
      setError('Escribe un mensaje o adjunta un archivo.')
      return
    }
    setStatus('sending')
    setError('')
    try {
      if (file) await sendMessageWithMedia(conversation.id, user.id, content, file)
      else await sendMessage(conversation.id, user.id, content)
      setMessages(await getMessages(conversation.id))
      setContent('')
      setFile(null)
      if (fileInput.current) fileInput.current.value = ''
      setStatus('ready')
    } catch (requestError) {
      setError(requestError.message)
      if (requestError.message.includes('ya no admite mensajes')) {
        try {
          setConversation(await getOrCreateConversation(property.id))
        } catch { /* Se conserva el error original del envío. */ }
      }
      setStatus('ready')
    }
  }

  if (!property) return <section className="not-found page-space"><h1>Esta propiedad no está disponible.</h1><Link to="/inmuebles" className="solid-link">Volver al catálogo</Link></section>

  return <div className="chat-page page-space">
    <Seo title={`Conversación sobre ${property.title}`} description={`Consulta privada sobre ${property.title}.`} noIndex />
    <div className="chat-shell container">
      <aside className="chat-property">
        <img src={property.image} alt="" />
        <div><p className="eyebrow">Estás preguntando por</p><h1>{property.title}</h1><p>{property.location}</p><strong>{formatPrice(property.price, property.operation)}</strong><Link to={`/inmuebles/${property.id}`}>Ver la propiedad</Link></div>
      </aside>
      <section className="chat-panel" aria-label={`Conversación sobre ${property.title}`}>
        <header><div><span className={`chat-status-dot is-${displayedRealtimeStatus}`} />Lumera</div><small>{realtimeLabels[displayedRealtimeStatus]}</small></header>
        {(disconnected || realtimeError) && <div className="chat-realtime-warning" role="alert">
          <span>{realtimeError || 'La conexión en directo se ha interrumpido.'}</span>
          <button type="button" onClick={retryRealtime}>Reintentar</button>
        </div>}
        {unavailable && <div className="chat-closed-notice" role="status"><strong>{listingStatus === 'sold' ? 'Vivienda vendida' : 'Publicación retirada'}</strong><span>La conversación se conserva como historial, pero ya no admite nuevos mensajes.</span></div>}
        <div className="message-list" aria-live="polite">
          {status === 'loading' && <p className="chat-empty">Abriendo conversación…</p>}
          {status === 'error' && <p className="chat-empty">{error}</p>}
          {status !== 'loading' && status !== 'error' && messages.length === 0 && <div className="chat-empty"><strong>{unavailable ? 'No hay mensajes anteriores' : 'Empieza la conversación'}</strong><p>{unavailable ? 'Esta propiedad dejó de estar disponible.' : 'Pregunta por disponibilidad, detalles adicionales o propón una visita.'}</p></div>}
          {messages.map((message) => <article className="message-bubble" key={message.id}><p>{message.content}</p>{message.attachments?.map((attachment) => attachment.media_type === 'video' ? <video key={attachment.id} src={attachment.url} controls preload="metadata" /> : <img key={attachment.id} src={attachment.url} alt={attachment.original_name} />)}<time>{new Date(message.created_at).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}</time></article>)}
        </div>
        {unavailable ? <div className="chat-composer-disabled">Conversación cerrada</div> : activeConversation && <form className="chat-composer" onSubmit={submit}>
          <textarea value={content} onChange={(event) => setContent(event.target.value)} rows="3" maxLength="2000" placeholder="Hola, me interesa esta propiedad. ¿Sigue disponible?" disabled={status === 'sending'} aria-label="Mensaje" />
          <div className="composer-actions"><label className="attach-button">＋ Foto o vídeo<input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime" onChange={selectFile} disabled={status === 'sending'} /></label>{file && <span className="selected-file">{file.name}</span>}<button className="solid-link" disabled={status === 'sending'}>{status === 'sending' ? 'Enviando…' : 'Enviar'}</button></div>
          {error && <p className="submit-error" role="alert">{error}</p>}
        </form>}
      </section>
    </div>
  </div>
}
