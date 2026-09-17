import { supabase } from './supabaseClient'

async function chamarApi(payload) {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new Error('Sessão expirada. Faça login novamente.')

  const res = await fetch('/api/usuarios', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Erro ao falar com o servidor')
  return json
}

export async function listarUsuarios() {
  const { usuarios } = await chamarApi({ action: 'listar' })
  return usuarios ?? []
}

export async function criarUsuario({ nome, email, senha, papel }) {
  await chamarApi({ action: 'criar', nome, email, senha, papel })
}

export async function atualizarUsuario({ id, nome, email, senha, papel }) {
  await chamarApi({ action: 'atualizar', id, nome, email, senha, papel })
}

export async function excluirUsuario(id) {
  await chamarApi({ action: 'excluir', id })
}
