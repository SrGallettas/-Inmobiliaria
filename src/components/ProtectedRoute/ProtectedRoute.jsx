import { Navigate, useLocation } from 'react-router'
import { useAuth } from '../../auth/useAuth'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <div className="auth-loading page-space" role="status">Comprobando tu sesión…</div>
  if (!user) return <Navigate to="/entrar" replace state={{ from: location.pathname }} />
  return children
}

export default ProtectedRoute
