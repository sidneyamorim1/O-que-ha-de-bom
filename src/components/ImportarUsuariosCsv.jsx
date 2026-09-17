import { useState } from 'react'
import { parseCsvObjetos, paraCsv } from '../lib/csv'
import { criarUsuario } from '../lib/usuarios'
import { PAPEIS_USUARIO } from '../constants/gameData'

const CABECALHO = ['nome', 'email', 'senha', 'papel']

// Cria vários usuários de uma vez a partir de um CSV, chamando a mesma função de criação
// individual (que já passa pela Netlify Function com a service role key) uma vez por linha.
export default function ImportarUsuariosCsv({ onImportado }) {
  const [importando, setImportando] = useState(false)
  const [progresso, setProgresso] = useState(null) // { done, total }
  const [resultado, setResultado] = useState(null)

  function handleBaixarModelo() {
    const exemplo = ['Nome de exemplo', 'exemplo@escola.com', 'senha123', 'aluno']
    const csv = paraCsv([CABECALHO, exemplo])
    const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'modelo-usuarios.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  async function handleArquivo(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setResultado(null)
    const texto = await file.text()
    const linhas = parseCsvObjetos(texto)

    if (linhas.length === 0) {
      window.alert('O arquivo está vazio ou não pôde ser lido.')
      return
    }

    const papeisValidos = PAPEIS_USUARIO.map((p) => p.value)
    const validas = []
    const erros = []

    linhas.forEach((linha, idx) => {
      const numeroLinha = idx + 2
      const email = linha.email
      const senha = linha.senha
      const papel = linha.papel
      const nome = linha.nome

      if (!email || !email.includes('@')) {
        erros.push(`Linha ${numeroLinha}: "email" = "${email}" inválido.`)
        return
      }
      if (!senha || senha.length < 6) {
        erros.push(`Linha ${numeroLinha}: "senha" precisa ter pelo menos 6 caracteres.`)
        return
      }
      if (!papeisValidos.includes(papel)) {
        erros.push(`Linha ${numeroLinha}: "papel" = "${papel}" inválido (use ${papeisValidos.join(', ')}).`)
        return
      }

      validas.push({ nome: nome || '', email, senha, papel })
    })

    if (erros.length > 0) {
      const continuar = window.confirm(
        `${erros.length} linha(s) com problema, ${validas.length} válida(s):\n\n` +
          erros.slice(0, 10).join('\n') +
          (erros.length > 10 ? `\n... e mais ${erros.length - 10}` : '') +
          (validas.length > 0 ? `\n\nImportar só as ${validas.length} válidas?` : '')
      )
      if (!continuar || validas.length === 0) return
    }

    setImportando(true)
    setProgresso({ done: 0, total: validas.length })
    const falhas = []

    for (const usuario of validas) {
      try {
        await criarUsuario(usuario)
      } catch (err) {
        falhas.push(`${usuario.email}: ${err.message}`)
      }
      setProgresso((p) => ({ done: p.done + 1, total: p.total }))
    }

    setImportando(false)
    setProgresso(null)

    const sucesso = validas.length - falhas.length
    if (falhas.length === 0) {
      setResultado(`${sucesso} usuário(s) criado(s) com sucesso.`)
    } else {
      setResultado(
        `${sucesso} de ${validas.length} criado(s). ${falhas.length} falharam:\n` + falhas.join('\n')
      )
    }
    onImportado?.()
  }

  return (
    <div className="voice-tester__lote">
      <p className="form-titulo" style={{ fontSize: 15, margin: '0 0 4px' }}>
        Usuários
      </p>
      <p className="form-hint">
        Colunas (primeira linha = cabeçalho): <code>nome</code> (opcional), <code>email</code>,{' '}
        <code>senha</code> (mín. 6 caracteres), <code>papel</code> (admin, professor ou aluno).
      </p>
      <div className="voice-tester__acoes">
        <button type="button" className="btn" onClick={handleBaixarModelo}>
          ⬇️ Baixar modelo CSV
        </button>
        <label className="btn" style={{ margin: 0 }}>
          {importando ? `Criando... (${progresso?.done ?? 0}/${progresso?.total ?? 0})` : 'Escolher arquivo CSV'}
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleArquivo}
            disabled={importando}
            style={{ display: 'none' }}
          />
        </label>
      </div>
      {resultado && <p className="mensagem" style={{ whiteSpace: 'pre-wrap' }}>{resultado}</p>}
    </div>
  )
}
