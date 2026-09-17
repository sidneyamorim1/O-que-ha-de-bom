import { NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

const ABAS = [
  { to: '/admin', label: 'Alunos', icon: '🧒' },
  { to: '/admin/professores', label: 'Professores', icon: '👨‍🏫' },
  { to: '/admin/vozes', label: 'Vozes', icon: '🎙️' },
  { to: '/admin/importacao', label: 'Importação', icon: '📥' },
  { to: '/admin/usuarios', label: 'Usuários', icon: '👥' },
]

export default function AdminNav() {
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  return (
    <nav className="admin-nav-bar" aria-label="Navegação administrativa">
      <div className="admin-nav-links">
        {ABAS.map((aba) => (
          <NavLink
            key={aba.to}
            to={aba.to}
            end={aba.to === '/admin'}
            className={({ isActive }) =>
              `admin-nav-item${isActive ? ' admin-nav-item--ativo' : ''}`
            }
          >
            <span className="admin-nav-icon">{aba.icon}</span>
            <span className="admin-nav-label">{aba.label}</span>
          </NavLink>
        ))}
      </div>
      <div className="admin-nav-extras">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="admin-nav-btn admin-nav-btn--jogo"
          title="Abrir o jogo em nova aba"
        >
          <span>🎲</span>
          <span>Ver Jogo</span>
        </a>
        <button
          type="button"
          className="admin-nav-btn admin-nav-btn--sair"
          onClick={handleLogout}
          title="Encerrar sessão de admin"
        >
          <span>🚪</span>
          <span>Sair</span>
        </button>
      </div>
    </nav>
  )
}
