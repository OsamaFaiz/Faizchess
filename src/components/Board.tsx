import { useEffect, useMemo, useRef, useState } from 'react'
import { Chess, type Square } from 'chess.js'
import { BOARD_THEMES, type Color } from '../app/data'
import { useStore } from '../app/store'
import { Piece } from './Piece'
import { cx } from './ui'

type P = { id: number; type: string; color: Color; square: string }
const FILES = 'abcdefgh'
let uid = 1

function diff(prev: P[], next: Omit<P, 'id'>[]): P[] {
  const pool = [...prev]
  const out: (P | null)[] = next.map(() => null)
  const take = (i: number, pred: (p: P) => boolean, pick?: (c: P[]) => P | undefined) => {
    const cands = pool.filter(pred)
    const p = pick ? pick(cands) : cands[0]
    if (!p) return
    pool.splice(pool.indexOf(p), 1)
    out[i] = { ...p, ...next[i] }
  }
  const dist = (a: string, b: string) => Math.abs(a.charCodeAt(0) - b.charCodeAt(0)) + Math.abs(+a[1] - +b[1])
  next.forEach((n, i) => take(i, (p) => p.square === n.square && p.type === n.type && p.color === n.color))
  const nearest = (sq: string) => (c: P[]) => c.sort((a, b) => dist(a.square, sq) - dist(b.square, sq))[0]
  next.forEach((n, i) => !out[i] && take(i, (p) => p.type === n.type && p.color === n.color, nearest(n.square)))
  next.forEach((n, i) => !out[i] && take(i, (p) => p.type === 'p' && p.color === n.color, nearest(n.square)))
  return next.map((n, i) => out[i] ?? { ...n, id: uid++ })
}

export type BoardProps = {
  fen: string
  orientation?: Color
  movable?: Color[]
  onMove?: (from: string, to: string, promotion?: string) => boolean | void
  lastMove?: { from: string; to: string } | null
  hint?: { from: string; to: string } | null
  highlight?: string[]
  className?: string
  rounded?: boolean
}

