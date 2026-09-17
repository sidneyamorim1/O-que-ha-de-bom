import { createClient } from '@supabase/supabase-js'

const PAPEIS_VALIDOS = ['admin', 'professor', 'aluno']

function getAdminClient() {
  const url = process.env.VITE_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRoleKey) return null
  return createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } })
}

async function exigirAdmin(supabaseAdmin, authorizationHeader) {
  const token = (authorizationHeader || '').replace(/^Bearer\s+/i, '')
  if (!token) return { erro: { statusCode: 401, mensagem: 'Não autenticado.' } }

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token)
  if (userError || !userData?.user) {
    return { erro: { statusCode: 401, mensagem: 'Sessão inválida.' } }
  }

  const { data: perfil, error: perfilError } = await supabaseAdmin
    .from('usuarios')
    .select('papel')
    .eq('id', userData.user.id)
    .maybeSingle()

  if (perfilError) return { erro: { statusCode: 500, mensagem: perfilError.message } }
  if (perfil?.papel !== 'admin') {
    return { erro: { statusCode: 403, mensagem: 'Só administradores podem gerenciar usuários.' } }
  }

  return { usuario: userData.user }
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' }
  }

  const supabaseAdmin = getAdminClient()
  if (!supabaseAdmin) {
    return { statusCode: 500, body: JSON.stringify({ error: 'SUPABASE_SERVICE_ROLE_KEY não configurada' }) }
  }

  const { erro } = await exigirAdmin(supabaseAdmin, event.headers.authorization || event.headers.Authorization)
  if (erro) {
    return { statusCode: erro.statusCode, body: JSON.stringify({ error: erro.mensagem }) }
  }

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'JSON inválido' }) }
  }

  const { action } = body

  if (action === 'listar') {
    const { data, error } = await supabaseAdmin
      .from('usuarios')
      .select('id, nome, email, papel, created_at')
      .order('created_at', { ascending: false })

    if (error) return { statusCode: 500, body: JSON.stringify({ error: error.message }) }
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ usuarios: data }) }
  }

  if (action === 'criar') {
    const { nome, email, senha, papel } = body
    if (!email || !senha || !papel) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Email, senha e papel são obrigatórios.' }) }
    }
    if (!PAPEIS_VALIDOS.includes(papel)) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Papel inválido.' }) }
    }
    if (senha.length < 6) {
      return { statusCode: 400, body: JSON.stringify({ error: 'A senha precisa ter pelo menos 6 caracteres.' }) }
    }

    const { data: criado, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
    })
    if (createError) {
      return { statusCode: 400, body: JSON.stringify({ error: createError.message }) }
    }

    const { error: insertError } = await supabaseAdmin
      .from('usuarios')
      .insert({ id: criado.user.id, nome: nome?.trim() || null, email, papel })

    if (insertError) {
      await supabaseAdmin.auth.admin.deleteUser(criado.user.id)
      return { statusCode: 500, body: JSON.stringify({ error: insertError.message }) }
    }

    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: true }) }
  }

  if (action === 'atualizar') {
    const { id, nome, email, senha, papel } = body
    if (!id || !email || !papel) {
      return { statusCode: 400, body: JSON.stringify({ error: 'id, email e papel são obrigatórios.' }) }
    }
    if (!PAPEIS_VALIDOS.includes(papel)) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Papel inválido.' }) }
    }
    if (senha && senha.length < 6) {
      return { statusCode: 400, body: JSON.stringify({ error: 'A senha precisa ter pelo menos 6 caracteres.' }) }
    }

    const dadosAuth = { email }
    if (senha) dadosAuth.password = senha

    const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(id, dadosAuth)
    if (updateAuthError) {
      return { statusCode: 400, body: JSON.stringify({ error: updateAuthError.message }) }
    }

    const { error: updateError } = await supabaseAdmin
      .from('usuarios')
      .update({ nome: nome?.trim() || null, email, papel })
      .eq('id', id)
    if (updateError) return { statusCode: 500, body: JSON.stringify({ error: updateError.message }) }

    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: true }) }
  }

  if (action === 'excluir') {
    const { id } = body
    if (!id) return { statusCode: 400, body: JSON.stringify({ error: 'id é obrigatório.' }) }

    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(id)
    if (deleteError) return { statusCode: 500, body: JSON.stringify({ error: deleteError.message }) }

    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: true }) }
  }

  return { statusCode: 400, body: JSON.stringify({ error: 'Ação inválida.' }) }
}
