import { isPropertySearchFilters, propertySearchSchema } from './filters.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const baseCorsHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const MAX_MESSAGE_LENGTH = 500
const DEFAULT_MODEL = 'gemini-3.1-flash-lite'

const assistantInstructions = `Eres el intérprete de búsquedas inmobiliarias de Lumera.
Convierte el mensaje del usuario en filtros, sin inventar requisitos.
- operation: usa "comprar" o "alquilar" solo si se puede deducir con claridad.
- city: conserva el nombre de la ciudad con mayúsculas y tildes correctas.
- propertyType: "piso" equivale a "Apartamento".
- maxPrice: interpreta "700 mil" como 700000.
- minBedrooms: representa el mínimo de dormitorios solicitado.
- minBathrooms: representa el mínimo de baños solicitado.
- minArea: representa la superficie mínima solicitada en metros cuadrados.
Si se proporciona un contexto anterior, conserva sus filtros salvo que el nuevo mensaje los cambie.
Usa null para cualquier dato que el usuario no haya indicado.`

function allowedOrigins() {
  const configured = (Deno.env.get('ALLOWED_ORIGINS') || '').split(',').map((value) => value.trim()).filter(Boolean)
  return new Set([...configured, 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://127.0.0.1:4173'])
}

function corsHeaders(origin: string | null) {
  return { ...baseCorsHeaders, ...(origin ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : {}) }
}

function jsonResponse(body: Record<string, unknown>, status = 200, origin: string | null = null) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } })
}

function adminClient() {
  const url = Deno.env.get('SUPABASE_URL')
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  return url && key ? createClient(url, key, { auth: { persistSession: false } }) : null
}