export function Board({ fen, orientation = 'w', movable = [], onMove, lastMove, hint, highlight = [], className, rounded = true }: BoardProps) {
  const { settings } = useStore()
  const theme = BOARD_THEMES.find((t) => t.id === settings.board) ?? BOARD_THEMES[0]
  const chess = useMemo(() => new Chess(fen), [fen])
  const prevRef = useRef<P[]>([])
  const pieces = useMemo(() => {
    const list: Omit<P, 'id'>[] = []
    chess.board().forEach((row) => row.forEach((p) => p && list.push({ type: p.type, color: p.color, square: p.square })))
    const res = diff(prevRef.current, list)
    prevRef.current = res
    return res
  }, [chess])

  const [sel, setSel] = useState<string | null>(null)
  const [promo, setPromo] = useState<{ from: string; to: string } | null>(null)
  useEffect(() => { setSel(null); setPromo(null) }, [fen])

  const turn = chess.turn()
  const canMove = movable.includes(turn)
  const targets = useMemo(() => (sel ? chess.moves({ square: sel as Square, verbose: true }) : []), [sel, chess])
  const checkSq = chess.inCheck() ? pieces.find((p) => p.type === 'k' && p.color === turn)?.square : null

  const pos = (sq: string) => {
    const f = FILES.indexOf(sq[0]), r = +sq[1]
    return orientation === 'w' ? { c: f, r: 8 - r } : { c: 7 - f, r: r - 1 }
  }
  const sqAt = (c: number, r: number) => (orientation === 'w' ? FILES[c] + (8 - r) : FILES[7 - c] + (r + 1))

  const click = (sq: string) => {
    if (!canMove || promo) return
    const piece = chess.get(sq as Square)
    const t = targets.find((m) => m.to === sq)
    if (sel && t) {
      if (t.promotion) {
        if (settings.autoQueen) { onMove?.(sel, sq, 'q'); setSel(null) } else setPromo({ from: sel, to: sq })
        return
      }
      onMove?.(sel, sq)
      setSel(null)
      return
    }
    if (piece && piece.color === turn) setSel(sq === sel ? null : sq)
    else setSel(null)
  }

  return (
    <div className={cx('relative aspect-square w-full select-none overflow-hidden', rounded && 'rounded-[14px]', className)} style={{ containerType: 'inline-size' }}>
      <div className="grid h-full w-full grid-cols-8 grid-rows-8">
        {Array.from({ length: 64 }, (_, i) => {
          const c = i % 8, r = Math.floor(i / 8)
          const sq = sqAt(c, r)
          const light = (c + r) % 2 === 0
          const tgt = targets.find((m) => m.to === sq)
          const isLast = lastMove && (lastMove.from === sq || lastMove.to === sq)
          const isHint = hint && (hint.from === sq || hint.to === sq)
          return (
            <div key={sq} onClick={() => click(sq)} role={onMove ? 'button' : undefined} aria-label={sq} className={cx('relative', canMove && 'cursor-pointer')} style={{ background: light ? theme.light : theme.dark }}>
              {isLast && <span className="absolute inset-0 bg-[#f5d06a]/45" />}
              {highlight.includes(sq) && <span className="absolute inset-0 bg-sky-400/35" />}
              {sel === sq && <span className="absolute inset-0 bg-[#f7c948]/60 ring-[3px] ring-inset ring-[#f2b632]" />}
              {checkSq === sq && <span className="absolute inset-0" style={{ background: 'radial-gradient(circle, rgba(255,60,60,0.95) 0%, rgba(230,40,40,0.55) 40%, transparent 72%)' }} />}
              {isHint && <span className="absolute inset-[6%] rounded-md ring-[3px] ring-[#2fd27a]" />}
              {tgt && settings.showLegal && (tgt.captured ? <span className="absolute inset-[5%] rounded-full ring-[4px] ring-black/25" /> : <span className="absolute left-1/2 top-1/2 h-[30%] w-[30%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/25" />)}
              {settings.showCoords && c === 0 && <span className="absolute left-[4%] top-[2%] text-[2.6cqw] font-bold" style={{ color: light ? theme.dark : theme.light }}>{sq[1]}</span>}
              {settings.showCoords && r === 7 && <span className="absolute bottom-[1%] right-[5%] text-[2.6cqw] font-bold" style={{ color: light ? theme.dark : theme.light }}>{sq[0]}</span>}
            </div>
          )
        })}
      </div>
      <div className="pointer-events-none absolute inset-0">
        {pieces.map((p) => {
          const { c, r } = pos(p.square)
          return (
            <div key={p.id} className="absolute left-0 top-0 grid h-[12.5%] w-[12.5%] place-items-center transition-transform duration-[260ms] ease-[cubic-bezier(.2,.8,.2,1)]" style={{ transform: `translate(${c * 100}%, ${r * 100}%)`, fontSize: '10.4cqw' }}>
              <span className={cx('transition-transform duration-150', sel === p.square && 'scale-110 -translate-y-[3%]')}><Piece type={p.type} color={p.color} style={settings.pieces} /></span>
            </div>
          )
        })}
      </div>
      {promo && (
        <div className="absolute inset-0 z-10 grid place-items-center bg-black/55 backdrop-blur-[1px]">
          <div className="anim-pop rounded-3xl bg-panel p-4 text-center shadow-2xl ring-1 ring-line">
            <p className="mb-3 text-sm font-bold text-ink">Promote pawn to</p>
            <div className="flex gap-2">
              {['q', 'r', 'b', 'n'].map((t) => (
                <button key={t} onClick={() => { onMove?.(promo.from, promo.to, t); setPromo(null); setSel(null) }} className="grid h-16 w-16 place-items-center rounded-2xl bg-surface text-[44px] ring-1 ring-line transition hover:ring-gold active:scale-95" aria-label={`Promote to ${t}`}>
                  <Piece type={t} color={turn} style={settings.pieces} />
                </button>
              ))}
            </div>
            <button onClick={() => setPromo(null)} className="mt-3 text-xs font-bold text-muted">Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}
