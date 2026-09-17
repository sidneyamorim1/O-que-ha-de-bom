import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { CORES, FAIXAS_PROFESSOR, corInfo, labelFaixaProfessor, getVozPreferida, labelVoz } from '../constants/gameData'
import { AUDIO_BUCKET, IMAGEM_BUCKET, removeStorageFile, gerarAudioIA } from '../lib/storage'
import AudioPlayer from '../components/AudioPlayer'

const EMPTY_FORM = {
  id: null,
  faixa: FAIXAS_PROFESSOR[0].value,
  cor: CORES[0].value,
  titulo: '',
  texto: '',
  audioUrl: null,
  audioFile: null,
  removeAudio: false,
  imagemUrl: null,
  imagemFile: null,
  removeImagem: false,
}

export default function AdminHistoriasProfessores() {
  const navigate = useNavigate()
  const [historias, setHistorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filtroFaixa, setFiltroFaixa] = useState('')
  const [filtroCor, setFiltroCor] = useState('')
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [gerandoAudioIA, setGerandoAudioIA] = useState(false)
  const [iaAudioPreviewUrl, setIaAudioPreviewUrl] = useState(null)
  const [excluindo, setExcluindo] = useState(null)

  function limparPreviewIA() {
    if (iaAudioPreviewUrl) URL.revokeObjectURL(iaAudioPreviewUrl)
    setIaAudioPreviewUrl(null)
  }

  async function handleGerarAudioIA() {
    if (!form.texto.trim()) {
      window.alert('Escreva o texto da história antes de gerar a narração.')
      return
    }

    setGerandoAudioIA(true)

    try {
      const file = await gerarAudioIA(form.texto, getVozPreferida())

      limparPreviewIA()
      setIaAudioPreviewUrl(URL.createObjectURL(file))
      setForm((f) => ({ ...f, audioFile: file, removeAudio: false }))
    } catch (err) {
      window.alert('Erro ao gerar narração: ' + err.message)
    } finally {
      setGerandoAudioIA(false)
    }
  }

  async function carregar() {
    setLoading(true)
    setError(null)
    let query = supabase.from('historias_professores').select('*').order('created_at', { ascending: false })
    if (filtroFaixa) query = query.eq('faixa', filtroFaixa)
    if (filtroCor) query = query.eq('cor', filtroCor)
    const { data, error } = await query
    if (error) {
      setError('Não foi possível carregar as histórias.')
    } else {
      setHistorias(data ?? [])
    }
    setLoading(false)
  }

  useEffect(() => {
    carregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroFaixa, filtroCor])

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  function handleEditar(historia) {
    limparPreviewIA()
    setForm({
      id: historia.id,
      faixa: historia.faixa,
      cor: historia.cor,
      titulo: historia.titulo ?? '',
      texto: historia.texto,
      audioUrl: historia.audio_url ?? null,
      audioFile: null,
      removeAudio: false,
      imagemUrl: historia.imagem_url ?? null,
      imagemFile: null,
      removeImagem: false,
    })
  }

  function handleCancelarEdicao() {
    limparPreviewIA()
    setForm(EMPTY_FORM)
  }

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

    // Sem áudio manual (upload ou "Gerar narração com IA" já clicado) nem removeAudio explícito:
    // gera a narração automaticamente com a voz padrão configurada, em vez de deixar sem áudio.
    if (!audioFile && !form.removeAudio && !audioUrl) {
      try {
        audioFile = await gerarAudioIA(form.texto, getVozPreferida())
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
      audio_url: audioUrl,
      imagem_url: imagemUrl,
    }

    const { error } = form.id
      ? await supabase.from('historias_professores').update(payload).eq('id', form.id)
      : await supabase.from('historias_professores').insert(payload)

    setSaving(false)

    if (error) {
      window.alert('Erro ao salvar: ' + error.message)
      return
    }

    // Se trocou ou removeu o áudio/imagem antigos, limpa o arquivo anterior do storage
    const trocouAudio = form.audioFile || form.removeAudio
    if (trocouAudio && form.audioUrl && form.audioUrl !== audioUrl) {
      await removeStorageFile(form.audioUrl, AUDIO_BUCKET)
    }
    const trocouImagem = form.imagemFile || form.removeImagem
    if (trocouImagem && form.imagemUrl && form.imagemUrl !== imagemUrl) {
      await removeStorageFile(form.imagemUrl, IMAGEM_BUCKET)
    }

    limparPreviewIA()
    setForm(EMPTY_FORM)
    carregar()
  }

  const formulario = (
    <form className="form form--grid" onSubmit={handleSubmit}>
      <h2 className="form-titulo">{form.id ? 'Editar história' : 'Nova história'}</h2>
      <label className="form-field">
        Faixa
        <select value={form.faixa} onChange={(e) => setForm((f) => ({ ...f, faixa: e.target.value }))}>
          {FAIXAS_PROFESSOR.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </label>
      <label className="form-field">
        Cor
        <select value={form.cor} onChange={(e) => setForm((f) => ({ ...f, cor: e.target.value }))}>
          {CORES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </label>
      <label className="form-field form-field--full">
        Título (opcional)
        <input type="text" value={form.titulo} onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))} />
      </label>
      <label className="form-field form-field--full">
        Texto da história
        <textarea
          value={form.texto}
          onChange={(e) => setForm((f) => ({ ...f, texto: e.target.value }))}
          rows={5}
          required
        />
      </label>
      <p className="form-hint form-field--full">
        O texto acima é sempre exibido. Se você não enviar um MP3 nem gerar a narração abaixo, ela é gerada
        automaticamente com a voz padrão ao salvar — só cai no leitor de voz do navegador se essa geração falhar.
      </p>
      <label className="form-field form-field--full">
        Áudio MP3 (opcional)
        <input
          type="file"
          accept="audio/mpeg,audio/mp3,.mp3"
          onChange={(e) => {
            limparPreviewIA()
            setForm((f) => ({ ...f, audioFile: e.target.files?.[0] ?? null, removeAudio: false }))
          }}
        />
      </label>
      <div className="form-field--full gerar-audio-ia">
        <button
          type="button"
          className="btn"
          onClick={handleGerarAudioIA}
          disabled={gerandoAudioIA || !form.texto.trim()}
        >
          {gerandoAudioIA ? 'Gerando narração...' : `🤖 Gerar narração com IA (${labelVoz(getVozPreferida())})`}
        </button>
      </div>
      {iaAudioPreviewUrl && (
        <div className="form-field--full audio-atual">
          <span>Narração gerada por IA:</span>
          <AudioPlayer src={iaAudioPreviewUrl} />
        </div>
      )}
      {form.audioFile && !iaAudioPreviewUrl && (
        <p className="form-hint form-field--full">Novo arquivo selecionado: {form.audioFile.name}</p>
      )}
      {!form.audioFile && form.audioUrl && !form.removeAudio && (
        <div className="form-field--full audio-atual">
          <span>Áudio atual:</span>
          <AudioPlayer src={form.audioUrl} />
          <button type="button" className="btn btn--perigo" onClick={() => setForm((f) => ({ ...f, removeAudio: true }))}>
            Remover áudio
          </button>
        </div>
      )}
      {form.removeAudio && <p className="form-hint form-field--full">O áudio será removido ao salvar.</p>}
      <label className="form-field form-field--full">
        Imagem (opcional)
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setForm((f) => ({ ...f, imagemFile: e.target.files?.[0] ?? null, removeImagem: false }))}
        />
      </label>
      {form.imagemFile && <p className="form-hint form-field--full">Novo arquivo selecionado: {form.imagemFile.name}</p>}
      {!form.imagemFile && form.imagemUrl && !form.removeImagem && (
        <div className="form-field--full imagem-atual">
          <img src={form.imagemUrl} alt="Imagem atual da história" className="imagem-preview" />
          <button type="button" className="btn btn--perigo" onClick={() => setForm((f) => ({ ...f, removeImagem: true }))}>
            Remover imagem
          </button>
        </div>
      )}
      {form.removeImagem && <p className="form-hint form-field--full">A imagem será removida ao salvar.</p>}
      <div className="form-field--full form-actions">
        <button type="submit" className="btn btn--primary" disabled={saving}>
          {saving ? 'Salvando...' : form.id ? 'Salvar alterações' : 'Adicionar história'}
        </button>
        {form.id && (
          <button type="button" className="btn" onClick={handleCancelarEdicao}>
            Cancelar edição
          </button>
        )}
      </div>
    </form>
  )

  return (
    <div className="page page--admin">
      <div className="card card--admin card--wide">
        <div className="admin-header">
          <h1 className="titulo titulo--sm">Admin — Histórias dos professores</h1>
          <div className="form-actions">
            <button type="button" className="btn" onClick={() => navigate('/admin')}>
              Histórias alunos
            </button>
            <button type="button" className="btn" onClick={() => navigate('/admin/usuarios')}>
              Usuários
            </button>
            <button type="button" className="btn" onClick={handleLogout}>
              Sair
            </button>
          </div>
        </div>

        {!form.id && formulario}

        <hr className="divisor" />

        <div className="admin-filtros">
          <label className="form-field">
            Filtrar por faixa
            <select value={filtroFaixa} onChange={(e) => setFiltroFaixa(e.target.value)}>
              <option value="">Todas</option>
              {FAIXAS_PROFESSOR.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            Filtrar por cor
            <select value={filtroCor} onChange={(e) => setFiltroCor(e.target.value)}>
              <option value="">Todas</option>
              {CORES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loading && <p className="mensagem">Carregando histórias...</p>}
        {error && <p className="mensagem mensagem--erro">{error}</p>}

        {!loading && !error && historias.length === 0 && (
          <p className="mensagem">Nenhuma história cadastrada com esse filtro.</p>
        )}

        <ul className="lista-historias">
          {historias.map((h) => {
            const cor = corInfo(h.cor)

            if (form.id === h.id) {
              return (
                <li key={h.id} className="lista-historias__item lista-historias__item--editando">
                  {formulario}
                </li>
              )
            }

            return (
              <li key={h.id} className="lista-historias__item">
                <div className="lista-historias__cor" style={{ backgroundColor: cor?.hex }} />
                <div className="lista-historias__conteudo">
                  <p className="lista-historias__meta">
                    {labelFaixaProfessor(h.faixa)} · {cor?.label}
                  </p>
                  {h.titulo && <p className="lista-historias__titulo">{h.titulo}</p>}
                  <p className="lista-historias__texto">{h.texto}</p>
                  {h.audio_url && <p className="lista-historias__meta lista-historias__meta--audio">🎵 tem áudio gravado</p>}
                  {h.imagem_url && <p className="lista-historias__meta lista-historias__meta--audio">🖼️ tem imagem</p>}
                </div>
                <div className="lista-historias__acoes">
                  <button type="button" className="btn" onClick={() => handleEditar(h)}>
                    Editar
                  </button>
                  <button type="button" className="btn btn--perigo" onClick={() => setExcluindo(h)}>
                    Excluir
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      {excluindo && (
        <div className="modal-overlay" onClick={() => setExcluindo(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-titulo">Excluir história?</h2>
            <p className="modal-texto">
              {excluindo.titulo ? `"${excluindo.titulo}"` : 'Esta história'} será excluída para sempre, junto com o
              áudio e a imagem cadastrados. Essa ação não pode ser desfeita.
            </p>
            <div className="modal-acoes">
              <button type="button" className="btn" onClick={() => setExcluindo(null)}>
                Cancelar
              </button>
              <button type="button" className="btn btn--primary btn--perigo-solido" onClick={confirmarExclusao}>
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
