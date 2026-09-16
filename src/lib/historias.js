import { supabase } from './supabaseClient'
import { criarCacheHistorias } from './historiasCache'

const cache = criarCacheHistorias(async (faixa) => {
  const historias = []
  const tamanhoPagina = 500
  for (let inicio = 0; ; inicio += tamanhoPagina) {
    const { data, error } = await supabase
      .from('historias')
      .select('id, cor, titulo, texto, audio_url, imagem_url')
      .eq('faixa_etaria', faixa)
      .order('id')
      .range(inicio, inicio + tamanhoPagina - 1)
    if (error) throw error
    historias.push(...(data ?? []))
    if (!data || data.length < tamanhoPagina) return historias
  }
})

export function anteciparHistorias(faixa) {
  // Uma falha na antecipação não impede o jogo; a tela da história tentará novamente.
  if (faixa) void cache.carregar(faixa).catch(() => {})
}

export function consultarHistorias(faixa, cor) {
  return cache.consultar(faixa)?.filter((historia) => historia.cor === cor)
}

export async function carregarHistorias(faixa, cor) {
  const historias = await cache.carregar(faixa)
  return historias.filter((historia) => historia.cor === cor)
}

export const limparCacheHistorias = cache.limpar
