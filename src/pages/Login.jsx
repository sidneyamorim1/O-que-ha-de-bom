import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import logo from '../assets/logo/logo.webp'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
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
    navigate('/escolha')
  }

  return (
    <div className="page">
      <div className="card card--admin">
        <div className="titulo-wrapper">
          <img src={logo} alt="O que há de Bom?" className="titulo-logo" />
          <h1 className="titulo">
            O que há de
            <br />
            BOM?
          </h1>
        </div>
        <p className="subtitulo">Faça login para continuar</p>
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
            <div className="input-com-icone">
              <input
                type={mostrarSenha ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="btn-olho"
                onClick={() => setMostrarSenha((v) => !v)}
                aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                title={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {mostrarSenha ? (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3.5-7 10-7c2.14 0 3.96.63 5.44 1.5M22 12s-1.06 2.13-3.06 3.94M6.6 6.6C4.02 8.28 2 12 2 12s3.5 7 10 7c1.62 0 3.05-.35 4.28-.9" />
                    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
                    <path d="M2 2l20 20" />
                  </svg>
                )}
              </button>
            </div>
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
