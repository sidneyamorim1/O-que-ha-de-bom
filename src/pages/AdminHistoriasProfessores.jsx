import { useEffect, useState, useMemo } from 'react'
import { supabase } from '../lib/supabaseClient'
import {
  CORES,
  FAIXAS_PROFESSOR,
  GENEROS_NARRADOR,
  corInfo,
  labelFaixaProfessor,
  labelGeneroNarrador,
  getVozPreferida,
} from '../constants/gameData'
import { AUDIO_BUCKET, IMAGEM_BUCKET, removeStorageFile, gerarAudioIA } from '../lib/storage'
import AudioPlayer from '../components/AudioPlayer'
import AdminNav from '../components/AdminNav'

const EMPTY_FORM = {
  id: null,
  faixa: FAIXAS_PROFESSOR[0].value,
  cor: CORES[0].value,
  titulo: '',
  texto: '',
  genero_narrador: '',
  audioUrl: null,
  audioFile: null,
  removeAudio: false,
  imagemUrl: null,
  imagemFile: null,
  removeImagem: false,
}

export default function AdminHistoriasProfessores() {
  const [historias, setHistorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filtroFaixa, setFiltroFaixa] = useState('')
  const [filtroCor, setFiltroCor] = useState('')
  const [busca, setBusca] = useState('')
  const [form, setForm] = useState(EMPTY_FORM)
  const [drawerAberto, setDrawerAberto] = useState(false)
  const [saving, setSaving] = useState(false)
  const [excluindo, setExcluindo] = useState(null)

  async function carregar() {
    setLoading(true)
    setError(null)
    let query = supabase.from('historias_professores').select('*').order('created_at', { ascending: false })
    if (filtroFaixa) query = query.eq('faixa', filtroFaixa)
    if (filtroCor) query = query.eq('cor', filtroCor)
    const { data, error } = await query
    if (error) {
      setError('Não foi possível carregar as histórias dos professores.')
    } else {
      setHistorias(data ?? [])
    }
    setLoading(false)
  }

  useEffect(() => {
    carregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroFaixa, filtroCor])

  // Métricas rápidas
  const metricas = useMemo(() => {
    const total = historias.length
    const comAudio = historias.filter((h) => !!h.audio_url).length
    const comImagem = historias.filter((h) => !!h.imagem_url).length
    const audioManual = historias.filter((h) => h.audio_manual).length
    return { total, comAudio, comImagem, audioManual }
  }, [historias])

  // Filtro de busca textual
  const historiasFiltradas = useMemo(() => {
    if (!busca.trim()) return historias
    const termo = busca.toLowerCase()
    return historias.filter(
      (h) =>
        (h.titulo && h.titulo.toLowerCase().includes(termo)) ||
        (h.texto && h.texto.toLowerCase().includes(termo))
    )
  }, [historias, busca])

  function handleAbrirNovo() {
    setForm(EMPTY_FORM)
    setDrawerAberto(true)
  }

  function handleEditar(historia) {
    setForm({
      id: historia.id,
      faixa: historia.faixa,
      cor: historia.cor,
      titulo: historia.titulo ?? '',
      texto: historia.texto,
      genero_narrador: historia.genero_narrador ?? '',
      audioUrl: historia.audio_url ?? null,
      audioFile: null,
      removeAudio: false,
      imagemUrl: historia.imagem_url ?? null,
      imagemFile: null,
      removeImagem: false,
    })
    setDrawerAberto(true)
  }

  function handleFecharDrawer() {
    if (saving) return
    setDrawerAberto(false)
    setForm(EMPTY_FORM)
  }

  function limparFiltros() {
    setFiltroFaixa('')
    setFiltroCor('')
    setBusca('')
  }

  const temFiltrosAtivos = !!filtroFaixa || !!filtroCor || !!busca

  async function confirmarExclusao() {
    if (!excluindo) return
    const { id, audio_url: audioUrl, imagem_url: imagemUrl } = excluindo
    const { error } = await supabase.from('historias_professores').delete().eq('id', id)
    if (error) {
      window.alert('Erro ao excluir: ' + error.message)
      return
    }
    if (audioUrl) await removeStorageFile(audioUrl, AUDIO_BUCKET)
    if (imagemUrl) await removeStorageFile(imagemUrl, IMAGEM_BUCKET)
    setExcluindo(null)
    carregar()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)

    let audioUrl = form.removeAudio ? null : form.audioUrl
    let audioFile = form.audioFile
    const enviouMp3Agora = !!form.audioFile
    let gerouAutomaticamente = false

    if (!audioFile && !form.removeAudio && !audioUrl) {
      try {
        audioFile = await gerarAudioIA(form.texto, getVozPreferida(form.genero_narrador))
        gerouAutomaticamente = true
      } catch (err) {
        window.alert(
          'Não foi possível gerar a narração automática (' + err.message + '). A história será salva sem áudio.'
        )
      }
    }

    if (audioFile) {
      const path = `${crypto.randomUUID()}-${audioFile.name}`
      const { error: uploadError } = await supabase.storage
        .from(AUDIO_BUCKET)
        .upload(path, audioFile, { contentType: audioFile.type || 'audio/mpeg' })

      if (uploadError) {
        setSaving(false)
        window.alert('Erro ao enviar o áudio: ' + uploadError.message)
        return
      }

      const { data: publicUrlData } = supabase.storage.from(AUDIO_BUCKET).getPublicUrl(path)
      audioUrl = publicUrlData.publicUrl
    }

    let imagemUrl = form.removeImagem ? null : form.imagemUrl

    if (form.imagemFile) {
      const path = `${crypto.randomUUID()}-${form.imagemFile.name}`
      const { error: uploadError } = await supabase.storage
        .from(IMAGEM_BUCKET)
        .upload(path, form.imagemFile, { contentType: form.imagemFile.type || 'image/jpeg' })

      if (uploadError) {
        setSaving(false)
        window.alert('Erro ao enviar a imagem: ' + uploadError.message)
        return
      }

      const { data: publicUrlData } = supabase.storage.from(IMAGEM_BUCKET).getPublicUrl(path)
      imagemUrl = publicUrlData.publicUrl
    }

    const payload = {
      faixa: form.faixa,
      cor: form.cor,
      titulo: form.titulo.trim() || null,
      texto: form.texto.trim(),
      genero_narrador: form.genero_narrador || null,
      audio_url: audioUrl,
      imagem_url: imagemUrl,
    }

    if (!form.id || enviouMp3Agora || form.removeAudio || gerouAutomaticamente) {
      payload.audio_manual = enviouMp3Agora
    }

    const { error } = form.id
      ? await supabase.from('historias_professores').update(payload).eq('id', form.id)
      : await supabase.from('historias_professores').insert(payload)

    setSaving(false)

    if (error) {
      window.alert('Erro ao salvar: ' + error.message)
      return
    }

    const trocouAudio = form.audioFile || form.removeAudio
    if (trocouAudio && form.audioUrl && form.audioUrl !== audioUrl) {
      await removeStorageFile(form.audioUrl, AUDIO_BUCKET)
    }
    const trocouImagem = form.imagemFile || form.removeImagem
    if (trocouImagem && form.imagemUrl && form.imagemUrl !== imagemUrl) {
      await removeStorageFile(form.imagemUrl, IMAGEM_BUCKET)
    }

    setDrawerAberto(false)
    setForm(EMPTY_FORM)
    carregar()
  }

  return (
    <div className="page page--admin">
      <div className="admin-container">
        {/* Topbar moderna */}
        <header className="admin-topbar">
          <div className="admin-brand">
            <span className="admin-brand__badge">PAINEL DO MESTRE</span>
            <h1 className="admin-brand__title">🎲 O que há de BOM?</h1>
          </div>
          <AdminNav />
        </header>

        {/* Cabeçalho da página */}
        <div className="admin-page-header">
          <div>
            <span className="admin-tag-categoria admin-tag-categoria--prof">Módulo Professores</span>
            <h2 className="admin-section-title">Histórias dos Professores</h2>
            <p className="admin-section-desc">
              Histórias e reflexões orientadas para a jornada pedagógica e formação dos educadores.
            </p>
          </div>
          <button type="button" className="btn btn--primary btn--novo" onClick={handleAbrirNovo}>
            <span className="btn-icon">➕</span> Nova história
          </button>
        </div>

        {/* Cards de Métricas / KPIs */}
        <div className="admin-kpi-grid">
          <div className="admin-kpi-card">
            <div className="admin-kpi-card__icon admin-kpi-card__icon--blue">📖</div>
            <div className="admin-kpi-card__info">
              <span className="admin-kpi-card__value">{metricas.total}</span>
              <span className="admin-kpi-card__label">Total cadastradas</span>
            </div>
          </div>
          <div className="admin-kpi-card">
            <div className="admin-kpi-card__icon admin-kpi-card__icon--teal">🎙️</div>
            <div className="admin-kpi-card__info">
              <span className="admin-kpi-card__value">
                {metricas.comAudio}{' '}
                <small className="admin-kpi-card__sub">
                  ({metricas.total > 0 ? Math.round((metricas.comAudio / metricas.total) * 100) : 0}%)
                </small>
              </span>
              <span className="admin-kpi-card__label">Com narração em áudio</span>
            </div>
          </div>
          <div className="admin-kpi-card">
            <div className="admin-kpi-card__icon admin-kpi-card__icon--amber">🖼️</div>
            <div className="admin-kpi-card__info">
              <span className="admin-kpi-card__value">{metricas.comImagem}</span>
              <span className="admin-kpi-card__label">Com ilustração</span>
            </div>
          </div>
          <div className="admin-kpi-card">
            <div className="admin-kpi-card__icon admin-kpi-card__icon--purple">🎵</div>
            <div className="admin-kpi-card__info">
              <span className="admin-kpi-card__value">{metricas.audioManual}</span>
              <span className="admin-kpi-card__label">Áudios personalizados</span>
            </div>
          </div>
        </div>

        {/* Barra de Filtros e Busca */}
        <div className="admin-toolbar">
          <div className="admin-search-wrapper">
            <span className="admin-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar por título ou trecho da história..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="admin-search-input"
            />
            {busca && (
              <button
                type="button"
                className="admin-search-clear"
                onClick={() => setBusca('')}
                title="Limpar busca"
              >
                ✕
              </button>
            )}
          </div>

          <div className="admin-filter-group">
            <select
              value={filtroFaixa}
              onChange={(e) => setFiltroFaixa(e.target.value)}
              className="admin-select"
            >
              <option value="">Todas as faixas</option>
              {FAIXAS_PROFESSOR.map((f) => (
                <option key={f.value} value={f.value}>
                  Faixa {f.label}
                </option>
              ))}
            </select>

            <select
              value={filtroCor}
              onChange={(e) => setFiltroCor(e.target.value)}
              className="admin-select"
            >
              <option value="">Todas as cores</option>
              {CORES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>

            {temFiltrosAtivos && (
              <button
                type="button"
                className="admin-btn-reset-filters"
                onClick={limparFiltros}
                title="Redefinir todos os filtros"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>

        {/* Informações de resultados */}
        <div className="admin-results-bar">
          <span className="admin-results-count">
            Mostrando <strong>{historiasFiltradas.length}</strong> de {historias.length} história
            {historias.length === 1 ? '' : 's'}
          </span>
        </div>

        {/* Estados de carregamento e erro */}
        {loading && (
          <div className="admin-empty-state">
            <div className="spinner" />
            <p>Carregando histórias dos professores...</p>
          </div>
        )}

        {error && (
          <div className="admin-alert admin-alert--erro">
            <span>⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && historiasFiltradas.length === 0 && (
          <div className="admin-empty-state">
            <span className="admin-empty-state__icon">📭</span>
            <h3 className="admin-empty-state__title">Nenhuma história encontrada</h3>
            <p className="admin-empty-state__desc">
              {temFiltrosAtivos
                ? 'Tente remover os filtros ou buscar por outro termo.'
                : 'Comece adicionando a primeira história para os professores.'}
            </p>
            {temFiltrosAtivos ? (
              <button type="button" className="btn btn--secundario" onClick={limparFiltros}>
                Limpar filtros
              </button>
            ) : (
              <button type="button" className="btn btn--primary" onClick={handleAbrirNovo}>
                ➕ Cadastrar primeira história
              </button>
            )}
          </div>
        )}

        {/* Listagem de Cards */}
        <div className="admin-stories-grid">
          {historiasFiltradas.map((h) => {
            const cor = corInfo(h.cor)

            return (
              <article key={h.id} className="admin-story-card">
                <div
                  className="admin-story-card__color-stripe"
                  style={{ backgroundColor: cor?.hex || '#ccc' }}
                  title={`Cor: ${cor?.label}`}
                />

                <div className="admin-story-card__body">
                  <div className="admin-story-card__header">
                    <div className="admin-story-card__tags">
                      <span className="admin-badge admin-badge--faixa admin-badge--faixa-prof">
                        👨‍🏫 {labelFaixaProfessor(h.faixa)}
                      </span>
                      <span
                        className="admin-badge admin-badge--cor"
                        style={{ '--cor-tema': cor?.hex || '#999' }}
                      >
                        <span
                          className="admin-badge-dot"
                          style={{ backgroundColor: cor?.hex || '#999' }}
                        />
                        {cor?.label}
                      </span>
                      {h.genero_narrador && (
                        <span className="admin-badge admin-badge--voz">
                          🎙️ Voz {labelGeneroNarrador(h.genero_narrador)}
                        </span>
                      )}
                      {h.audio_url && (
                        <span
                          className={`admin-badge ${
                            h.audio_manual ? 'admin-badge--audio-manual' : 'admin-badge--audio-auto'
                          }`}
                        >
                          {h.audio_manual ? '🎵 MP3 Próprio' : '✨ Narração IA'}
                        </span>
                      )}
                      {h.imagem_url && (
                        <span className="admin-badge admin-badge--imagem">🖼️ Imagem</span>
                      )}
                    </div>

                    <div className="admin-story-card__actions">
                      <button
                        type="button"
                        className="admin-action-btn admin-action-btn--edit"
                        onClick={() => handleEditar(h)}
                        title="Editar história"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        type="button"
                        className="admin-action-btn admin-action-btn--delete"
                        onClick={() => setExcluindo(h)}
                        title="Excluir história"
                      >
                        🗑️ Excluir
                      </button>
                    </div>
                  </div>

                  {h.titulo && <h3 className="admin-story-card__title">{h.titulo}</h3>}
                  <p className="admin-story-card__text">{h.texto}</p>

                  {(h.audio_url || h.imagem_url) && (
                    <div className="admin-story-card__media">
                      {h.audio_url && (
                        <div className="admin-story-card__audio-box">
                          <audio
                            controls
                            src={h.audio_url}
                            className="admin-story-card__player"
                            preload="none"
                          />
                        </div>
                      )}
                      {h.imagem_url && (
                        <a
                          href={h.imagem_url}
                          target="_blank"
                          rel="noreferrer"
                          className="admin-story-card__thumb-link"
                          title="Clique para abrir imagem original"
                        >
                          <img
                            src={h.imagem_url}
                            alt={h.titulo || 'Ilustração'}
                            className="admin-story-card__thumb"
                          />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </div>

      {/* DRAWER LATERAL: Criar / Editar História */}
      {drawerAberto && (
        <div className="admin-drawer-overlay" onClick={handleFecharDrawer}>
          <div className="admin-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="admin-drawer__header">
              <div>
                <span className="admin-drawer__badge">
                  {form.id ? 'Modo de Edição' : 'Novo Registro'}
                </span>
                <h2 className="admin-drawer__title">
                  {form.id ? 'Editar história de professor' : 'Nova história de professor'}
                </h2>
              </div>
              <button
                type="button"
                className="admin-drawer__close"
                onClick={handleFecharDrawer}
                disabled={saving}
              >
                ✕
              </button>
            </div>

            <form className="admin-drawer__form" onSubmit={handleSubmit}>
              <div className="form-grid-2">
                <label className="form-field">
                  Faixa de professor
                  <select
                    value={form.faixa}
                    onChange={(e) => setForm((f) => ({ ...f, faixa: e.target.value }))}
                  >
                    {FAIXAS_PROFESSOR.map((f) => (
                      <option key={f.value} value={f.value}>
                        Faixa {f.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-field">
                  Cor temática
                  <select
                    value={form.cor}
                    onChange={(e) => setForm((f) => ({ ...f, cor: e.target.value }))}
                  >
                    {CORES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="form-field">
                Título (opcional)
                <input
                  type="text"
                  placeholder="Ex: Estratégias Pedagógicas Ativas"
                  value={form.titulo}
                  onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
                />
              </label>

              <label className="form-field">
                <div className="form-field__header">
                  <span>Texto da história</span>
                  <span className="form-field__count">{form.texto.length} caracteres</span>
                </div>
                <textarea
                  value={form.texto}
                  onChange={(e) => setForm((f) => ({ ...f, texto: e.target.value }))}
                  rows={6}
                  placeholder="Digite o conteúdo orientador para os professores..."
                  required
                />
              </label>

              <div className="admin-form-section">
                <h4 className="admin-form-section__title">🎙️ Narração e Voz</h4>
                <label className="form-field">
                  Gênero da voz padrão
                  <select
                    value={form.genero_narrador}
                    onChange={(e) => setForm((f) => ({ ...f, genero_narrador: e.target.value }))}
                  >
                    <option value="">Não definido (ou leitor do navegador)</option>
                    {GENEROS_NARRADOR.map((g) => (
                      <option key={g.value} value={g.value}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </label>

                <p className="form-hint">
                  Se você não enviar um MP3 manual, o áudio será gerado automaticamente
                  ao salvar via IA (Google Cloud Chirp3-HD).
                </p>

                <label className="admin-file-dropzone">
                  <span className="admin-file-icon">🎵</span>
                  <span className="admin-file-text">
                    {form.audioFile
                      ? `Arquivo selecionado: ${form.audioFile.name}`
                      : 'Clique para enviar arquivo MP3 manual'}
                  </span>
                  <input
                    type="file"
                    accept="audio/mpeg,audio/mp3,.mp3"
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        audioFile: e.target.files?.[0] ?? null,
                        removeAudio: false,
                      }))
                    }
                    className="admin-file-hidden"
                  />
                </label>

                {!form.audioFile && form.audioUrl && !form.removeAudio && (
                  <div className="admin-media-preview">
                    <span>Áudio atual:</span>
                    <AudioPlayer src={form.audioUrl} />
                    <button
                      type="button"
                      className="btn btn--perigo btn--sm"
                      onClick={() => setForm((f) => ({ ...f, removeAudio: true }))}
                    >
                      Remover áudio
                    </button>
                  </div>
                )}

                {form.removeAudio && (
                  <p className="admin-alert-note">O áudio cadastrado será removido ao salvar.</p>
                )}
              </div>

              <div className="admin-form-section">
                <h4 className="admin-form-section__title">🖼️ Ilustração</h4>
                <label className="admin-file-dropzone">
                  <span className="admin-file-icon">📷</span>
                  <span className="admin-file-text">
                    {form.imagemFile
                      ? `Arquivo selecionado: ${form.imagemFile.name}`
                      : 'Clique para enviar imagem (JPG, PNG, WebP)'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        imagemFile: e.target.files?.[0] ?? null,
                        removeImagem: false,
                      }))
                    }
                    className="admin-file-hidden"
                  />
                </label>

                {!form.imagemFile && form.imagemUrl && !form.removeImagem && (
                  <div className="admin-media-preview">
                    <img
                      src={form.imagemUrl}
                      alt="Preview da história"
                      className="admin-preview-img"
                    />
                    <button
                      type="button"
                      className="btn btn--perigo btn--sm"
                      onClick={() => setForm((f) => ({ ...f, removeImagem: true }))}
                    >
                      Remover imagem
                    </button>
                  </div>
                )}

                {form.removeImagem && (
                  <p className="admin-alert-note">A imagem cadastrada será removida ao salvar.</p>
                )}
              </div>

              <div className="admin-drawer__footer">
                <button
                  type="button"
                  className="btn btn--secundario"
                  onClick={handleFecharDrawer}
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn--primary" disabled={saving}>
                  {saving ? 'Salvando história...' : form.id ? 'Salvar alterações' : 'Criar história'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {excluindo && (
        <div className="modal-overlay" onClick={() => setExcluindo(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-icon">🗑️</div>
            <h2 className="modal-titulo">Excluir história?</h2>
            <p className="modal-texto">
              {excluindo.titulo ? `"${excluindo.titulo}"` : 'Esta história'} será excluída
              permanentemente, incluindo os arquivos de áudio e imagem vinculados. Esta ação não
              pode ser desfeita.
            </p>
            <div className="modal-acoes">
              <button type="button" className="btn btn--secundario" onClick={() => setExcluindo(null)}>
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn--primary btn--perigo-solido"
                onClick={confirmarExclusao}
              >
                Sim, excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
