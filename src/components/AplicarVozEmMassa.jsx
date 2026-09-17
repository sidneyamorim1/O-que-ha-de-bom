import { useState } from 'react'
import { GENEROS_NARRADOR, getVozPreferida, labelGeneroNarrador } from '../constants/gameData'
import { supabase } from '../lib/supabaseClient'
import { AUDIO_BUCKET, removeStorageFile, gerarAudioIA, uploadAudioFile } from '../lib/storage'

// Regenera o áudio de histórias já cadastradas (de uma tabela específica) com a voz padrão
// atual de cada gênero — sempre lida na hora do clique, nunca guardada em estado local, pra
// não ficar desatualizada em relação ao que está configurado em VoiceTester.
export default function AplicarVozEmMassa({ titulo, tabela }) {
  const [aplicandoGenero, setAplicandoGenero] = useState(null)
  const [progresso, setProgresso] = useState(null) // { done, total }

  async function handleAplicar(genero) {
    const voz = getVozPreferida(genero)
    const { data: historias, error } = await supabase
      .from(tabela)
      .select('id, texto, audio_url')
      .eq('genero_narrador', genero)
      .eq('audio_manual', false)

    if (error) {
      window.alert('Erro ao buscar histórias: ' + error.message)
      return
    }
    if (!historias || historias.length === 0) {
      window.alert(
        `Nenhuma história com voz ${labelGeneroNarrador(genero).toLowerCase()} pra regenerar (as com MP3 manual não entram nessa lista).`
      )
      return
    }

    const confirmado = window.confirm(
      `Gerar e substituir a narração de ${historias.length} história(s) com voz ${labelGeneroNarrador(
        genero
      ).toLowerCase()}? Histórias com MP3 enviado manualmente não são afetadas. O áudio automático atual de cada uma (se houver) será substituído.`
    )
    if (!confirmado) return

    setAplicandoGenero(genero)
    setProgresso({ done: 0, total: historias.length })
    const falhas = []

    for (const historia of historias) {
      try {
        const file = await gerarAudioIA(historia.texto, voz)
        const novaUrl = await uploadAudioFile(file)
        const { error: updateError } = await supabase.from(tabela).update({ audio_url: novaUrl }).eq('id', historia.id)
        if (updateError) throw updateError
        if (historia.audio_url) await removeStorageFile(historia.audio_url, AUDIO_BUCKET)
      } catch (err) {
        falhas.push(err.message)
      }
      setProgresso((p) => ({ done: p.done + 1, total: p.total }))
    }

    setAplicandoGenero(null)
    setProgresso(null)

    if (falhas.length === 0) {
      window.alert(`Pronto! ${historias.length} história(s) atualizadas.`)
    } else {
      window.alert(
        `${historias.length - falhas.length} de ${historias.length} atualizadas. ${falhas.length} falharam:\n` +
          falhas.join('\n')
      )
    }
  }

  return (
    <div className="admin-batch-card">
      <div className="admin-batch-card__header">
        <h4 className="admin-batch-card__title">{titulo}</h4>
        <span className="admin-batch-card__badge">Ação em lote</span>
      </div>
      <p className="admin-batch-card__desc">
        Gera novamente os arquivos de áudio para todas as histórias desta tabela que possuem o gênero configurado.
      </p>
      <div className="admin-batch-card__actions">
        {GENEROS_NARRADOR.map((g) => {
          const isMasc = g.value === 'masculino'
          return (
            <button
              key={g.value}
              type="button"
              className="btn btn--secundario btn--batch"
              onClick={() => handleAplicar(g.value)}
              disabled={aplicandoGenero !== null}
            >
              <span className="btn-icon">{isMasc ? '👨' : '👩'}</span>
              <span>
                {aplicandoGenero === g.value
                  ? `Processando... (${progresso?.done ?? 0}/${progresso?.total ?? 0})`
                  : `Regenerar voz ${isMasc ? 'masculina' : 'feminina'}`}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
