import VoiceTester from '../components/VoiceTester'
import AplicarVozEmMassa from '../components/AplicarVozEmMassa'
import AdminNav from '../components/AdminNav'

export default function AdminVozes() {
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
            <span className="admin-tag-categoria admin-tag-categoria--voices">Síntese de Voz (TTS)</span>
            <h2 className="admin-section-title">Vozes e Narração Automática</h2>
            <p className="admin-section-desc">
              Configure as vozes neurais padrão do Google Cloud TTS para narradores femininos e masculinos,
              teste em tempo real e aplique narração em lote para histórias existentes.
            </p>
          </div>
        </div>

        <div className="admin-glass-panel">
          <VoiceTester />
        </div>

        <div className="admin-page-header" style={{ marginTop: '32px' }}>
          <div>
            <span className="admin-tag-categoria admin-tag-categoria--batch">Processamento em Lote</span>
            <h2 className="admin-section-title" style={{ fontSize: '20px' }}>Regeneração de Áudios em Massa</h2>
            <p className="admin-section-desc">
              Regenera com 1 clique todas as histórias que possuem gênero de narrador configurado,
              utilizando as vozes selecionadas acima. Histórias com arquivos MP3 manuais permanecem protegidas.
            </p>
          </div>
        </div>

        <div className="admin-batch-grid">
          <div className="admin-glass-panel">
            <AplicarVozEmMassa titulo="Histórias dos Alunos" tabela="historias" />
          </div>
          <div className="admin-glass-panel">
            <AplicarVozEmMassa titulo="Histórias dos Professores" tabela="historias_professores" />
          </div>
        </div>
      </div>
    </div>
  )
}
