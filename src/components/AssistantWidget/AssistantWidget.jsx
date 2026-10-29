import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { formatPrice } from '../../data/properties'
import { searchPropertiesWithAssistant } from '../../services/assistantService'
import { isMarketedProperty } from '../../utils/propertyAvailability'
import './AssistantWidget.css'

const EXAMPLES = [
  'Comprar un ático en Valencia por menos de 700.000 €',
  'Alquilar un apartamento en Madrid con 2 dormitorios',
]
const OPEN_STORAGE_KEY = 'lumera:assistant-open'
const AI_STORAGE_KEY = 'lumera:assistant-ai-enabled'

function initialOpenState() {
  try {
    return localStorage.getItem(OPEN_STORAGE_KEY) !== 'false'
  } catch {
    return true
  }
}

function initialAiState() {
  try { return localStorage.getItem(AI_STORAGE_KEY) !== 'false' } catch { return true }
}

function ChatIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 15a4 4 0 0 1-4 4H8l-5 3 1.7-5.1A8 8 0 1 1 20 15Z" /><path d="M8 11h.01M12 11h.01M16 11h.01" /></svg>
}

function CloseIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
}

function CompactProperty({ property, onNavigate }) {
  return <Link className="assistant-property" to={`/inmuebles/${property.id}`} onClick={onNavigate}>
    <img src={property.image} alt="" />
    <span><b>{property.title}</b><small>{property.location}</small><strong>{formatPrice(property.price, property.operation)}</strong></span>
  </Link>
}

