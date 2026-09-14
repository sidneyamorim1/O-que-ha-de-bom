import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { CORES, FAIXAS_ETARIAS, corInfo, labelFaixaEtaria } from '../constants/gameData'

const EMPTY_FORM = { id: null, faixa_etaria: FAIXAS_ETARIAS[0].value, cor: CORES[0].value, titulo: '', texto: '' }

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [historias, setHistorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filtroFaixa, setFiltroFaixa] = useState('')
  const [filtroCor, setFiltroCor] = useState('')
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  async function carregar() {
    setLoading(true)
    setError(null)
    let query = supabase.from('historias').select('*').order('created_at', { ascending: false })
    if (filtroFaixa) query = query.eq('faixa_etaria', filtroFaixa)
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
    setForm({
      id: historia.id,
      faixa_etaria: historia.faixa_etaria,
      cor: historia.cor,
      titulo: historia.titulo ?? '',
      texto: historia.texto,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleCancelarEdicao() {
    setForm(EMPTY_FORM)
  }

  async function handleExcluir(id) {
    if (!window.confirm('Excluir esta história? Essa ação não pode ser desfeita.')) return
    const { error } = await supabase.from('historias').delete().eq('id', id)
    if (error) {
      window.alert('Erro ao excluir: ' + error.message)
      return
    }
    carregar()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    const payload = {
      faixa_etaria: form.faixa_etaria,
      cor: form.cor,
      titulo: form.titulo.trim() || null,
      texto: form.texto.trim(),
    }

    const { error } = form.id
      ? await supabase.from('historias').update(payload).eq('id', form.id)
      : await supabase.from('historias').insert(payload)

    setSaving(false)

    if (error) {
      window.alert('Erro ao salvar: ' + error.message)
      return
    }

    setForm(EMPTY_FORM)
    carregar()
  }

  return (
    <div className="page page--admin">
      <div className="card card--admin card--wide">
        <div className="admin-header">
          <h1 className="titulo titulo--sm">Admin — O que há de BOM?</h1>
          <button type="button" className="btn" onClick={handleLogout}>
            Sair
          </button>
        </div>

        <form className="form form--grid" onSubmit={handleSubmit}>
          <h2 className="form-titulo">{form.id ? 'Editar história' : 'Nova história'}</h2>
          <label className="form-field">
            Faixa etária
            <select
              value={form.faixa_etaria}
              onChange={(e) => setForm((f) => ({ ...f, faixa_etaria: e.target.value }))}
            >
              {FAIXAS_ETARIAS.map((f) => (
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
            <input
              type="text"
              value={form.titulo}
              onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
            />
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

        <hr className="divisor" />

        <div className="admin-filtros">
          <label className="form-field">
            Filtrar por idade
            <select value={filtroFaixa} onChange={(e) => setFiltroFaixa(e.target.value)}>
              <option value="">Todas</option>
              {FAIXAS_ETARIAS.map((f) => (
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
            return (
              <li key={h.id} className="lista-historias__item">
                <div className="lista-historias__cor" style={{ backgroundColor: cor?.hex }} />
                <div className="lista-historias__conteudo">
                  <p className="lista-historias__meta">
                    {labelFaixaEtaria(h.faixa_etaria)} anos · {cor?.label}
                  </p>
                  {h.titulo && <p className="lista-historias__titulo">{h.titulo}</p>}
                  <p className="lista-historias__texto">{h.texto}</p>
                </div>
                <div className="lista-historias__acoes">
                  <button type="button" className="btn" onClick={() => handleEditar(h)}>
                    Editar
                  </button>
                  <button type="button" className="btn btn--perigo" onClick={() => handleExcluir(h.id)}>
                    Excluir
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
