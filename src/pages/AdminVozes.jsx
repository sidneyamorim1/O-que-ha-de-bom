import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import VoiceTester from '../components/VoiceTester'
import AplicarVozEmMassa from '../components/AplicarVozEmMassa'

export default function AdminVozes() {
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  return (
    <div className="page page--admin">
      <div className="card card--admin card--wide">
        <div className="admin-header">
          <h1 className="titulo titulo--sm">Admin — Vozes</h1>
          <div className="form-actions">
            <button type="button" className="btn" onClick={() => navigate('/admin')}>
              Histórias alunos
            </button>
            <button type="button" className="btn" onClick={() => navigate('/admin/professores')}>
              Histórias professores
            </button>
            <button type="button" className="btn" onClick={() => navigate('/admin/importacao')}>
              Importação em lote
            </button>
            <button type="button" className="btn" onClick={() => navigate('/admin/usuarios')}>
              Usuários
            </button>
            <button type="button" className="btn" onClick={handleLogout}>
              Sair
            </button>
          </div>
        </div>

        <VoiceTester />

        <hr className="divisor" />

        <h2 className="form-titulo">Aplicar em massa</h2>
        <p className="form-hint">
          Regenera o áudio de histórias já cadastradas com a voz padrão atual de cada gênero (definida
          acima). Não mexe em histórias que não têm gênero de voz definido.
        </p>
        <AplicarVozEmMassa titulo="Histórias de alunos" tabela="historias" />
        <AplicarVozEmMassa titulo="Histórias de professores" tabela="historias_professores" />
      </div>
    </div>
  )
}
