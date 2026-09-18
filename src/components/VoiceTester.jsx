import { useEffect, useRef, useState } from 'react'
import { VOZES_TTS, GENEROS_NARRADOR, getVozPreferida, setVozPreferida, labelGeneroNarrador } from '../constants/gameData'
import { supabase } from '../lib/supabaseClient'
import { AUDIO_BUCKET, removeStorageFile, gerarAudioIA, uploadAudioFile } from '../lib/storage'

const TEXTO_PADRAO =
  'Eu sou o Cauã. Na aldeia dos meus avós, as vozes dos mais velhos são mais claras que qualquer sinal de Wi-Fi.'

const CONCORRENCIA = 4
const TABELA_POR_CONTEXTO = { aluno: 'historias', professor: 'historias_professores' }

function base64ParaBlobUrl(base64) {
  const bytes = atob(base64)
  const array = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) array[i] = bytes.charCodeAt(i)
  const blob = new Blob([array], { type: 'audio/mpeg' })
  return URL.createObjectURL(blob)
}

async function processarComConcorrencia(items, limite, worker) {
  let cursor = 0
  async function proximo() {
    while (cursor < items.length) {
      const item = items[cursor++]
      await worker(item)
    }
  }
  await Promise.all(Array.from({ length: Math.min(limite, items.length) }, proximo))
}

