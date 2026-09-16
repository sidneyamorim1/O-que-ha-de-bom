import test from 'node:test'
import assert from 'node:assert/strict'
import { criarCacheHistorias } from './historiasCache.js'

test('antecipação e abertura simultâneas compartilham uma busca', async () => {
  let chamadas = 0
  const historias = [{ id: '1', cor: 'azul' }, { id: '2', cor: 'verde' }]
  const cache = criarCacheHistorias(async () => { chamadas++; return historias })
  const [antecipadas, abertas] = await Promise.all([cache.carregar('10-16'), cache.carregar('10-16')])
  assert.equal(chamadas, 1)
  assert.deepEqual(antecipadas, historias)
  assert.deepEqual(abertas, historias)
  await cache.carregar('10-16')
  assert.equal(chamadas, 1)
})

test('faixas etárias diferentes não compartilham histórias', async () => {
  const cache = criarCacheHistorias(async (faixa) => [{ id: faixa }])
  await Promise.all([cache.carregar('10-16'), cache.carregar('31-40')])
  assert.deepEqual(cache.consultar('10-16'), [{ id: '10-16' }])
  assert.deepEqual(cache.consultar('31-40'), [{ id: '31-40' }])
})

test('dados expiram e são atualizados após o prazo', async () => {
  let tempo = 0
  let versao = 0
  const cache = criarCacheHistorias(async () => [{ id: ++versao }], { ttl: 60, agora: () => tempo })
  await cache.carregar('10-16')
  tempo = 59
  assert.deepEqual(cache.consultar('10-16'), [{ id: 1 }])
  tempo = 60
  assert.equal(cache.consultar('10-16'), undefined)
  assert.deepEqual(await cache.carregar('10-16'), [{ id: 2 }])
})

test('falha na antecipação permite nova tentativa na abertura', async () => {
  let chamadas = 0
  const cache = criarCacheHistorias(async () => {
    if (++chamadas === 1) throw new Error('Sem conexão')
    return [{ id: '1' }]
  })
  await assert.rejects(cache.carregar('10-16'), /Sem conexão/)
  assert.equal(cache.consultar('10-16'), undefined)
  assert.deepEqual(await cache.carregar('10-16'), [{ id: '1' }])
})

test('resultado vazio também é reutilizado', async () => {
  let chamadas = 0
  const cache = criarCacheHistorias(async () => { chamadas++; return [] })
  await cache.carregar('10-16')
  assert.deepEqual(cache.consultar('10-16'), [])
  await cache.carregar('10-16')
  assert.equal(chamadas, 1)
})

test('edição invalida os dados e impede uma busca antiga de repor o cache', async () => {
  const resolver = []
  const cache = criarCacheHistorias(() => new Promise((resolve) => resolver.push(resolve)))
  const antiga = cache.carregar('10-16')
  await Promise.resolve()
  cache.limpar()
  const nova = cache.carregar('10-16')
  await Promise.resolve()
  resolver[1]([{ id: 'atualizada' }])
  await nova
  resolver[0]([{ id: 'antiga' }])
  await antiga
  assert.deepEqual(cache.consultar('10-16'), [{ id: 'atualizada' }])
  cache.limpar()
  assert.equal(cache.consultar('10-16'), undefined)
})
