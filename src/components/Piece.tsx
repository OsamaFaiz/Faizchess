import type { PieceStyleId } from '../app/data'

const FILLED: Record<string, string> = { k: '\u265A', q: '\u265B', r: '\u265C', b: '\u265D', n: '\u265E', p: '\u265F' }
const OUTLINE: Record<string, string> = { k: '\u2654', q: '\u2655', r: '\u2656', b: '\u2657', n: '\u2658', p: '\u2659' }
const VS = '\uFE0E'

const PALETTE: Record<PieceStyleId, { w: [string, string]; b: [string, string] }> = {
  classic: { w: ['#fbf6ea', '#2a2118'], b: ['#22252c', '#8b8f99'] },
  gilded: { w: ['#f1d39a', '#5a3d12'], b: ['#1a1c22', '#d6a85f'] },
  flat: { w: ['#ffffff', 'transparent'], b: ['#191b20', 'transparent'] },
}

/** Layered glyph piece: filled silhouette in body colour with outline glyph overlay for detail lines. */
export function Piece({ type, color, style = 'classic', size = '100%' }: { type: string; color: 'w' | 'b'; style?: PieceStyleId; size?: string | number }) {
  const [fill, line] = PALETTE[style][color]
  const fs = typeof size === 'number' ? size : undefined
  return (
    <span className="relative inline-block select-none font-piece leading-none" style={{ fontSize: fs ?? 'inherit', width: '1em', height: '1em' }} aria-label={`${color === 'w' ? 'White' : 'Black'} ${type}`}>
      <span className="absolute inset-0 text-center" style={{ color: fill, filter: `drop-shadow(0 2px 1.5px rgba(0,0,0,${style === 'flat' ? 0.45 : 0.35}))`, WebkitTextStroke: style === 'flat' ? `0.025em ${color === 'w' ? '#4a4a4a' : '#000'}` : undefined }}>
        {FILLED[type] + VS}
      </span>
      {line !== 'transparent' && <span className="absolute inset-0 text-center" style={{ color: line }}>{OUTLINE[type] + VS}</span>}
    </span>
  )
}
