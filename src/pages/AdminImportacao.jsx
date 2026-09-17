import ImportarCsv from '../components/ImportarCsv'
import ImportarUsuariosCsv from '../components/ImportarUsuariosCsv'
import AdminNav from '../components/AdminNav'
import { FAIXAS_ETARIAS, FAIXAS_PROFESSOR } from '../constants/gameData'

export default function AdminImportacao() {
  return (
    <div className="page page--admin">
      <div className="admin-container">
        <header className="admin-topbar">
          <div className="admin-brand">
            <span className="admin-brand__badge">PAINEL DO MESTRE</span>
            <h1 className="admin-brand__title">🎲 O que há de BOM?</h1>
          </div>
          <AdminNav />
        </header>

        <div className="admin-page-header">
          <div>
            <span className="admin-tag-categoria admin-tag-categoria--import">Importação Massiva</span>
            <h2 className="admin-section-title">Importação em Lote via Planilha CSV</h2>
            <p className="admin-section-desc">
              Faça o download do modelo, preencha suas histórias ou usuários no Excel/Google Sheets,
              salve como CSV e importe de volta para cadastrar centenas de itens de uma só vez.
            </p>
          </div>
        </div>

        <div className="admin-import-grid">
          <div className="admin-glass-panel admin-glass-panel--import">
            <div className="admin-panel-header">
              <span className="admin-panel-icon">🧒</span>
              <div>
                <h3 className="admin-panel-title">Histórias de Alunos</h3>
                <span className="admin-panel-sub">Para o tabuleiro infantil e juvenil</span>
              </div>
            </div>
            <ImportarCsv
              titulo=""
              tabela="historias"
              colunaFaixa="faixa_etaria"
              faixasValidas={FAIXAS_ETARIAS.map((f) => f.value)}
              nomeArquivoModelo="modelo-historias-alunos.csv"
            />
          </div>

          <div className="admin-glass-panel admin-glass-panel--import">
            <div className="admin-panel-header">
              <span className="admin-panel-icon">👨‍🏫</span>
              <div>
                <h3 className="admin-panel-title">Histórias de Professores</h3>
                <span className="admin-panel-sub">Para formação e jornada pedagógica</span>
              </div>
            </div>
            <ImportarCsv
              titulo=""
              tabela="historias_professores"
              colunaFaixa="faixa"
              faixasValidas={FAIXAS_PROFESSOR.map((f) => f.value)}
              nomeArquivoModelo="modelo-historias-professores.csv"
            />
          </div>

          <div className="admin-glass-panel admin-glass-panel--import admin-glass-panel--full">
            <div className="admin-panel-header">
              <span className="admin-panel-icon">👥</span>
              <div>
                <h3 className="admin-panel-title">Criação de Usuários em Massa</h3>
                <span className="admin-panel-sub">Cadastre turmas inteiras com e-mail, senha e papel</span>
              </div>
            </div>
            <ImportarUsuariosCsv />
          </div>
        </div>
      </div>
    </div>
  )
}
