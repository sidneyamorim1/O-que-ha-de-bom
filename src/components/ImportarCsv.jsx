import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { parseCsvObjetos, paraCsv } from '../lib/csv'
import { CORES } from '../constants/gameData'

const CABECALHO = ['faixa', 'cor', 'titulo', 'texto', 'genero_narrador']

// Importa várias histórias de uma vez a partir de um CSV. Não gera áudio na importação —
// depois de importar, use "Aplicar em massa" em /admin/vozes pra narrar todas de uma vez.
export default function ImportarCsv({ titulo, tabela, colunaFaixa, faixasValidas, nomeArquivoModelo }) {
  const [importando, setImportando] = useState(false)
  const [resultado, setResultado] = useState(null)

  function handleBaixarModelo() {
    const cabecalho = CABECALHO.map((c) => (c === 'faixa' ? colunaFaixa : c))
    const exemplo = [faixasValidas[0], CORES[0].value, 'Título de exemplo', 'Texto da história aqui.', 'feminino']
    const csv = paraCsv([cabecalho, exemplo])
    const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = nomeArquivoModelo
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

    const coresValidas = CORES.map((c) => c.value)
    const validas = []
    const erros = []

    linhas.forEach((linha, idx) => {
      const numeroLinha = idx + 2 // +1 pelo cabeçalho, +1 pra contar a partir de 1
      const faixa = linha[colunaFaixa]
      const cor = linha.cor
      const conteudo = linha.texto
      const tituloLinha = linha.titulo
      const genero = linha.genero_narrador

      if (!faixasValidas.includes(faixa)) {
        erros.push(`Linha ${numeroLinha}: "${colunaFaixa}" = "${faixa}" inválido.`)
        return
      }
      if (!coresValidas.includes(cor)) {
        erros.push(`Linha ${numeroLinha}: "cor" = "${cor}" inválida.`)
        return
      }
      if (!conteudo) {
        erros.push(`Linha ${numeroLinha}: "texto" está vazio.`)
        return
      }
      if (genero && genero !== 'feminino' && genero !== 'masculino') {
        erros.push(`Linha ${numeroLinha}: "genero_narrador" = "${genero}" inválido (use feminino, masculino ou deixe vazio).`)
        return
      }

      validas.push({
        [colunaFaixa]: faixa,
        cor,
        titulo: tituloLinha || null,
        texto: conteudo,
        genero_narrador: genero || null,
        audio_manual: false,
      })
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
    const { error } = await supabase.from(tabela).insert(validas)
    setImportando(false)

    if (error) {
      window.alert('Erro ao importar: ' + error.message)
      return
    }

    setResultado(`${validas.length} história(s) importada(s) com sucesso.`)
  }

  return (
    <div className="admin-import-box">
      {titulo && <h4 className="admin-import-box__title">{titulo}</h4>}
      <p className="form-hint">
        Colunas esperadas: <code>{colunaFaixa}</code>, <code>cor</code>, <code>titulo</code> (opcional),{' '}
        <code>texto</code>, <code>genero_narrador</code> (opcional: feminino/masculino).
      </p>

      <div className="admin-import-actions">
        <button type="button" className="btn btn--secundario" onClick={handleBaixarModelo}>
          <span className="btn-icon">⬇️</span> Baixar planilha modelo
        </button>

        <label className="btn btn--primary" style={{ margin: 0 }}>
          <span className="btn-icon">📂</span>
          <span>{importando ? 'Processando dados...' : 'Selecionar CSV preenchido'}</span>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleArquivo}
            disabled={importando}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      {resultado && <div className="admin-alert admin-alert--sucesso">{resultado}</div>}
    </div>
  )
}
