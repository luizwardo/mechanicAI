import { writeFile } from 'node:fs/promises'

const TEXT = 'https://luizwardo.github.io/mechanicAI/'
const SIZE = 29
const DATA_LEN = 44
const ECC_LEN = 26

const EXP = new Uint8Array(512)
const LOG = new Uint8Array(256)
{
  let x = 1
  for (let i = 0; i < 255; i += 1) {
    EXP[i] = x
    LOG[x] = i
    x <<= 1
    if (x & 0x100) x ^= 0x11d
  }
  for (let i = 255; i < 512; i += 1) EXP[i] = EXP[i - 255]
}

function mul(a, b) {
  if (a === 0 || b === 0) return 0
  return EXP[LOG[a] + LOG[b]]
}

function rsGenerator(length) {
  let poly = [1]
  for (let i = 0; i < length; i += 1) {
    const next = new Array(poly.length + 1).fill(0)
    for (let j = 0; j < poly.length; j += 1) {
      next[j] ^= poly[j]
      next[j + 1] ^= mul(poly[j], EXP[i])
    }
    poly = next
  }
  return poly
}

function rsRemainder(data, generator) {
  const result = data.concat(new Array(generator.length - 1).fill(0))
  for (let i = 0; i < data.length; i += 1) {
    const factor = result[i]
    if (!factor) continue
    for (let j = 0; j < generator.length; j += 1) result[i + j] ^= mul(generator[j], factor)
  }
  return result.slice(data.length)
}

function dataBytes(text) {
  const payload = [...new TextEncoder().encode(text)]
  const bits = []
  const push = (value, length) => {
    for (let i = length - 1; i >= 0; i -= 1) bits.push((value >>> i) & 1)
  }
  push(0b0100, 4)
  push(payload.length, 8)
  for (const byte of payload) push(byte, 8)
  const maxBits = DATA_LEN * 8
  for (let i = 0; i < 4 && bits.length < maxBits; i += 1) bits.push(0)
  while (bits.length % 8 !== 0) bits.push(0)
  const out = []
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0
    for (let j = 0; j < 8; j += 1) byte = (byte << 1) | bits[i + j]
    out.push(byte)
  }
  const pads = [0xec, 0x11]
  let pad = 0
  while (out.length < DATA_LEN) {
    out.push(pads[pad])
    pad ^= 1
  }
  if (out.length !== DATA_LEN) throw new Error('URL longa demais para o QR')
  return out
}

function blank() {
  return {
    modules: Array.from({ length: SIZE }, () => Array(SIZE).fill(false)),
    func: Array.from({ length: SIZE }, () => Array(SIZE).fill(false)),
  }
}

function mark(grid, row, col, dark) {
  grid.modules[row][col] = dark
  grid.func[row][col] = true
}

function paintFinder(grid, row, col) {
  for (let r = -1; r <= 7; r += 1) {
    for (let c = -1; c <= 7; c += 1) {
      const y = row + r
      const x = col + c
      if (y < 0 || x < 0 || y >= SIZE || x >= SIZE) continue
      const border = r === -1 || c === -1 || r === 7 || c === 7
      const ring = r === 0 || c === 0 || r === 6 || c === 6
      const core = r >= 2 && r <= 4 && c >= 2 && c <= 4
      mark(grid, y, x, !border && (ring || core))
    }
  }
}

function build(codewords) {
  const grid = blank()
  paintFinder(grid, 0, 0)
  paintFinder(grid, 0, SIZE - 7)
  paintFinder(grid, SIZE - 7, 0)
  for (let i = 8; i < SIZE - 8; i += 1) {
    const on = i % 2 === 0
    mark(grid, 6, i, on)
    mark(grid, i, 6, on)
  }
  for (let r = -2; r <= 2; r += 1) {
    for (let c = -2; c <= 2; c += 1) mark(grid, 22 + r, 22 + c, Math.max(Math.abs(r), Math.abs(c)) !== 1)
  }
  for (let i = 0; i < 9; i += 1) {
    if (!grid.func[8][i]) mark(grid, 8, i, false)
    if (!grid.func[i][8]) mark(grid, i, 8, false)
  }
  for (let i = 0; i < 8; i += 1) {
    mark(grid, 8, SIZE - 1 - i, false)
    if (!grid.func[SIZE - 1 - i][8]) mark(grid, SIZE - 1 - i, 8, false)
  }
  mark(grid, SIZE - 8, 8, true)

  const bits = []
  for (const byte of codewords) {
    for (let i = 7; i >= 0; i -= 1) bits.push((byte >>> i) & 1)
  }
  let index = 0
  let upward = true
  for (let right = SIZE - 1; right >= 1; right -= 2) {
    if (right === 6) right -= 1
    for (let vert = 0; vert < SIZE; vert += 1) {
      const row = upward ? SIZE - 1 - vert : vert
      for (const col of [right, right - 1]) {
        if (grid.func[row][col]) continue
        grid.modules[row][col] = index < bits.length ? bits[index] === 1 : false
        index += 1
      }
    }
    upward = !upward
  }
  return grid
}

function maskBit(mask, row, col) {
  switch (mask) {
    case 0:
      return (row + col) % 2 === 0
    case 1:
      return row % 2 === 0
    case 2:
      return col % 3 === 0
    case 3:
      return (row + col) % 3 === 0
    case 4:
      return (Math.floor(row / 2) + Math.floor(col / 3)) % 2 === 0
    case 5:
      return ((row * col) % 2) + ((row * col) % 3) === 0
    case 6:
      return (((row * col) % 2) + ((row * col) % 3)) % 2 === 0
    default:
      return (((row + col) % 2) + ((row * col) % 3)) % 2 === 0
  }
}