// Escolhe e testa as duas vozes padrão do app (feminina e masculina) pro público informado
// (aluno ou professor — cada um tem sua própria dupla de vozes), e permite aplicar a voz
// escolhida em massa às histórias já cadastradas daquele público/gênero.
export default function VoiceTester({ contexto = 'aluno', titulo = 'Configuração de Vozes Neurais (Chirp3-HD)' }) {
  const [vozFeminina, setVozFeminina] = useState(null)
  const [vozMasculina, setVozMasculina] = useState(null)
  const [texto, setTexto] = useState(TEXTO_PADRAO)
  const [testandoGenero, setTestandoGenero] = useState(null)
  const [erro, setErro] = useState(null)
  const [modal, setModal] = useState(null) // { step: 'confirm'|'progresso'|'resultado'|'info', ... }
  const audioRefFeminino = useRef(null)
  const audioRefMasculino = useRef(null)
  const blobUrlFeminino = useRef(null)
  const blobUrlMasculino = useRef(null)

  const tabela = TABELA_POR_CONTEXTO[contexto]

  useEffect(() => {
    let active = true
    setVozFeminina(null)
    setVozMasculina(null)
    Promise.all([getVozPreferida('feminino', contexto), getVozPreferida('masculino', contexto)]).then(([f, m]) => {
      if (!active) return
      setVozFeminina(f)
      setVozMasculina(m)
    })
    return () => {
      active = false
    }
  }, [contexto])

  function refsDoGenero(genero) {
    return genero === 'masculino'
      ? { audioRef: audioRefMasculino, blobRef: blobUrlMasculino }
      : { audioRef: audioRefFeminino, blobRef: blobUrlFeminino }
  }

  async function testar(genero, vozEscolhida) {
    if (!texto.trim()) return
    setTestandoGenero(genero)
    setErro(null)

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: texto, voice: vozEscolhida }),
      })
      const data = await res.json()

      if (!res.ok || !data.audioContent) {
        throw new Error(data.error || 'Falha ao gerar áudio')
      }

      const { audioRef, blobRef } = refsDoGenero(genero)
      if (blobRef.current) URL.revokeObjectURL(blobRef.current)
      const url = base64ParaBlobUrl(data.audioContent)
      blobRef.current = url

      if (audioRef.current) {
        audioRef.current.src = url
        await audioRef.current.play()
      }
    } catch (err) {
      setErro(err.message)
    } finally {
      setTestandoGenero(null)
    }
  }

  async function handleVozChange(genero, novaVoz) {
    if (genero === 'masculino') setVozMasculina(novaVoz)
    else setVozFeminina(novaVoz)
    try {
      await setVozPreferida(novaVoz, genero, contexto)
    } catch (err) {
      setErro('Não foi possível salvar a preferência de voz: ' + err.message)
    }
    testar(genero, novaVoz)
  }

  async function handleAplicarLote(genero) {
    const { data: historias, error } = await supabase
      .from(tabela)
      .select('id, texto, audio_url')
      .eq('genero_narrador', genero)
      .eq('audio_manual', false)

    if (error) {
      setModal({ step: 'info', titulo: 'Erro ao buscar histórias', texto: error.message })
      return
    }
    if (!historias || historias.length === 0) {
      setModal({
        step: 'info',
        titulo: 'Nada para regenerar',
        texto: `Nenhuma história com voz ${labelGeneroNarrador(genero).toLowerCase()} pra regenerar (as com MP3 manual não entram nessa lista).`,
      })
      return
    }

    setModal({ step: 'confirm', genero, historias })
  }

  async function confirmarAplicacaoLote() {
    const { genero, historias } = modal
    const voz = await getVozPreferida(genero, contexto)
    setModal({ step: 'progresso', genero, done: 0, total: historias.length })
    const falhas = []

    await processarComConcorrencia(historias, CONCORRENCIA, async (historia) => {
      try {
        const file = await gerarAudioIA(historia.texto, voz)
        const novaUrl = await uploadAudioFile(file)
        const { error: updateError } = await supabase.from(tabela).update({ audio_url: novaUrl }).eq('id', historia.id)
        if (updateError) throw updateError
        if (historia.audio_url) await removeStorageFile(historia.audio_url, AUDIO_BUCKET)
      } catch (err) {
        falhas.push(err.message)
      }
      setModal((m) => (m.step === 'progresso' ? { ...m, done: m.done + 1 } : m))
    })

    setModal({ step: 'resultado', genero, total: historias.length, falhas })
  }

  const processandoLote = modal?.step === 'progresso'

  return (
    <div className="voice-tester">
      <div className="voice-tester__header">
        <h3 className="admin-panel-title">{titulo}</h3>
        <p className="form-hint">
          Defina as vozes padrão feminina e masculina. Estas vozes serão aplicadas automaticamente ao
          salvar histórias sem áudio MP3 próprio.
        </p>
      </div>

      <label className="form-field form-field--full">
        <div className="form-field__header">
          <span>Frase de teste</span>
          <span className="form-field__count">Ouvir com entonação em português</span>
        </div>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={2}
          placeholder="Digite um texto para testar a dicção da voz..."
        />
      </label>

      {erro && <p className="mensagem mensagem--erro">{erro}</p>}

      {vozFeminina === null || vozMasculina === null ? (
        <p className="mensagem">Carregando configuração de vozes...</p>
      ) : (
      <div className="voice-tester__grid">
        {GENEROS_NARRADOR.map((g) => {
          const isMasc = g.value === 'masculino'
          const voz = isMasc ? vozMasculina : vozFeminina
          const audioRef = isMasc ? audioRefMasculino : audioRefFeminino
          return (
            <div key={g.value} className="voice-card">
              <div className="voice-card__header">
                <span className="voice-card__avatar">{isMasc ? '👨' : '👩'}</span>
                <div>
                  <h4 className="voice-card__title">Narrador {isMasc ? 'Masculino' : 'Feminino'}</h4>
                  <span className="voice-card__sub">Voz padrão selecionada</span>
                </div>
              </div>

              <label className="form-field">
                Voz Neural PT-BR
                <select value={voz} onChange={(e) => handleVozChange(g.value, e.target.value)}>
                  {VOZES_TTS.filter((v) => v.genero === (isMasc ? 'Masculina' : 'Feminina')).map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name.replace('pt-BR-Chirp3-HD-', '')}
                    </option>
                  ))}
                </select>
              </label>

              <div className="voice-card__actions">
                <button
                  type="button"
                  className="btn btn--primary btn--sm"
                  onClick={() => testar(g.value, voz)}
                  disabled={testandoGenero === g.value}
                >
                  {testandoGenero === g.value ? 'Gerando áudio...' : '▶ Testar dicção'}
                </button>
                <button
                  type="button"
                  className="btn btn--secundario btn--sm"
                  onClick={() => handleAplicarLote(g.value)}
                  disabled={processandoLote}
                  title="Regenera o áudio de todas as histórias já cadastradas com esse gênero de narrador"
                >
                  🔄 Aplicar em lote
                </button>
              </div>

              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <audio ref={audioRef} controls className="audio-player voice-tester__player" />
            </div>
          )
        })}
      </div>
      )}

      {modal?.step === 'confirm' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-icon">🎙️</div>
            <h2 className="modal-titulo">Regenerar narração?</h2>
            <p className="modal-texto">
              Gerar e substituir a narração de {modal.historias.length} história(s) com voz{' '}
              {labelGeneroNarrador(modal.genero).toLowerCase()}? Histórias com MP3 enviado manualmente não são
              afetadas. O áudio automático atual de cada uma (se houver) será substituído.
            </p>
            <div className="modal-acoes">
              <button type="button" className="btn btn--secundario" onClick={() => setModal(null)}>
                Cancelar
              </button>
              <button type="button" className="btn btn--primary" onClick={confirmarAplicacaoLote}>
                Sim, gerar
              </button>
            </div>
          </div>
        </div>
      )}

      {modal?.step === 'progresso' && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header-icon">🎙️</div>
            <h2 className="modal-titulo">Gerando narrações...</h2>
            <p className="modal-texto">
              {modal.done} de {modal.total} história(s) processadas. Isso pode levar alguns instantes.
            </p>
            <div className="modal-progress-bar">
              <div
                className="modal-progress-bar__fill"
                style={{ width: `${(modal.done / modal.total) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {modal?.step === 'resultado' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-icon">{modal.falhas.length === 0 ? '✅' : '⚠️'}</div>
            <h2 className="modal-titulo">
              {modal.falhas.length === 0 ? 'Pronto!' : 'Concluído com falhas'}
            </h2>
            <p className="modal-texto">
              {modal.total - modal.falhas.length} de {modal.total} história(s) atualizadas.
              {modal.falhas.length > 0 && (
                <>
                  <br />
                  {modal.falhas.length} falharam:
                  <br />
                  {modal.falhas.join('\n')}
                </>
              )}
            </p>
            <div className="modal-acoes">
              <button type="button" className="btn btn--primary" onClick={() => setModal(null)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {modal?.step === 'info' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-icon">ℹ️</div>
            <h2 className="modal-titulo">{modal.titulo}</h2>
            <p className="modal-texto">{modal.texto}</p>
            <div className="modal-acoes">
              <button type="button" className="btn btn--primary" onClick={() => setModal(null)}>
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
