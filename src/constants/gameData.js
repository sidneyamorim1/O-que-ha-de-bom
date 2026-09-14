export const FAIXAS_ETARIAS = [
  { value: '10-16', label: '10 a 16' },
  { value: '17-20', label: '17 a 20' },
  { value: '21-30', label: '21 a 30' },
  { value: '31-40', label: '31 a 40' },
  { value: '41-50', label: '41 a 50' },
  { value: '51-60', label: '51 a 60' },
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
