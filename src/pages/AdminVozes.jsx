import VoiceTester from '../components/VoiceTester'
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

        <div className="admin-batch-grid">
          <div className="admin-glass-panel admin-glass-panel--aluno">
            <VoiceTester contexto="aluno" titulo="Vozes para Alunos (Chirp3-HD)" />
          </div>
          <div className="admin-glass-panel admin-glass-panel--prof">
            <VoiceTester contexto="professor" titulo="Vozes para Professores (Chirp3-HD)" />
          </div>
        </div>
      </div>
    </div>
  )
}
