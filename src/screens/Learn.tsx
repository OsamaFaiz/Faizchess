import { BookOpen, ChevronRight, Crown, Flame, Puzzle, Sparkles, Swords } from 'lucide-react'
import { LESSONS } from '../app/lessons'
import { useStore } from '../app/store'
import { Board } from '../components/Board'
import { Piece } from '../components/Piece'
import { BottomNav, Card, Section } from '../components/ui'

const PIECES = [['pawn', 'p', 'Pawn'], ['knight', 'n', 'Knight'], ['bishop', 'b', 'Bishop'], ['rook', 'r', 'Rook'], ['queen', 'q', 'Queen'], ['king', 'k', 'King']]

export function Learn() {
  const { go } = useStore()
  const done = JSON.parse(localStorage.getItem('cm:lessons') || '[]') as string[]
  const List = ({ cat, icon: I }: { cat: string; icon: typeof Crown }) => (
    <Card className="p-2">
      {LESSONS.filter((l) => l.category === cat).map((l) => (
        <button key={l.id} onClick={() => go('lesson', { id: l.id })} className="flex w-full items-center gap-3 rounded-2xl px-2 py-2.5 text-left transition hover:bg-surface2/60">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold-soft text-gold"><I size={18} /></span>
          <span className="flex-1"><span className="block font-bold">{l.title}</span><span className="block text-xs text-muted">{l.steps.length} step{l.steps.length > 1 ? 's' : ''} · {l.minutes} min{done.includes(l.id) ? ' · Completed' : ''}</span></span>
          <ChevronRight size={18} className="text-muted" />
        </button>
      ))}
    </Card>
  )
  const pct = Math.round((done.length / LESSONS.length) * 100)
  return (
    <div className="flex h-full flex-col">
      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-6">
        <header className="pb-1 pt-5"><h1 className="font-display text-[30px] font-bold">Learn Chess</h1><p className="text-sm text-muted">Interactive lessons on a real board</p></header>
        <Card className="mt-4 flex items-center gap-4 bg-gradient-to-br from-surface to-panel">
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-wider text-muted">Your journey</p>
            <p className="mt-1 text-lg font-extrabold">{done.length} of {LESSONS.length} lessons</p>
            <div className="mt-3 h-2 rounded-full bg-surface2"><div className="gold-grad h-full rounded-full transition-all" style={{ width: `${Math.max(pct, 3)}%` }} /></div>
          </div>
          <button onClick={() => go('lesson', { id: 'rules' })} className="gold-grad grid h-14 w-14 place-items-center rounded-2xl text-[#171A21]" aria-label="Start rules lesson"><BookOpen /></button>
        </Card>

        <Card onClick={() => go('lesson', { id: 'daily' })} className="mt-3 flex items-center gap-4 p-3">
          <div className="pointer-events-none w-24 overflow-hidden rounded-xl"><Board fen={LESSONS.find((l) => l.id === 'daily')!.steps[0].fen} /></div>
          <div className="flex-1"><p className="flex items-center gap-1 text-xs font-extrabold text-gold"><Flame size={13} />DAILY CHALLENGE</p><p className="mt-1 font-bold">Mate in 2</p><p className="text-xs text-muted">Keep your 12-day streak alive</p></div>
          <ChevronRight className="text-muted" />
        </Card>

        <Section title="Basics"><List cat="Basics" icon={BookOpen} /></Section>
        <Section title="How the pieces move">
          <div className="grid grid-cols-3 gap-3">
            {PIECES.map(([id, t, n]) => (
              <Card key={id} onClick={() => go('lesson', { id })} className="flex flex-col items-center p-3">
                <span className="text-[44px] leading-none"><Piece type={t} color="w" /></span>
                <span className="mt-2 text-[13px] font-bold">{n}</span>
              </Card>
            ))}
          </div>
        </Section>
        <Section title="Special moves"><List cat="Special Moves" icon={Sparkles} /></Section>
        <Section title="Opening strategies"><List cat="Openings" icon={Swords} /></Section>
        <Section title="Checkmate patterns"><List cat="Checkmates" icon={Crown} /></Section>
        <Section title="Tactical puzzles"><List cat="Puzzles" icon={Puzzle} /></Section>
      </div>
      <BottomNav active="learn" />
    </div>
  )
}
