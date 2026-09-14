import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function ProtectedRoute({ children }) {
  const [status, setStatus] = useState('checking') // checking | authenticated | anonymous

  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setStatus(data.session ? 'authenticated' : 'anonymous')
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setStatus(session ? 'authenticated' : 'anonymous')
    })

    return () => {
      active = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  if (status === 'checking') {
    return <div className="page page--center">Carregando...</div>
  }

  if (status === 'anonymous') {
    return <Navigate to="/admin/login" replace />
  }

  return children
}
