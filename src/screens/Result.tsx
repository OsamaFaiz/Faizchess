import { ArrowDownRight, ArrowUpRight, Clock, Home, Plus, RotateCcw, Search, Sword, Target, Zap } from 'lucide-react'
import { useStore } from '../app/store'
import { Piece } from '../components/Piece'
import { Avatar, Btn, Card, cx, fmtDur } from '../components/ui'

export function Result() {
  const { result: r, startGame, go, reset, rating } = useStore()
  if (!r) return null
  const c = r.config
  const local = r.mode === 'local'
  const headline = r.winner === 'draw' ? 'Draw' : local ? `${(r.winner === 'w' ? c.white : c.black).name.split(' ')[0]} Wins` : r.result === 'win' ? 'Victory' : 'Defeat'
  const tone = r.winner === 'draw' ? 'draw' : local || r.result === 'win' ? 'win' : 'loss'
  const summary =
    r.winner === 'draw'
      ? `A balanced battle that ended by ${r.reason.toLowerCase()} after ${r.moves} moves.`
      : `${(r.winner === 'w' ? c.white : c.black).name.split(' ')[0]} won by ${r.reason.toLowerCase()} in ${r.moves} moves, with ${r.captures[r.winner]} captures and ${r.checks} checks in the game.`

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full opacity-40" style={{ background: tone === 'loss' ? 'conic-gradient(from 0deg, transparent, rgba(228,107,107,.35), transparent 30%)' : 'repeating-conic-gradient(from 0deg, rgba(214,168,95,.35) 0deg 8deg, transparent 8deg 22deg)', animation: 'spin-slow 40s linear infinite', maskImage: 'radial-gradient(circle, black 20%, transparent 65%)' }} />
      <div className="no-scrollbar relative flex-1 overflow-y-auto px-5 pb-4 pt-10">
        <div className="anim-pop flex flex-col items-center text-center">
          <div className={cx('grid h-28 w-28 place-items-center rounded-full text-[80px] ring-4', tone === 'loss' ? 'bg-loss/10 ring-loss/30' : 'gold-grad ring-gold/30')}>
            <Piece type={tone === 'draw' ? 'q' : 'k'} color={tone === 'loss' ? 'b' : 'w'} style={tone === 'loss' ? 'classic' : 'gilded'} />
          </div>
          <h1 className={cx('mt-5 font-display text-[44px] font-bold leading-none', tone === 'loss' ? 'text-ink' : 'text-gold')}>{headline}</h1>
          <p className="mt-2 text-sm font-semibold text-muted">by {r.reason} · {r.winner === 'draw' ? '½–½' : r.winner === 'w' ? '1–0' : '0–1'}</p>
        </div>

        <Card className="anim-fade mt-7 flex items-center justify-between">
          {(['w', 'b'] as const).map((col, i) => {
            const p = col === 'w' ? c.white : c.black
            const won = r.winner === col
            return (
              <div key={col} className={cx('flex flex-1 items-center gap-3', i > 0 && 'flex-row-reverse text-right')}>
                <Avatar initials={p.initials} hue={p.hue} size={46} ring={won} />
                <div className="min-w-0">
                  <p className="truncate font-bold">{p.name.split(' · ')[0]}</p>
                  <p className="text-xs text-muted">{col === 'w' ? 'White' : 'Black'}{p.rating ? ` · ${p.rating}` : ''}</p>
                </div>
              </div>
            )
          })}
        </Card>

        <div className="anim-fade mt-3 grid grid-cols-3 gap-3" style={{ animationDelay: '80ms' }}>
          {[[Clock, 'Duration', fmtDur(r.duration)], [Sword, 'Moves', r.moves], [Zap, 'Time', r.time === '∞' ? 'None' : r.time]].map(([I, k, v]: any) => (
            <Card key={k} className="p-3 text-center"><I size={18} className="mx-auto text-gold" /><p className="mt-1.5 text-[17px] font-extrabold tnum">{v}</p><p className="text-[11px] text-muted">{k}</p></Card>
          ))}
        </div>

        {r.delta !== null && (
          <Card className="anim-fade mt-3 flex items-center gap-4" >
            <span className={cx('grid h-12 w-12 place-items-center rounded-2xl', r.delta >= 0 ? 'bg-win/15 text-win' : 'bg-loss/15 text-loss')}>{r.delta >= 0 ? <ArrowUpRight /> : <ArrowDownRight />}</span>
            <div className="flex-1"><p className="text-xs font-bold uppercase tracking-wider text-muted">Rating change</p><p className="text-xl font-extrabold tnum">{rating} <span className={r.delta >= 0 ? 'text-win' : 'text-loss'}>({r.delta >= 0 ? '+' : ''}{r.delta})</span></p></div>
          </Card>
        )}

        <Card className="anim-fade mt-3">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted"><Target size={14} className="text-gold" />Game summary</p>
          <p className="mt-2 text-sm leading-relaxed">{summary}</p>
        </Card>
      </div>
      <div className="relative space-y-2 border-t border-line bg-panel/80 px-5 py-4 backdrop-blur">
        <div className="grid grid-cols-2 gap-2">
          <Btn icon={<RotateCcw size={18} />} onClick={() => startGame(c)}>Rematch</Btn>
          <Btn variant="surface" icon={<Search size={18} />} onClick={() => go('review', { match: r })}>Review Game</Btn>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Btn variant="outline" icon={<Plus size={18} />} onClick={() => reset('play')}>New Game</Btn>
          <Btn variant="outline" icon={<Home size={18} />} onClick={() => reset('home')}>Home</Btn>
        </div>
      </div>
    </div>
  )
}
