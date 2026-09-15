export const FAIXAS_ETARIAS = [
  { value: '10-16', label: '10 a 16', emoji: '🧒', hint: 'Jovens exploradores' },
  { value: '17-20', label: '17 a 20', emoji: '🎓', hint: 'Novos caminhos' },
  { value: '21-30', label: '21 a 30', emoji: '🚀', hint: 'Conquistando o mundo' },
  { value: '31-40', label: '31 a 40', emoji: '💪', hint: 'Força e experiência' },
  { value: '41-50', label: '41 a 50', emoji: '🌟', hint: 'Brilho da maturidade' },
  { value: '51-60', label: '51 a 60', emoji: '🏆', hint: 'Sabedoria e vitórias' },
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
