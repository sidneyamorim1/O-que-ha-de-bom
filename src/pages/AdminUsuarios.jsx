import { useEffect, useState, useMemo } from 'react'
import { listarUsuarios, criarUsuario, atualizarUsuario, excluirUsuario } from '../lib/usuarios'
import { PAPEIS_USUARIO, labelPapel } from '../constants/gameData'
import AdminNav from '../components/AdminNav'

const EMPTY_FORM = { id: null, nome: '', email: '', senha: '', papel: PAPEIS_USUARIO[0].value }

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [busca, setBusca] = useState('')
  const [filtroPapel, setFiltroPapel] = useState('')
  const [form, setForm] = useState(EMPTY_FORM)
  const [drawerAberto, setDrawerAberto] = useState(false)
  const [saving, setSaving] = useState(false)
  const [excluindo, setExcluindo] = useState(null)
  const [mostrarSenha, setMostrarSenha] = useState(false)

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

  // Métricas
  const metricas = useMemo(() => {
    const total = usuarios.length
    const admins = usuarios.filter((u) => u.papel === 'admin').length
    const professores = usuarios.filter((u) => u.papel === 'professor').length
    const alunos = usuarios.filter((u) => u.papel === 'aluno').length
    return { total, admins, professores, alunos }
  }, [usuarios])

  // Filtros
  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((u) => {
      const matchPapel = !filtroPapel || u.papel === filtroPapel
      if (!matchPapel) return false

      if (!busca.trim()) return true
      const termo = busca.toLowerCase()
      const matchNome = u.nome && u.nome.toLowerCase().includes(termo)
      const matchEmail = u.email && u.email.toLowerCase().includes(termo)
      return matchNome || matchEmail
    })
  }, [usuarios, busca, filtroPapel])

  function handleAbrirNovo() {
    setForm(EMPTY_FORM)
    setMostrarSenha(false)
    setDrawerAberto(true)
  }

  function handleEditar(usuario) {
    setForm({
      id: usuario.id,
      nome: usuario.nome ?? '',
      email: usuario.email,
      senha: '',
      papel: usuario.papel,
    })
    setMostrarSenha(false)
    setDrawerAberto(true)
  }

  function handleFecharDrawer() {
    if (saving) return
    setDrawerAberto(false)
    setForm(EMPTY_FORM)
  }

  function limparFiltros() {
    setBusca('')
    setFiltroPapel('')
  }

  const temFiltrosAtivos = !!busca || !!filtroPapel

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      if (form.id) {
        await atualizarUsuario(form)
      } else {
        await criarUsuario(form)
      }
      setDrawerAberto(false)
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

  function getPapelBadgeClass(papel) {
    switch (papel) {
      case 'admin':
        return 'admin-badge--role-admin'
      case 'professor':
        return 'admin-badge--role-prof'
      case 'aluno':
      default:
        return 'admin-badge--role-aluno'
    }
  }

  function getPapelIcon(papel) {
    switch (papel) {
      case 'admin':
        return '👑'
      case 'professor':
        return '👨‍🏫'
      case 'aluno':
      default:
        return '🧒'
    }
  }

  return (
    <div className="page page--admin">
      <div className="admin-container">
        {/* Topbar */}
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
            <span className="admin-tag-categoria admin-tag-categoria--users">Controle de Acesso</span>
            <h2 className="admin-section-title">Usuários do Sistema</h2>
            <p className="admin-section-desc">
              Gerencie contas de acesso para administradores, professores e alunos da plataforma.
            </p>
          </div>
          <button type="button" className="btn btn--primary btn--novo" onClick={handleAbrirNovo}>
            <span className="btn-icon">➕</span> Novo usuário
          </button>
        </div>

        {/* Métricas / KPIs */}
        <div className="admin-kpi-grid">
          <div className="admin-kpi-card">
            <div className="admin-kpi-card__icon admin-kpi-card__icon--blue">👥</div>
            <div className="admin-kpi-card__info">
              <span className="admin-kpi-card__value">{metricas.total}</span>
              <span className="admin-kpi-card__label">Total cadastrados</span>
            </div>
          </div>
          <div className="admin-kpi-card">
            <div className="admin-kpi-card__icon admin-kpi-card__icon--purple">👑</div>
            <div className="admin-kpi-card__info">
              <span className="admin-kpi-card__value">{metricas.admins}</span>
              <span className="admin-kpi-card__label">Administradores</span>
            </div>
          </div>
          <div className="admin-kpi-card">
            <div className="admin-kpi-card__icon admin-kpi-card__icon--teal">👨‍🏫</div>
            <div className="admin-kpi-card__info">
              <span className="admin-kpi-card__value">{metricas.professores}</span>
              <span className="admin-kpi-card__label">Professores</span>
            </div>
          </div>
          <div className="admin-kpi-card">
            <div className="admin-kpi-card__icon admin-kpi-card__icon--amber">🧒</div>
            <div className="admin-kpi-card__info">
              <span className="admin-kpi-card__value">{metricas.alunos}</span>
              <span className="admin-kpi-card__label">Alunos</span>
            </div>
          </div>
        </div>

        {/* Toolbar de busca e filtro */}
        <div className="admin-toolbar">
          <div className="admin-search-wrapper">
            <span className="admin-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar por nome ou e-mail..."
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
              value={filtroPapel}
              onChange={(e) => setFiltroPapel(e.target.value)}
              className="admin-select"
            >
              <option value="">Todos os papéis</option>
              {PAPEIS_USUARIO.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>

            {temFiltrosAtivos && (
              <button
                type="button"
                className="admin-btn-reset-filters"
                onClick={limparFiltros}
                title="Redefinir filtros"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>

        {/* Info bar */}
        <div className="admin-results-bar">
          <span className="admin-results-count">
            Mostrando <strong>{usuariosFiltrados.length}</strong> de {usuarios.length} usuário
            {usuarios.length === 1 ? '' : 's'}
          </span>
        </div>

        {loading && (
          <div className="admin-empty-state">
            <div className="spinner" />
            <p>Carregando usuários...</p>
          </div>
        )}

        {error && (
          <div className="admin-alert admin-alert--erro">
            <span>⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && usuariosFiltrados.length === 0 && (
          <div className="admin-empty-state">
            <span className="admin-empty-state__icon">👤</span>
            <h3 className="admin-empty-state__title">Nenhum usuário encontrado</h3>
            <p className="admin-empty-state__desc">
              {temFiltrosAtivos
                ? 'Nenhum resultado corresponde aos filtros selecionados.'
                : 'Nenhum usuário cadastrado no sistema ainda.'}
            </p>
            {temFiltrosAtivos ? (
              <button type="button" className="btn btn--secundario" onClick={limparFiltros}>
                Limpar filtros
              </button>
            ) : (
              <button type="button" className="btn btn--primary" onClick={handleAbrirNovo}>
                ➕ Cadastrar primeiro usuário
              </button>
            )}
          </div>
        )}

        {/* Lista de Usuários em Grid de Cards Modernos */}
        <div className="admin-users-grid">
          {usuariosFiltrados.map((u) => {
            const inicial = (u.nome || u.email || '?')[0].toUpperCase()

            return (
              <div key={u.id} className="admin-user-card">
                <div className="admin-user-card__avatar">
                  <span>{inicial}</span>
                </div>

                <div className="admin-user-card__info">
                  <div className="admin-user-card__top">
                    <span className={`admin-badge ${getPapelBadgeClass(u.papel)}`}>
                      {getPapelIcon(u.papel)} {labelPapel(u.papel)}
                    </span>
                  </div>

                  <h3 className="admin-user-card__name">{u.nome || 'Sem nome informado'}</h3>
                  <p className="admin-user-card__email">{u.email}</p>
                </div>

                <div className="admin-user-card__actions">
                  <button
                    type="button"
                    className="admin-action-btn admin-action-btn--edit"
                    onClick={() => handleEditar(u)}
                    title="Editar usuário"
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    className="admin-action-btn admin-action-btn--delete"
                    onClick={() => setExcluindo(u)}
                    title="Excluir usuário"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* DRAWER LATERAL: Criar / Editar Usuário */}
      {drawerAberto && (
        <div className="admin-drawer-overlay" onClick={handleFecharDrawer}>
          <div className="admin-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="admin-drawer__header">
              <div>
                <span className="admin-drawer__badge">
                  {form.id ? 'Gerenciamento de Conta' : 'Novo Acesso'}
                </span>
                <h2 className="admin-drawer__title">
                  {form.id ? 'Editar usuário' : 'Criar novo usuário'}
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
              <label className="form-field">
                Nome completo (opcional)
                <input
                  type="text"
                  placeholder="Ex: Maria dos Santos"
                  value={form.nome}
                  onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                />
              </label>

              <label className="form-field">
                Papel no sistema
                <select
                  value={form.papel}
                  onChange={(e) => setForm((f) => ({ ...f, papel: e.target.value }))}
                >
                  {PAPEIS_USUARIO.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-field">
                E-mail de acesso
                <input
                  type="email"
                  placeholder="usuario@escola.com"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  required
                  autoComplete="off"
                />
              </label>

              <label className="form-field">
                <div className="form-field__header">
                  <span>{form.id ? 'Nova senha (opcional)' : 'Senha de acesso'}</span>
                </div>
                <div className="input-com-icone">
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    placeholder={form.id ? 'Deixe em branco para manter a atual' : 'Mínimo 6 caracteres'}
                    value={form.senha}
                    onChange={(e) => setForm((f) => ({ ...f, senha: e.target.value }))}
                    required={!form.id}
                    minLength={form.senha ? 6 : undefined}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="btn-olho"
                    onClick={() => setMostrarSenha((v) => !v)}
                    title={mostrarSenha ? 'Ocultar senha' : 'Exibir senha'}
                  >
                    {mostrarSenha ? '🙈' : '👁️'}
                  </button>
                </div>
              </label>

              <p className="form-hint">
                {form.id
                  ? 'Preencha a senha apenas se desejar redefini-la agora.'
                  : 'O usuário poderá utilizar este e-mail e senha para acessar o jogo.'}
              </p>

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
                  {saving ? 'Salvando...' : form.id ? 'Salvar alterações' : 'Criar usuário'}
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
            <div className="modal-header-icon">⚠️</div>
            <h2 className="modal-titulo">Excluir usuário?</h2>
            <p className="modal-texto">
              O usuário <strong>{excluindo.nome || excluindo.email}</strong> perderá o acesso à
              plataforma imediatamente. Esta ação é irreversível.
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
                Sim, excluir usuário
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
