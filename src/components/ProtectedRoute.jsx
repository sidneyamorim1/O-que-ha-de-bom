import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function ProtectedRoute({ children, redirectTo = '/admin/login', requireRole, unauthorizedTo = '/escolha' }) {
  const [status, setStatus] = useState('checking') // checking | authenticated | anonymous | unauthorized

  useEffect(() => {
    let active = true

    async function verificar(session) {
      if (!session) {
        if (active) setStatus('anonymous')
        return
      }

      if (!requireRole) {
        if (active) setStatus('authenticated')
        return
      }

      const { data, error } = await supabase
        .from('usuarios')
        .select('papel')
        .eq('id', session.user.id)
        .maybeSingle()

      if (!active) return
      setStatus(!error && data?.papel === requireRole ? 'authenticated' : 'unauthorized')
    }

    supabase.auth.getSession().then(({ data }) => verificar(data.session))

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      verificar(session)
    })

    return () => {
      active = false
      subscription.subscription.unsubscribe()
    }
  }, [requireRole])

  if (status === 'checking') {
    return <div className="page page--center">Carregando...</div>
  }

  if (status === 'anonymous') {
    return <Navigate to={redirectTo} replace />
  }

  if (status === 'unauthorized') {
    return <Navigate to={unauthorizedTo} replace />
  }

  return children
}
