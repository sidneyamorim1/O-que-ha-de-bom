// Cache curto em memória; consultas simultâneas da mesma faixa compartilham a requisição.
export function criarCacheHistorias(buscar, { ttl = 60_000, agora = Date.now } = {}) {
  const dados = new Map()
  const pendentes = new Map()

  function consultar(faixa) {
    const entrada = dados.get(faixa)
    return entrada && entrada.expira > agora() ? entrada.historias : undefined
  }

  function carregar(faixa) {
    const historias = consultar(faixa)
    if (historias !== undefined) return Promise.resolve(historias)
    if (pendentes.has(faixa)) return pendentes.get(faixa)

    const pedido = Promise.resolve().then(() => buscar(faixa)).then((resultado) => {
      if (pendentes.get(faixa) === pedido) {
        dados.set(faixa, { historias: resultado, expira: agora() + ttl })
      }
      return resultado
    }).finally(() => {
      if (pendentes.get(faixa) === pedido) pendentes.delete(faixa)
    })
    pendentes.set(faixa, pedido)
    return pedido
  }

  function limpar() {
    dados.clear()
    pendentes.clear()
  }

  return { consultar, carregar, limpar }
}
