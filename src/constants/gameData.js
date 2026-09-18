import { supabase } from '../lib/supabaseClient'

export const FAIXAS_ETARIAS = [
  { value: '10-16', label: '10 a 16', emoji: '🧒', hint: 'Jovens exploradores' },
  { value: '17-20', label: '17 a 20', emoji: '🎓', hint: 'Novos caminhos' },
  { value: '21-30', label: '21 a 30', emoji: '🚀', hint: 'Conquistando o mundo' },
  { value: '31-40', label: '31 a 40', emoji: '💪', hint: 'Força e experiência' },
  { value: '41-50', label: '41 a 50', emoji: '🌟', hint: 'Brilho da maturidade' },
  { value: '51-60', label: '51 a 60', emoji: '🏆', hint: 'Sabedoria e vitórias' },
]

export const PAPEIS_USUARIO = [
  { value: 'admin', label: 'Admin' },
  { value: 'professor', label: 'Professor' },
  { value: 'aluno', label: 'Aluno' },
]

export const FAIXAS_PROFESSOR = [
  { value: '12-35', label: '12 a 35' },
  { value: '35-40', label: '35 a 40' },
]

export const GENEROS_NARRADOR = [
  { value: 'feminino', label: 'Feminino' },
  { value: 'masculino', label: 'Masculino' },
]

export const CORES = [
  { value: 'azul', label: 'Azul', hex: '#009FE3' },
  { value: 'amarelo', label: 'Amarelo', hex: '#F0D400' },
  { value: 'vermelho', label: 'Vermelho', hex: '#E30613' },
  { value: 'roxo', label: 'Roxo', hex: '#4B2E83' },
  { value: 'verde', label: 'Verde', hex: '#A9C90B' },
  { value: 'laranja', label: 'Laranja', hex: '#F08A00' },
]

export function labelFaixaEtaria(value) {
  return FAIXAS_ETARIAS.find((f) => f.value === value)?.label ?? value
}

export function corInfo(value) {
  return CORES.find((c) => c.value === value)
}

export function labelFaixaProfessor(value) {
  return FAIXAS_PROFESSOR.find((f) => f.value === value)?.label ?? value
}

export function labelPapel(value) {
  return PAPEIS_USUARIO.find((p) => p.value === value)?.label ?? value
}

export function labelGeneroNarrador(value) {
  return GENEROS_NARRADOR.find((g) => g.value === value)?.label ?? value
}

// Vozes Chirp3-HD (Google Cloud Text-to-Speech) em pt-BR — a camada mais realista disponível.
export const VOZES_TTS = [
  { name: 'pt-BR-Chirp3-HD-Achernar', genero: 'Feminina' },
  { name: 'pt-BR-Chirp3-HD-Achird', genero: 'Masculina' },
  { name: 'pt-BR-Chirp3-HD-Algenib', genero: 'Masculina' },
  { name: 'pt-BR-Chirp3-HD-Algieba', genero: 'Masculina' },
  { name: 'pt-BR-Chirp3-HD-Alnilam', genero: 'Masculina' },
  { name: 'pt-BR-Chirp3-HD-Aoede', genero: 'Feminina' },
  { name: 'pt-BR-Chirp3-HD-Autonoe', genero: 'Feminina' },
  { name: 'pt-BR-Chirp3-HD-Callirrhoe', genero: 'Feminina' },
  { name: 'pt-BR-Chirp3-HD-Charon', genero: 'Masculina' },
  { name: 'pt-BR-Chirp3-HD-Despina', genero: 'Feminina' },
  { name: 'pt-BR-Chirp3-HD-Enceladus', genero: 'Masculina' },
  { name: 'pt-BR-Chirp3-HD-Erinome', genero: 'Feminina' },
  { name: 'pt-BR-Chirp3-HD-Fenrir', genero: 'Masculina' },
  { name: 'pt-BR-Chirp3-HD-Gacrux', genero: 'Feminina' },
  { name: 'pt-BR-Chirp3-HD-Iapetus', genero: 'Masculina' },
  { name: 'pt-BR-Chirp3-HD-Kore', genero: 'Feminina' },
  { name: 'pt-BR-Chirp3-HD-Laomedeia', genero: 'Feminina' },
  { name: 'pt-BR-Chirp3-HD-Leda', genero: 'Feminina' },
  { name: 'pt-BR-Chirp3-HD-Orus', genero: 'Masculina' },
  { name: 'pt-BR-Chirp3-HD-Puck', genero: 'Masculina' },
  { name: 'pt-BR-Chirp3-HD-Pulcherrima', genero: 'Feminina' },
  { name: 'pt-BR-Chirp3-HD-Rasalgethi', genero: 'Masculina' },
  { name: 'pt-BR-Chirp3-HD-Sadachbia', genero: 'Masculina' },
  { name: 'pt-BR-Chirp3-HD-Sadaltager', genero: 'Masculina' },
  { name: 'pt-BR-Chirp3-HD-Schedar', genero: 'Masculina' },
  { name: 'pt-BR-Chirp3-HD-Sulafat', genero: 'Feminina' },
  { name: 'pt-BR-Chirp3-HD-Umbriel', genero: 'Masculina' },
  { name: 'pt-BR-Chirp3-HD-Vindemiatrix', genero: 'Feminina' },
  { name: 'pt-BR-Chirp3-HD-Zephyr', genero: 'Feminina' },
  { name: 'pt-BR-Chirp3-HD-Zubenelgenubi', genero: 'Masculina' },
]

