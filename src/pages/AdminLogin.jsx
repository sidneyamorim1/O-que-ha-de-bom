import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError('Email ou senha inválidos.')
      return
    }
    navigate('/admin')
  }

  return (
    <div className="page page--single-screen">
      <div className="card card--admin">
        <div className="titulo-wrapper titulo-wrapper--compacto">
          <span className="titulo-emoji">🔐</span>
          <h1 className="titulo titulo--principal">
            O que há de <span>BOM?</span>
          </h1>
        </div>
        <p className="subtitulo subtitulo--clean">Login administrativo</p>
        <form className="form" onSubmit={handleSubmit}>
          <label className="form-field">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </label>
          <label className="form-field">
            Senha
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>
          {error && <p className="mensagem mensagem--erro">{error}</p>}
          <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
