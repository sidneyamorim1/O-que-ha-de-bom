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
    <div className="page page--single-screen">
      <div className="card card--perfil">
        <div className="titulo-wrapper titulo-wrapper--compacto">
          <img src={logo} alt="O que há de Bom?" className="titulo-logo titulo-logo--otimizado" />
          <h1 className="titulo titulo--principal">
            O que há de <span>BOM?</span>
          </h1>
        </div>
        <p className="subtitulo subtitulo--clean">Selecione o modo de experiência:</p>

        <div className="grid-perfis">
          <button
            type="button"
            className="card-perfil-item card-perfil-item--prof"
            onClick={() => navigate('/escolha/professores')}
          >
            <div className="card-perfil-item__icon">👩‍🏫</div>
            <div className="card-perfil-item__info">
              <h3 className="card-perfil-item__title">Professores</h3>
              <p className="card-perfil-item__desc">
                Jornada pedagógica, histórias formativas e reflexões para educadores.
              </p>
            </div>
            <span className="card-perfil-item__arrow">→</span>
          </button>

          <button
            type="button"
            className="card-perfil-item card-perfil-item--aluno"
            onClick={() => navigate('/')}
          >
            <div className="card-perfil-item__icon">🧒</div>
            <div className="card-perfil-item__info">
              <h3 className="card-perfil-item__title">Alunos</h3>
              <p className="card-perfil-item__desc">
                Sorteio da roleta, desafios de cores e narrações para a turma.
              </p>
            </div>
            <span className="card-perfil-item__arrow">→</span>
          </button>
        </div>

        <button type="button" className="btn-voltar" onClick={handleLogout}>
          🚪 Encerrar sessão
        </button>
      </div>
    </div>
  )
}