const VOZ_FEMININA_PADRAO = VOZES_TTS.find((v) => v.genero === 'Feminina')?.name ?? VOZES_TTS[0].name
const VOZ_MASCULINA_PADRAO = VOZES_TTS.find((v) => v.genero === 'Masculina')?.name ?? VOZES_TTS[0].name

export const CONTEXTOS_VOZ = [
  { value: 'aluno', label: 'Alunos' },
  { value: 'professor', label: 'Professores' },
]

function colunaVoz(generoNarrador, contexto) {
  const genero = generoNarrador === 'masculino' ? 'masculino' : 'feminino'
  const publico = contexto === 'professor' ? 'professor' : 'aluno'
  return `${publico}_${genero}`
}

// Preferência de voz: uma dupla feminina/masculina pra alunos e outra pra professores — e igual
// em qualquer computador/navegador usado pra administrar (guardada no Supabase, não no
// localStorage, já que o app roda em vários PCs de escola).
export async function carregarVozesConfig() {
  const vazio = { aluno_feminino: null, aluno_masculino: null, professor_feminino: null, professor_masculino: null }
  const { data, error } = await supabase
    .from('configuracoes_vozes')
    .select('aluno_feminino, aluno_masculino, professor_feminino, professor_masculino')
    .eq('id', true)
    .maybeSingle()
  if (error || !data) return vazio
  return { ...vazio, ...data }
}

// Voz configurada pro gênero de narrador (feminino/masculino) e público (aluno/professor)
// informados. Sem valor salvo, cai na voz feminina padrão do catálogo.
export async function getVozPreferida(generoNarrador, contexto = 'aluno') {
  const config = await carregarVozesConfig()
  const salva = config[colunaVoz(generoNarrador, contexto)]
  if (salva) return salva
  return generoNarrador === 'masculino' ? VOZ_MASCULINA_PADRAO : VOZ_FEMININA_PADRAO
}

export async function setVozPreferida(nomeVoz, generoNarrador, contexto = 'aluno') {
  const coluna = colunaVoz(generoNarrador, contexto)
  const { error } = await supabase.from('configuracoes_vozes').update({ [coluna]: nomeVoz }).eq('id', true)
  if (error) throw error
}

export function labelVoz(nomeVoz) {
  const voz = VOZES_TTS.find((v) => v.name === nomeVoz)
  const nomeCurto = nomeVoz.replace('pt-BR-Chirp3-HD-', '')
  return voz ? `${nomeCurto} — ${voz.genero}` : nomeCurto
}
