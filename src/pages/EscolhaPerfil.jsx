import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import logo from '../assets/logo/logo.webp'

export default function EscolhaPerfil() {
  const navigate = useNavigate()
  const [papel, setPapel] = useState(null)

  useEffect(() => {
    let active = true

    async function carregarPapel() {
      const { data: sessionData } = await supabase.auth.getSession()
      const userId = sessionData.session?.user?.id
      if (!userId) return

      const { data } = await supabase.from('usuarios').select('papel').eq('id', userId).maybeSingle()
      const papelCarregado = data?.papel ?? 'admin'

      if (!active) return
      if (papelCarregado === 'aluno') {
        navigate('/', { replace: true })
        return
      }
      setPapel(papelCarregado)
    }

    carregarPapel()
    return () => {
      active = false
    }
  }, [navigate])

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  if (!papel) return null

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
        <p className="subtitulo">Quem está acessando?</p>
        <div className="grid-opcoes">
          <button type="button" className="btn-opcao" onClick={() => navigate('/escolha/professores')}>
            <span className="btn-opcao__emoji">👩‍🏫</span>
            <span className="btn-opcao__label">Professores</span>
          </button>
          <button type="button" className="btn-opcao" onClick={() => navigate('/')}>
            <span className="btn-opcao__emoji">🧒</span>
            <span className="btn-opcao__label">Alunos</span>
          </button>
        </div>
        <button type="button" className="btn-voltar" onClick={handleLogout}>
          Sair
        </button>
      </div>
    </div>
  )
}
