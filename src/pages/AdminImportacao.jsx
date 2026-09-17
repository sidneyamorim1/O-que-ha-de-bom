import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import ImportarCsv from '../components/ImportarCsv'
import ImportarUsuariosCsv from '../components/ImportarUsuariosCsv'
import { FAIXAS_ETARIAS, FAIXAS_PROFESSOR } from '../constants/gameData'

export default function AdminImportacao() {
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  return (
    <div className="page page--admin">
      <div className="card card--admin card--wide">
        <div className="admin-header">
          <h1 className="titulo titulo--sm">Admin — Importação em lote</h1>
          <div className="form-actions">
            <button type="button" className="btn" onClick={() => navigate('/admin')}>
              Histórias alunos
            </button>
            <button type="button" className="btn" onClick={() => navigate('/admin/professores')}>
              Histórias professores
            </button>
            <button type="button" className="btn" onClick={() => navigate('/admin/vozes')}>
              Vozes
            </button>
            <button type="button" className="btn" onClick={() => navigate('/admin/usuarios')}>
              Usuários
            </button>
            <button type="button" className="btn" onClick={handleLogout}>
              Sair
            </button>
          </div>
        </div>

        <p className="form-hint">
          Baixe o modelo, preencha no Excel/Sheets/etc, salve como CSV e importe de volta aqui. Não gera
          áudio na hora — depois de importar, use "Aplicar em massa" na aba Vozes pra narrar todas de uma
          vez.
        </p>

        <hr className="divisor" />

        <ImportarCsv
          titulo="Histórias de alunos"
          tabela="historias"
          colunaFaixa="faixa_etaria"
          faixasValidas={FAIXAS_ETARIAS.map((f) => f.value)}
          nomeArquivoModelo="modelo-historias-alunos.csv"
        />

        <hr className="divisor" />

        <ImportarCsv
          titulo="Histórias de professores"
          tabela="historias_professores"
          colunaFaixa="faixa"
          faixasValidas={FAIXAS_PROFESSOR.map((f) => f.value)}
          nomeArquivoModelo="modelo-historias-professores.csv"
        />

        <hr className="divisor" />

        <ImportarUsuariosCsv />
      </div>
    </div>
  )
}
