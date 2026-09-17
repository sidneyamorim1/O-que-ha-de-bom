import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import logo from '../assets/logo/logo.webp'

export default function EscolhaPerfil() {
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
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
        <p className="subtitulo">Quem está acessando?</p>
        <div className="grid-opcoes">
          <button
            type="button"
            className="btn-opcao"
            onClick={() => navigate('/escolha/professores')}
          >
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
