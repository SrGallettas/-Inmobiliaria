import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const { username, password } = await request.json()
    const normalized = String(username || '').trim().toLowerCase()
    if (!normalized || !password) throw new Error('invalid_credentials')

    const url = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const admin = createClient(url, serviceKey, { auth: { persistSession: false } })
    const { data: profile } = await admin.from('profiles').select('id').ilike('username', normalized).maybeSingle()
    if (!profile) throw new Error('invalid_credentials')
    const { data: userData } = await admin.auth.admin.getUserById(profile.id)
    if (!userData.user?.email) throw new Error('invalid_credentials')

    const authClient = createClient(url, anonKey, { auth: { persistSession: false } })
    const { data, error } = await authClient.auth.signInWithPassword({ email: userData.user.email, password })
    if (error || !data.session) throw new Error('invalid_credentials')
    return Response.json({ session: data.session }, { headers: corsHeaders })
  } catch {
    return Response.json({ error: 'Credenciales incorrectas.' }, { status: 401, headers: corsHeaders })
  }
})