function formatBits(mask) {
  let rem = mask << 10
  for (let i = 14; i >= 10; i -= 1) {
    if ((rem >>> i) & 1) rem ^= 0x537 << (i - 10)
  }
  return ((mask << 10) | (rem & 0x3ff)) ^ 0x5412
}

function drawFormat(modules, mask) {
  const bits = formatBits(mask)
  const bit = (i) => Boolean((bits >>> i) & 1)
  for (let i = 0; i <= 5; i += 1) modules[i][8] = bit(i)
  modules[7][8] = bit(6)
  modules[8][8] = bit(7)
  modules[8][7] = bit(8)
  for (let i = 9; i < 15; i += 1) modules[8][14 - i] = bit(i)
  for (let i = 0; i < 8; i += 1) modules[8][SIZE - 1 - i] = bit(i)
  for (let i = 8; i < 15; i += 1) modules[SIZE - 15 + i][8] = bit(i)
  modules[SIZE - 8][8] = true
}

function withMask(grid, mask) {
  const modules = grid.modules.map((row, r) =>
    row.map((cell, c) => (grid.func[r][c] || !maskBit(mask, r, c) ? cell : !cell)),
  )
  drawFormat(modules, mask)
  return modules
}

function penalty(modules) {
  let score = 0
  let blacks = 0
  for (let row = 0; row < SIZE; row += 1) {
    let run = 1
    for (let col = 0; col < SIZE; col += 1) {
      if (modules[row][col]) blacks += 1
      if (col === 0) continue
      if (modules[row][col] === modules[row][col - 1]) run += 1
      else {
        if (run >= 5) score += 3 + run - 5
        run = 1
      }
    }
    if (run >= 5) score += 3 + run - 5
  }
  for (let col = 0; col < SIZE; col += 1) {
    let run = 1
    for (let row = 1; row < SIZE; row += 1) {
      if (modules[row][col] === modules[row - 1][col]) run += 1
      else {
        if (run >= 5) score += 3 + run - 5
        run = 1
      }
    }
    if (run >= 5) score += 3 + run - 5
  }
  const percent = Math.abs(Math.trunc((blacks * 100) / (SIZE * SIZE)) - 50)
  return score + Math.trunc(percent / 5) * 10
}

function readBytes(modules, func) {
  const bits = []
  let upward = true
  for (let right = SIZE - 1; right >= 1; right -= 2) {
    if (right === 6) right -= 1
    for (let vert = 0; vert < SIZE; vert += 1) {
      const row = upward ? SIZE - 1 - vert : vert
      for (const col of [right, right - 1]) {
        if (func[row][col]) continue
        bits.push(modules[row][col] ? 1 : 0)
      }
    }
    upward = !upward
  }
  const bytes = []
  for (let i = 0; i + 8 <= bits.length && bytes.length < DATA_LEN + ECC_LEN; i += 8) {
    let byte = 0
    for (let j = 0; j < 8; j += 1) byte = (byte << 1) | bits[i + j]
    bytes.push(byte)
  }
  return bytes
}

function decode(modules, func, mask) {
  const raw = modules.map((row, r) =>
    row.map((cell, c) => (func[r][c] || !maskBit(mask, r, c) ? cell : !cell)),
  )
  const bytes = readBytes(raw, func)
  const data = bytes.slice(0, DATA_LEN)
  const ecc = bytes.slice(DATA_LEN, DATA_LEN + ECC_LEN)
  const remainder = rsRemainder(data, rsGenerator(ECC_LEN))
  if (remainder.some((byte, index) => byte !== ecc[index])) throw new Error('código corretor do QR não fecha')
  const bits = []
  for (const byte of data) for (let i = 7; i >= 0; i -= 1) bits.push((byte >>> i) & 1)
  const mode = bits.slice(0, 4).reduce((acc, bit) => (acc << 1) | bit, 0)
  if (mode !== 0b0100) throw new Error('modo do QR inesperado')
  const length = bits.slice(4, 12).reduce((acc, bit) => (acc << 1) | bit, 0)
  const chars = []
  for (let i = 0; i < length; i += 1) {
    chars.push(bits.slice(12 + i * 8, 20 + i * 8).reduce((acc, bit) => (acc << 1) | bit, 0))
  }
  return new TextDecoder().decode(Uint8Array.from(chars))
}

function toSvg(modules) {
  const cell = 8
  const quiet = 4
  const span = (SIZE + quiet * 2) * cell
  let rects = ''
  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) {
      if (!modules[row][col]) continue
      rects += `<rect x="${(col + quiet) * cell}" y="${(row + quiet) * cell}" width="${cell}" height="${cell}"/>`
    }
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${span} ${span}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/>${rects}</svg>\n`
}

if (formatBits(0) !== 0b101010000010010) throw new Error('bits de formato divergiram')

const data = dataBytes(TEXT)
const grid = build(data.concat(rsRemainder(data, rsGenerator(ECC_LEN))))
let best = null
let bestMask = 0
let bestScore = Infinity
for (let mask = 0; mask < 8; mask += 1) {
  const modules = withMask(grid, mask)
  const score = penalty(modules)
  if (score < bestScore) {
    best = modules
    bestMask = mask
    bestScore = score
  }
}
const payload = decode(best, grid.func, bestMask)
if (payload !== TEXT) throw new Error(`QR decodificou ${payload}`)

await writeFile(new URL('../public/qr.svg', import.meta.url), toSvg(best))
console.log('QR ok')
