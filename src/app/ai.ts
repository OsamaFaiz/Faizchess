import { Chess, type Move } from 'chess.js'
import type { LevelId } from './data'

const VAL: Record<string, number> = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 }
const center = (f: number, r: number) => 3.5 - Math.max(Math.abs(f - 3.5), Math.abs(r - 3.5))

/** Static evaluation in centipawns from White's perspective. */
export function evaluate(ch: Chess): number {
  let s = 0
  const b = ch.board()
  for (let r = 0; r < 8; r++)
    for (let f = 0; f < 8; f++) {
      const p = b[r][f]
      if (!p) continue
      let v = VAL[p.type]
      if (p.type === 'n' || p.type === 'b') v += center(f, r) * 10
      if (p.type === 'p') v += (p.color === 'w' ? 6 - r : r - 1) * 8 + (f >= 2 && f <= 5 ? center(f, r) * 4 : 0)
      if (p.type === 'q') v += center(f, r) * 3
      s += p.color === 'w' ? v : -v
    }
  return s
}

const order = (ms: Move[]) => ms.sort((a, b) => (b.captured ? VAL[b.captured] * 10 - VAL[b.piece] : 0) + (b.san.includes('+') ? 50 : 0) - ((a.captured ? VAL[a.captured] * 10 - VAL[a.piece] : 0) + (a.san.includes('+') ? 50 : 0)))

function search(ch: Chess, depth: number, alpha: number, beta: number, ply: number): number {
  const moves = ch.moves({ verbose: true })
  const sign = ch.turn() === 'w' ? 1 : -1
  if (moves.length === 0) return ch.inCheck() ? -100000 + ply : 0
  if (depth === 0) return sign * evaluate(ch)
  order(moves)
  let best = -Infinity
  for (const m of moves) {
    ch.move(m)
    const v = -search(ch, depth - 1, -beta, -alpha, ply + 1)
    ch.undo()
    if (v > best) best = v
    if (v > alpha) alpha = v
    if (alpha >= beta) break
  }
  return best
}

const CFG: Record<LevelId, { depth: number; noise: number; random: number }> = {
  beginner: { depth: 1, noise: 220, random: 0.45 },
  easy: { depth: 1, noise: 90, random: 0.15 },
  medium: { depth: 2, noise: 40, random: 0 },
  hard: { depth: 2, noise: 8, random: 0 },
  expert: { depth: 3, noise: 10, random: 0 },
  master: { depth: 3, noise: 0, random: 0 },
}

export function pickMove(fen: string, level: LevelId = 'medium'): Move | null {
  const ch = new Chess(fen)
  const moves = ch.moves({ verbose: true })
  if (!moves.length) return null
  const c = CFG[level]
  if (Math.random() < c.random) return moves[Math.floor(Math.random() * moves.length)]
  order(moves)
  let best: Move = moves[0]
  let bestV = -Infinity
  for (const m of moves) {
    ch.move(m)
    const v = -search(ch, c.depth - 1, -Infinity, Infinity, 1) + (Math.random() - 0.5) * c.noise
    ch.undo()
    if (v > bestV) { bestV = v; best = m }
  }
  return best
}