function AssistantWidget({ properties, search = searchPropertiesWithAssistant }) {
  const [open, setOpen] = useState(initialOpenState)
  const [prompt, setPrompt] = useState('')
  const [messages, setMessages] = useState([])
  const [pendingQuestion, setPendingQuestion] = useState('')
  const [processing, setProcessing] = useState(false)
  const [searchContext, setSearchContext] = useState(null)
  const [aiEnabled, setAiEnabled] = useState(initialAiState)
  const messagesRef = useRef(null)
  const inputRef = useRef(null)

  function changeOpenState(nextOpen) {
    setOpen(nextOpen)
    try { localStorage.setItem(OPEN_STORAGE_KEY, String(nextOpen)) } catch { /* El almacenamiento puede estar desactivado. */ }
  }

  useEffect(() => {
    const closeOnEscape = (event) => { if (event.key === 'Escape') changeOpenState(false) }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])

  useEffect(() => {
    if (!messagesRef.current) return
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight
  }, [messages])

  useEffect(() => {
    if (!open || typeof window.matchMedia !== 'function' || !window.matchMedia('(max-width: 600px)').matches) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow }
  }, [open])

  const openChat = () => {
    changeOpenState(true)
    window.setTimeout(() => inputRef.current?.focus(), 0)
  }

  const startNewSearch = () => {
    setMessages([])
    setPrompt('')
    setPendingQuestion('')
    setSearchContext(null)
    inputRef.current?.focus()
  }

  const submitSearch = async (event) => {
    event.preventDefault()
    const question = prompt.trim()
    if (!question || processing) return

    setProcessing(true)
    setPendingQuestion(question)
    setPrompt('')
    try {
      const result = await search(properties.filter(isMarketedProperty), question, { previousFilters: searchContext, aiEnabled })
      let answer = result.activeFilters === 0
        ? 'No he reconocido suficientes datos. Indícame ciudad, compra o alquiler, precio, dormitorios o tipo de vivienda.'
        : result.matches.length > 0
          ? `He encontrado ${result.matches.length} ${result.matches.length === 1 ? 'vivienda que encaja' : 'viviendas que encajan'} con tu búsqueda.`
          : 'No encuentro viviendas con esos criterios. Prueba a ampliar el precio o cambiar algún requisito.'
      if (result.source === 'local') answer += aiEnabled
        ? ' He usado la búsqueda básica porque la IA no estaba disponible.'
        : ' He usado la búsqueda básica porque has desactivado la IA.'
      setSearchContext(result.filters || null)
      setMessages((current) => [...current, { answer, properties: result.matches.slice(0, 3), question }])
    } catch {
      setMessages((current) => [...current, { answer: 'No he podido realizar la búsqueda. Comprueba tu conexión e inténtalo de nuevo.', error: true, properties: [], question }])
    } finally {
      setPendingQuestion('')
      setProcessing(false)
    }
  }

  if (!open) return <button className="assistant-launcher" type="button" onClick={openChat} aria-label="Abrir asistente de Lumera"><ChatIcon /><span>¿Buscas vivienda?</span></button>

  return <aside className="assistant-widget" aria-label="Asistente de búsqueda de Lumera">
    <header className="assistant-widget-header">
      <div className="assistant-avatar"><ChatIcon /></div>
      <div><strong>Asistente Lumera</strong><span><i className={aiEnabled ? '' : 'is-local'} /> {aiEnabled ? 'IA activada' : 'Modo local'}</span></div>
      <div className="assistant-widget-actions">
        {messages.length > 0 && <button className="assistant-new-search" type="button" onClick={startNewSearch}>Nueva</button>}
        <button className="assistant-close" type="button" onClick={() => changeOpenState(false)} aria-label="Minimizar asistente"><CloseIcon /></button>
      </div>
    </header>

    <div className="assistant-mode">
      <span>{aiEnabled ? 'Gemini interpreta tus mensajes' : 'Sin llamadas a Gemini'}</span>
      <button type="button" role="switch" aria-checked={aiEnabled} onClick={() => {
        const next = !aiEnabled
        setAiEnabled(next)
        try { localStorage.setItem(AI_STORAGE_KEY, String(next)) } catch { /* Puede estar desactivado. */ }
      }}>{aiEnabled ? 'Desactivar IA' : 'Activar IA'}</button>
    </div>

    <div className="assistant-widget-messages" ref={messagesRef} aria-live="polite">
      <div className="assistant-bubble assistant-bubble-bot">
        <p>Hola, soy el asistente de Lumera. Cuéntame qué vivienda estás buscando.</p>
      </div>

      {messages.length === 0 && <div className="assistant-widget-examples">
        <span>Puedes probar con:</span>
        {EXAMPLES.map((example) => <button type="button" key={example} onClick={() => { setPrompt(example); inputRef.current?.focus() }}>{example}</button>)}
      </div>}

      {messages.map((message, index) => <div className="assistant-widget-exchange" key={`${message.question}-${index}`}>
        <div className="assistant-bubble assistant-bubble-user"><p>{message.question}</p></div>
        <div className={`assistant-bubble assistant-bubble-bot ${message.error ? 'assistant-bubble-error' : ''}`}><p>{message.answer}</p></div>
        {message.properties.length > 0 && <div className="assistant-property-list">
          {message.properties.map((property) => <CompactProperty key={property.id} property={property} onNavigate={() => changeOpenState(false)} />)}
        </div>}
      </div>)}
      {processing && <div className="assistant-widget-exchange">
        <div className="assistant-bubble assistant-bubble-user"><p>{pendingQuestion}</p></div>
        <div className="assistant-bubble assistant-bubble-bot assistant-thinking" role="status" aria-label="Buscando viviendas"><i /><i /><i /></div>
      </div>}
    </div>

    <form className="assistant-widget-form" onSubmit={submitSearch}>
      <label className="assistant-visually-hidden" htmlFor="assistant-widget-prompt">Describe la vivienda que buscas</label>
      <input ref={inputRef} id="assistant-widget-prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Escribe qué vivienda buscas…" autoComplete="off" maxLength="500" disabled={processing} />
      <button type="submit" aria-label="Enviar búsqueda" disabled={processing || !prompt.trim()}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 12 16-8-6 16-2-6-8-2Z" /><path d="m12 14 8-10" /></svg></button>
    </form>
    <p className="assistant-widget-note">Puede cometer errores. Comprueba siempre los datos en la ficha.</p>
  </aside>
}

export default AssistantWidget
