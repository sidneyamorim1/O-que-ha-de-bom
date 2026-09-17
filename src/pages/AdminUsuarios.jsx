import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { listarUsuarios, criarUsuario, atualizarUsuario, excluirUsuario } from '../lib/usuarios'
import { PAPEIS_USUARIO, labelPapel } from '../constants/gameData'

const EMPTY_FORM = { id: null, nome: '', email: '', senha: '', papel: PAPEIS_USUARIO[0].value }

export default function AdminUsuarios() {
  const navigate = useNavigate()
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [excluindo, setExcluindo] = useState(null)

  async function carregar() {
    setLoading(true)
    setError(null)
    try {
      setUsuarios(await listarUsuarios())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  function handleEditar(usuario) {
    setForm({
      id: usuario.id,
      nome: usuario.nome ?? '',
      email: usuario.email,
      senha: '',
      papel: usuario.papel,
    })
  }

  function handleCancelarEdicao() {
    setForm(EMPTY_FORM)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      if (form.id) {
        await atualizarUsuario(form)
      } else {
        await criarUsuario(form)
      }
      setForm(EMPTY_FORM)
      await carregar()
    } catch (err) {
      window.alert('Erro ao salvar: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  async function confirmarExclusao() {
    if (!excluindo) return
    try {
      await excluirUsuario(excluindo.id)
      setExcluindo(null)
      await carregar()
    } catch (err) {
      window.alert('Erro ao excluir: ' + err.message)
    }
  }

  const formulario = (
    <form className="form form--grid" onSubmit={handleSubmit}>
      <h2 className="form-titulo">{form.id ? 'Editar usuário' : 'Novo usuário'}</h2>
      <label className="form-field">
        Nome (opcional)
        <input type="text" value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} />
      </label>
      <label className="form-field">
        Papel
        <select value={form.papel} onChange={(e) => setForm((f) => ({ ...f, papel: e.target.value }))}>
          {PAPEIS_USUARIO.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </label>
      <label className="form-field form-field--full">
        Email
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          required
          autoComplete="off"
        />
      </label>
      <label className="form-field form-field--full">
        {form.id ? 'Nova senha (opcional)' : 'Senha'}
        <input
          type="password"
          value={form.senha}
          onChange={(e) => setForm((f) => ({ ...f, senha: e.target.value }))}
          required={!form.id}
          minLength={6}
          autoComplete="new-password"
        />
      </label>
      <p className="form-hint form-field--full">
        {form.id
          ? 'Deixe em branco pra manter a senha atual. Se preencher, precisa ter pelo menos 6 caracteres.'
          : 'A senha precisa ter pelo menos 6 caracteres.'}
      </p>
      <div className="form-field--full form-actions">
        <button type="submit" className="btn btn--primary" disabled={saving}>
          {saving ? 'Salvando...' : form.id ? 'Salvar alterações' : 'Criar usuário'}
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
          <h1 className="titulo titulo--sm">Admin — Usuários</h1>
          <div className="form-actions">
            <button type="button" className="btn" onClick={() => navigate('/admin')}>
              Histórias alunos
            </button>
            <button type="button" className="btn" onClick={() => navigate('/admin/professores')}>
              Histórias professores
            </button>
            <button type="button" className="btn" onClick={handleLogout}>
              Sair
            </button>
          </div>
        </div>

        {!form.id && formulario}

        <hr className="divisor" />

        {loading && <p className="mensagem">Carregando usuários...</p>}
        {error && <p className="mensagem mensagem--erro">{error}</p>}

        {!loading && !error && usuarios.length === 0 && <p className="mensagem">Nenhum usuário cadastrado ainda.</p>}

        <ul className="lista-historias">
          {usuarios.map((u) => {
            if (form.id === u.id) {
              return (
                <li key={u.id} className="lista-historias__item lista-historias__item--editando">
                  {formulario}
                </li>
              )
            }

            return (
              <li key={u.id} className="lista-historias__item">
                <div className="lista-historias__conteudo">
                  <p className="lista-historias__meta">{labelPapel(u.papel)}</p>
                  <p className="lista-historias__titulo">{u.nome || u.email}</p>
                  {u.nome && <p className="lista-historias__texto">{u.email}</p>}
                </div>
                <div className="lista-historias__acoes">
                  <button type="button" className="btn" onClick={() => handleEditar(u)}>
                    Editar
                  </button>
                  <button type="button" className="btn btn--perigo" onClick={() => setExcluindo(u)}>
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
            <h2 className="modal-titulo">Excluir usuário?</h2>
            <p className="modal-texto">
              {excluindo.nome || excluindo.email} perderá o acesso ao app imediatamente. Essa ação não pode ser
              desfeita.
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