async function hashIdentifier(request: Request) {
  const address = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const salt = Deno.env.get('ASSISTANT_RATE_LIMIT_SALT') || Deno.env.get('GEMINI_API_KEY') || ''
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${salt}:${address}`))
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function consumeRateLimit(request: Request) {
  const client = adminClient()
  if (!client) throw new Error('telemetry_not_configured')
  const { data, error } = await client.rpc('consume_assistant_rate_limit', {
    p_identifier_hash: await hashIdentifier(request), p_limit: 10, p_window_seconds: 60,
  })
  if (error) throw new Error('rate_limit_failed')
  return data === true
}

async function recordMetric(outcome: string, durationMs: number, usedRetry = false) {
  const client = adminClient()
  if (!client) return
  const { error } = await client.from('assistant_usage_events').insert({
    outcome,
    model: Deno.env.get('GEMINI_MODEL') || DEFAULT_MODEL,
    duration_ms: Math.max(0, Math.round(durationMs)),
    used_retry: usedRetry,
  })
  if (error) console.error('Assistant metric failed', error.code)
}

function extractOutputText(response: Record<string, unknown>) {
  const steps = Array.isArray(response.steps) ? response.steps : []
  for (const step of steps) {
    if (!step || typeof step !== 'object' || (step as Record<string, unknown>).type !== 'model_output') continue
    const content = Array.isArray((step as Record<string, unknown>).content) ? (step as Record<string, unknown>).content as unknown[] : []
    for (const part of content) {
      if (part && typeof part === 'object' && (part as Record<string, unknown>).type === 'text' && typeof (part as Record<string, unknown>).text === 'string') {
        return (part as Record<string, string>).text
      }
    }
  }
  return null
}

async function createSearchFilters(message: string, previousFilters: unknown) {
  const apiKey = Deno.env.get('GEMINI_API_KEY')
  if (!apiKey) throw new Error('gemini_not_configured')

  const requestBody = JSON.stringify({
    model: Deno.env.get('GEMINI_MODEL') || DEFAULT_MODEL,
    system_instruction: assistantInstructions,
    input: JSON.stringify({ message, previousFilters }),
    store: false,
    generation_config: { max_output_tokens: 200, thinking_level: 'minimal' },
    response_format: {
      type: 'text',
      mime_type: 'application/json',
      schema: propertySearchSchema,
    },
  })

  let response: Response | null = null
  let usedRetry = false
  for (let attempt = 0; attempt < 2; attempt += 1) {
    response = await fetch('https://generativelanguage.googleapis.com/v1/interactions', {
      method: 'POST',
      headers: { 'x-goog-api-key': apiKey, 'Content-Type': 'application/json' },
      body: requestBody,
      signal: AbortSignal.timeout(30000),
    })
    if (response.status !== 503 || attempt === 1) break
    usedRetry = true
    await new Promise((resolve) => setTimeout(resolve, 750))
  }

  if (!response) throw new Error('gemini_empty_response')
  if (!response.ok) {
    const providerError = await response.json().catch(() => null) as { error?: { code?: number; status?: string; message?: string } } | null
    console.error('Gemini request failed', response.status, providerError?.error?.status)
    throw new Error('gemini_request_failed')
  }

  const data = await response.json() as Record<string, unknown>
  const outputText = extractOutputText(data)
  if (!outputText) throw new Error('gemini_empty_response')

  const filters = JSON.parse(outputText) as unknown
  if (!isPropertySearchFilters(filters)) throw new Error('gemini_invalid_filters')
  return { filters, usedRetry }
}

Deno.serve(async (request) => {
  const origin = request.headers.get('Origin')
  if (origin && !allowedOrigins().has(origin)) return jsonResponse({ code: 'origin_not_allowed', error: 'Origen no permitido.' }, 403)
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(origin) })
  if (request.method !== 'POST') {
    return jsonResponse({ code: 'method_not_allowed', error: 'Método no permitido.' }, 405, origin)
  }

  const startedAt = performance.now()
  try {
    if (!await consumeRateLimit(request)) {
      await recordMetric('rate_limited', performance.now() - startedAt)
      return jsonResponse({ code: 'rate_limited', error: 'Has realizado demasiadas consultas. Espera un minuto.' }, 429, origin)
    }
    const body = await request.json()
    const message = typeof body?.message === 'string' ? body.message.trim() : ''

    if (!message) {
      await recordMetric('invalid_request', performance.now() - startedAt)
      return jsonResponse({ code: 'invalid_message', error: 'Escribe qué vivienda estás buscando.' }, 400, origin)
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      await recordMetric('invalid_request', performance.now() - startedAt)
      return jsonResponse({ code: 'message_too_long', error: `El mensaje no puede superar los ${MAX_MESSAGE_LENGTH} caracteres.` }, 413, origin)
    }

    const previousFilters = body?.previousFilters == null ? null : body.previousFilters
    if (previousFilters !== null && !isPropertySearchFilters(previousFilters)) {
      await recordMetric('invalid_request', performance.now() - startedAt)
      return jsonResponse({ code: 'invalid_context', error: 'El contexto de búsqueda no es válido.' }, 400, origin)
    }

    const { filters, usedRetry } = await createSearchFilters(message, previousFilters)
    await recordMetric('success', performance.now() - startedAt, usedRetry)
    return jsonResponse({ filters }, 200, origin)
  } catch (error) {
    if (error instanceof SyntaxError) return jsonResponse({ code: 'invalid_json', error: 'La solicitud no tiene un formato válido.' }, 400, origin)
    if (error instanceof Error && error.message === 'gemini_not_configured') {
      return jsonResponse({ code: 'assistant_not_configured', error: 'El asistente todavía no está configurado.' }, 503, origin)
    }
    if (error instanceof Error && ['telemetry_not_configured', 'rate_limit_failed'].includes(error.message)) {
      return jsonResponse({ code: 'protection_unavailable', error: 'La protección del asistente no está disponible.' }, 503, origin)
    }
    if (error instanceof Error && error.name === 'TimeoutError') {
      await recordMetric('timeout', performance.now() - startedAt)
      return jsonResponse({ code: 'assistant_timeout', error: 'El asistente ha tardado demasiado. Inténtalo de nuevo.' }, 504, origin)
    }
    await recordMetric('provider_error', performance.now() - startedAt)
    return jsonResponse({ code: 'assistant_unavailable', error: 'El asistente no está disponible temporalmente.' }, 502, origin)
  }
})

