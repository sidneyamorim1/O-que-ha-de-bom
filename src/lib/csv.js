// Parser de CSV simples (RFC 4180): respeita campos entre aspas com vírgula/quebra de linha
// dentro, e "" como aspas escapadas. Evita depender de uma lib externa só pra isso.
export function parseCsv(texto) {
  const linhas = []
  let linha = []
  let campo = ''
  let dentroDeAspas = false
  let i = 0

  while (i < texto.length) {
    const char = texto[i]

    if (dentroDeAspas) {
      if (char === '"') {
        if (texto[i + 1] === '"') {
          campo += '"'
          i += 2
          continue
        }
        dentroDeAspas = false
        i++
        continue
      }
      campo += char
      i++
      continue
    }

    if (char === '"') {
      dentroDeAspas = true
      i++
      continue
    }
    if (char === ',') {
      linha.push(campo)
      campo = ''
      i++
      continue
    }
    if (char === '\r') {
      i++
      continue
    }
    if (char === '\n') {
      linha.push(campo)
      linhas.push(linha)
      linha = []
      campo = ''
      i++
      continue
    }
    campo += char
    i++
  }

  if (campo.length > 0 || linha.length > 0) {
    linha.push(campo)
    linhas.push(linha)
  }

  return linhas.filter((l) => !(l.length === 1 && l[0] === ''))
}

// Converte o CSV em objetos usando a primeira linha como cabeçalho.
export function parseCsvObjetos(texto) {
  const linhas = parseCsv(texto)
  if (linhas.length === 0) return []
  const cabecalho = linhas[0].map((h) => h.trim())
  return linhas.slice(1).map((linha) => {
    const obj = {}
    cabecalho.forEach((h, idx) => {
      obj[h] = (linha[idx] ?? '').trim()
    })
    return obj
  })
}

function escaparCampoCsv(campo) {
  const texto = String(campo ?? '')
  if (/[",\r\n]/.test(texto)) {
    return `"${texto.replace(/"/g, '""')}"`
  }
  return texto
}

// Monta um texto CSV a partir de linhas de arrays (a primeira geralmente é o cabeçalho).
export function paraCsv(linhas) {
  return linhas.map((linha) => linha.map(escaparCampoCsv).join(',')).join('\r\n')
}
