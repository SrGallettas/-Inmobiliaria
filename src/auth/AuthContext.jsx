import { useEffect, useMemo, useState } from 'react'
import * as authService from '../services/authService'
import { AuthContext } from './useAuth'

export function AuthProvider({ children, service = authService }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    service.getSession().then((value) => { if (active) setSession(value) }).catch(() => { if (active) setSession(null) }).finally(() => { if (active) setLoading(false) })
    const unsubscribe = service.subscribeToAuthChanges((value) => { setSession(value); setLoading(false) })
    return () => { active = false; unsubscribe() }
  }, [service])

  const value = useMemo(() => ({ session, user: session?.user ?? null, loading, signUp: service.signUp, signIn: service.signIn, signOut: service.signOut, requestPasswordReset: service.requestPasswordReset, updatePassword: service.updatePassword }), [loading, service, session])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

